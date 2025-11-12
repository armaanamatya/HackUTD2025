from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any
from datetime import datetime

from app.schemas import ListingSearchRequest
from config.database import get_database
from app.utils.json_utils import clean_nan_values
from config.models import MarketListing

router = APIRouter()

@router.get("/listings")
async def get_market_listings(city: Optional[str] = None, state: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] = None, property_type: Optional[str] = None, status: Optional[str] = None, limit: int = 100, skip: int = 0):
    try:
        if get_database() is None:
            raise HTTPException(status_code=503, detail="Database not connected")
        filters: Dict[str, Any] = {}
        if city:
            filters["city"] = {"$regex": city, "$options": "i"}
        if state:
            filters["state"] = state.upper()
        if min_price is not None or max_price is not None:
            price_filter: Dict[str, Any] = {}
            if min_price is not None:
                price_filter["$gte"] = min_price
            if max_price is not None:
                price_filter["$lte"] = max_price
            filters["listing_price"] = price_filter
        if property_type:
            filters["property_type"] = property_type
        if status:
            filters["status"] = status
        cursor = MarketListing.find(filters).skip(skip).limit(limit)
        listings = await cursor.to_list()
        total_count = await MarketListing.find(filters).count()
        listings_dicts = [clean_nan_values(listing.dict()) for listing in listings]
        return {"listings": listings_dicts, "total_count": total_count, "returned_count": len(listings), "skip": skip, "limit": limit}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/listings/search")
async def search_listings(request: ListingSearchRequest):
    try:
        if get_database() is None:
            raise HTTPException(status_code=503, detail="Database not connected")
        search_filters = []
        if request.query:
            search_pattern = {"$regex": request.query, "$options": "i"}
            search_filters.append({"$or": [{"address": search_pattern}, {"city": search_pattern}, {"neighborhood": search_pattern}, {"zip_code": search_pattern}]})
        if request.filters:
            search_filters.append(request.filters)
        if search_filters:
            final_filter = {"$and": search_filters} if len(search_filters) > 1 else search_filters[0]
        else:
            final_filter = {}
        cursor = MarketListing.find(final_filter).limit(request.limit)
        listings = await cursor.to_list()
        listings_dicts = [clean_nan_values(listing.dict()) for listing in listings]
        return {"query": request.query, "results": listings_dicts, "count": len(listings)}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/listings/stats")
async def get_listing_stats():
    try:
        if get_database() is None:
            raise HTTPException(status_code=503, detail="Database not connected")
        total_listings = await MarketListing.count()
        pipeline = [{"$group": {"_id": "$city", "count": {"$sum": 1}, "avg_price": {"$avg": "$listing_price"}, "min_price": {"$min": "$listing_price"}, "max_price": {"$max": "$listing_price"}}}, {"$sort": {"count": -1}}, {"$limit": 10}]
        city_stats = await MarketListing.aggregate(pipeline).to_list()
        type_pipeline = [{"$group": {"_id": "$property_type", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
        type_stats = await MarketListing.aggregate(type_pipeline).to_list()
        city_stats_cleaned = clean_nan_values(city_stats)
        type_stats_cleaned = clean_nan_values(type_stats)
        return {"total_listings": total_listings, "top_cities": city_stats_cleaned, "property_types": type_stats_cleaned, "last_updated": datetime.utcnow().isoformat()}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
