from crewai_tools import FileReadTool, DirectoryReadTool, TavilySearchTool
import os
import requests
from typing import Type, List, Optional
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from dotenv import load_dotenv
import pathlib
import asyncio
import sys
from pathlib import Path

# Add config directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))

load_dotenv()


class PerplexitySearchInput(BaseModel):
    """Input schema for Perplexity search."""
    query: str = Field(..., description="The search query to research")


class PerplexitySearchTool(BaseTool):
    name: str = "perplexity_search"
    description: str = "Search using Perplexity AI for comprehensive research with sources and citations"
    args_schema: Type[BaseModel] = PerplexitySearchInput

    def _run(self, query: str) -> str:
        """Execute the Perplexity search."""
        api_key = os.getenv("PERPLEXITY_API_KEY")
        
        if not api_key:
            return "Perplexity API key not configured"
            
        try:
            url = "https://api.perplexity.ai/chat/completions"
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "llama-3.1-sonar-small-128k-online",
                "messages": [
                    {
                        "role": "system", 
                        "content": "You are a helpful research assistant. Provide comprehensive information with sources and citations."
                    },
                    {
                        "role": "user",
                        "content": f"Research and provide detailed information about: {query}"
                    }
                ],
                "max_tokens": 1500,
                "temperature": 0.2,
                "stream": False
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "No results found")
                return f"Perplexity Research Results:\n\n{content}"
            else:
                return f"Perplexity search failed with status: {response.status_code}"
                
        except Exception as e:
            return f"Perplexity search error: {str(e)}"




class WebPageFetchInput(BaseModel):
    """Input schema for fetching a web page."""
    url: str = Field(..., description="The full URL of the page to fetch")
    max_chars: int = Field(4000, description="Maximum characters of content to return")


class WebPageFetchTool(BaseTool):
    name: str = "fetch_web_page"
    description: str = (
        "Fetch a web page by URL and return the text content (truncated)."
    )
    args_schema: Type[BaseModel] = WebPageFetchInput

    def _run(self, url: str, max_chars: int = 4000) -> str:
        try:
            headers = {"User-Agent": "Mozilla/5.0"}
            resp = requests.get(url, headers=headers, timeout=20)
            if resp.status_code != 200:
                return f"Failed to fetch page. Status: {resp.status_code}"

            text = resp.text
            # Strip basic HTML tags for readability
            import re
            text_only = re.sub(r"<script[\s\S]*?</script>", " ", text, flags=re.IGNORECASE)
            text_only = re.sub(r"<style[\s\S]*?</style>", " ", text_only, flags=re.IGNORECASE)
            text_only = re.sub(r"<[^>]+>", " ", text_only)
            text_only = re.sub(r"\s+", " ", text_only).strip()
            if not text_only:
                return "No readable content found"
            return text_only[:max_chars]
        except Exception as e:
            return f"Error fetching page: {str(e)}"


class FileGlobInput(BaseModel):
    """Input schema for file globbing."""
    directory: str = Field(..., description="Base directory to search")
    pattern: str = Field("**/*", description="Glob pattern (supports ** for recursive)")


class FileGlobTool(BaseTool):
    name: str = "glob_files"
    description: str = (
        "List files in a directory using a glob pattern (e.g., **/*.md)."
    )
    args_schema: Type[BaseModel] = FileGlobInput

    def _run(self, directory: str, pattern: str = "**/*") -> str:
        try:
            base = pathlib.Path(directory)
            if not base.exists() or not base.is_dir():
                return f"Directory not found: {directory}"
            matched = [str(p) for p in base.glob(pattern)]
            files = [m for m in matched if pathlib.Path(m).is_file()]
            if not files:
                return "No files matched the pattern"
            return "Matched files:\n" + "\n".join(files)
        except Exception as e:
            return f"Error globbing files: {str(e)}"


class MarketListingsSearchInput(BaseModel):
    """Input schema for searching market listings in MongoDB."""
    city: Optional[str] = Field(None, description="Filter by city name (e.g., 'Austin', 'Dallas')")
    state: Optional[str] = Field(None, description="Filter by state abbreviation (e.g., 'TX', 'CA')")
    zip_code: Optional[str] = Field(None, description="Filter by zip code")
    min_price: Optional[float] = Field(None, description="Minimum listing price")
    max_price: Optional[float] = Field(None, description="Maximum listing price")
    property_type: Optional[str] = Field(None, description="Property type: single_family, condo, townhouse, multi_family, land, commercial, other")
    min_bedrooms: Optional[int] = Field(None, description="Minimum number of bedrooms")
    max_bedrooms: Optional[int] = Field(None, description="Maximum number of bedrooms")
    min_bathrooms: Optional[float] = Field(None, description="Minimum number of bathrooms")
    max_bathrooms: Optional[float] = Field(None, description="Maximum number of bathrooms")
    min_square_footage: Optional[int] = Field(None, description="Minimum square footage")
    max_square_footage: Optional[int] = Field(None, description="Maximum square footage")
    status: Optional[str] = Field(None, description="Listing status: active, pending, sold, off_market, expired")
    limit: int = Field(50, description="Maximum number of results to return (default: 50, max: 100)")


class MarketListingsSearchTool(BaseTool):
    name: str = "search_market_listings"
    description: str = (
        "Search market listings from MongoDB database. Use this tool to find properties based on location, price, property type, "
        "bedrooms, bathrooms, square footage, and status. The LLM can dynamically fill parameters based on user queries. "
        "Returns formatted property data that can be used as context for analysis."
    )
    args_schema: Type[BaseModel] = MarketListingsSearchInput

    def _run(
        self,
        city: Optional[str] = None,
        state: Optional[str] = None,
        zip_code: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        property_type: Optional[str] = None,
        min_bedrooms: Optional[int] = None,
        max_bedrooms: Optional[int] = None,
        min_bathrooms: Optional[float] = None,
        max_bathrooms: Optional[float] = None,
        min_square_footage: Optional[int] = None,
        max_square_footage: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> str:
        """Execute the market listings search."""
        try:
            # Run async MongoDB query
            result = asyncio.run(self._search_listings(
                city=city,
                state=state,
                zip_code=zip_code,
                min_price=min_price,
                max_price=max_price,
                property_type=property_type,
                min_bedrooms=min_bedrooms,
                max_bedrooms=max_bedrooms,
                min_bathrooms=min_bathrooms,
                max_bathrooms=max_bathrooms,
                min_square_footage=min_square_footage,
                max_square_footage=max_square_footage,
                status=status,
                limit=min(limit, 100)  # Cap at 100
            ))
            return result
        except Exception as e:
            return f"Error searching market listings: {str(e)}"

    async def _search_listings(
        self,
        city: Optional[str] = None,
        state: Optional[str] = None,
        zip_code: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        property_type: Optional[str] = None,
        min_bedrooms: Optional[int] = None,
        max_bedrooms: Optional[int] = None,
        min_bathrooms: Optional[float] = None,
        max_bathrooms: Optional[float] = None,
        min_square_footage: Optional[int] = None,
        max_square_footage: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> str:
        """Async function to search market listings in MongoDB."""
        try:
            from config.database import connect_to_mongo, Database
            from config.models import MarketListing
            
            # Ensure database connection
            if Database.client is None:
                await connect_to_mongo()
            
            # Build query filters
            query_filters = {}
            
            if city:
                query_filters["city"] = {"$regex": city, "$options": "i"}
            
            if state:
                query_filters["state"] = {"$regex": state, "$options": "i"}
            
            if zip_code:
                query_filters["zip_code"] = zip_code
            
            if min_price is not None or max_price is not None:
                price_filter = {}
                if min_price is not None:
                    price_filter["$gte"] = min_price
                if max_price is not None:
                    price_filter["$lte"] = max_price
                query_filters["listing_price"] = price_filter
            
            if property_type:
                query_filters["property_type"] = property_type
            
            if min_bedrooms is not None or max_bedrooms is not None:
                bedrooms_filter = {}
                if min_bedrooms is not None:
                    bedrooms_filter["$gte"] = min_bedrooms
                if max_bedrooms is not None:
                    bedrooms_filter["$lte"] = max_bedrooms
                query_filters["bedrooms"] = bedrooms_filter
            
            if min_bathrooms is not None or max_bathrooms is not None:
                bathrooms_filter = {}
                if min_bathrooms is not None:
                    bathrooms_filter["$gte"] = min_bathrooms
                if max_bathrooms is not None:
                    bathrooms_filter["$lte"] = max_bathrooms
                query_filters["bathrooms"] = bathrooms_filter
            
            if min_square_footage is not None or max_square_footage is not None:
                sqft_filter = {}
                if min_square_footage is not None:
                    sqft_filter["$gte"] = min_square_footage
                if max_square_footage is not None:
                    sqft_filter["$lte"] = max_square_footage
                query_filters["square_footage"] = sqft_filter
            
            if status:
                query_filters["status"] = status
            
            # Execute query
            if query_filters:
                listings = await MarketListing.find(query_filters).limit(limit).to_list()
            else:
                listings = await MarketListing.find_all().limit(limit).to_list()
            
            if not listings:
                return f"No market listings found matching the criteria.\nFilters applied: {query_filters}"
            
            # Format results for LLM context
            result_text = f"Found {len(listings)} market listing(s):\n\n"
            
            for idx, listing in enumerate(listings, 1):
                result_text += f"=== Listing {idx} ===\n"
                result_text += f"Address: {listing.address}\n"
                result_text += f"City: {listing.city}, State: {listing.state}"
                if listing.zip_code:
                    result_text += f", ZIP: {listing.zip_code}"
                result_text += "\n"
                
                if listing.listing_price:
                    result_text += f"Price: ${listing.listing_price:,.0f}"
                    if listing.price_per_sqft:
                        result_text += f" (${listing.price_per_sqft:.2f}/sqft)"
                    result_text += "\n"
                
                if listing.property_type:
                    result_text += f"Property Type: {listing.property_type}\n"
                
                if listing.bedrooms is not None:
                    result_text += f"Bedrooms: {listing.bedrooms}\n"
                
                if listing.bathrooms is not None:
                    result_text += f"Bathrooms: {listing.bathrooms}\n"
                
                if listing.square_footage:
                    result_text += f"Square Footage: {listing.square_footage:,}\n"
                
                if listing.status:
                    result_text += f"Status: {listing.status}\n"
                
                if listing.days_on_market is not None:
                    result_text += f"Days on Market: {listing.days_on_market}\n"
                
                if listing.year_built:
                    result_text += f"Year Built: {listing.year_built}\n"
                
                if listing.lot_size:
                    result_text += f"Lot Size: {listing.lot_size} acres\n"
                
                if listing.neighborhood:
                    result_text += f"Neighborhood: {listing.neighborhood}\n"
                
                if listing.listing_agent:
                    result_text += f"Listing Agent: {listing.listing_agent}\n"
                
                if listing.description:
                    desc = listing.description[:200] + "..." if len(listing.description) > 200 else listing.description
                    result_text += f"Description: {desc}\n"
                
                result_text += "\n"
            
            return result_text
            
        except Exception as e:
            return f"Database error: {str(e)}"


class MarketListingsStatsInput(BaseModel):
    """Input schema for getting market listings statistics."""
    city: Optional[str] = Field(None, description="Filter by city name")
    state: Optional[str] = Field(None, description="Filter by state abbreviation")
    property_type: Optional[str] = Field(None, description="Filter by property type")


class MarketListingsStatsTool(BaseTool):
    name: str = "get_market_listings_stats"
    description: str = (
        "Get statistical summary of market listings (count, average price, price range, etc.) based on filters. "
        "Useful for market analysis and understanding trends."
    )
    args_schema: Type[BaseModel] = MarketListingsStatsInput

    def _run(
        self,
        city: Optional[str] = None,
        state: Optional[str] = None,
        property_type: Optional[str] = None
    ) -> str:
        """Get statistics about market listings."""
        try:
            result = asyncio.run(self._get_stats(
                city=city,
                state=state,
                property_type=property_type
            ))
            return result
        except Exception as e:
            return f"Error getting market listings stats: {str(e)}"

    async def _get_stats(
        self,
        city: Optional[str] = None,
        state: Optional[str] = None,
        property_type: Optional[str] = None
    ) -> str:
        """Async function to get market listings statistics."""
        try:
            from config.database import connect_to_mongo, Database
            from config.models import MarketListing
            
            # Ensure database connection
            if Database.client is None:
                await connect_to_mongo()
            
            # Build query filters
            query_filters = {}
            
            if city:
                query_filters["city"] = {"$regex": city, "$options": "i"}
            
            if state:
                query_filters["state"] = {"$regex": state, "$options": "i"}
            
            if property_type:
                query_filters["property_type"] = property_type
            
            # Get listings matching filters
            if query_filters:
                listings = await MarketListing.find(query_filters).to_list()
            else:
                listings = await MarketListing.find_all().to_list()
            
            if not listings:
                return f"No market listings found for the specified criteria."
            
            # Calculate statistics
            total_count = len(listings)
            prices = [l.listing_price for l in listings if l.listing_price is not None]
            sqft_values = [l.square_footage for l in listings if l.square_footage is not None]
            bedrooms_values = [l.bedrooms for l in listings if l.bedrooms is not None]
            
            stats_text = f"Market Listings Statistics"
            if city or state:
                stats_text += f" ({', '.join([x for x in [city, state] if x])})"
            stats_text += f":\n\n"
            
            stats_text += f"Total Listings: {total_count}\n"
            
            if prices:
                avg_price = sum(prices) / len(prices)
                min_price = min(prices)
                max_price = max(prices)
                stats_text += f"Price Range: ${min_price:,.0f} - ${max_price:,.0f}\n"
                stats_text += f"Average Price: ${avg_price:,.0f}\n"
            
            if sqft_values:
                avg_sqft = sum(sqft_values) / len(sqft_values)
                min_sqft = min(sqft_values)
                max_sqft = max(sqft_values)
                stats_text += f"Square Footage Range: {min_sqft:,} - {max_sqft:,} sqft\n"
                stats_text += f"Average Square Footage: {avg_sqft:,.0f} sqft\n"
            
            if bedrooms_values:
                avg_bedrooms = sum(bedrooms_values) / len(bedrooms_values)
                stats_text += f"Average Bedrooms: {avg_bedrooms:.1f}\n"
            
            # Status breakdown
            status_counts = {}
            for listing in listings:
                if listing.status:
                    status_counts[listing.status] = status_counts.get(listing.status, 0) + 1
            
            if status_counts:
                stats_text += f"\nStatus Breakdown:\n"
                for status, count in status_counts.items():
                    stats_text += f"  {status}: {count}\n"
            
            # Property type breakdown
            type_counts = {}
            for listing in listings:
                if listing.property_type:
                    type_counts[listing.property_type] = type_counts.get(listing.property_type, 0) + 1
            
            if type_counts:
                stats_text += f"\nProperty Type Breakdown:\n"
                for prop_type, count in type_counts.items():
                    stats_text += f"  {prop_type}: {count}\n"
            
            return stats_text
            
        except Exception as e:
            return f"Database error: {str(e)}"


class CustomTools:
    @staticmethod
    def get_file_tools():
        return [
            FileReadTool(),
            DirectoryReadTool(),
            FileGlobTool(),
        ]
    
    @staticmethod
    def get_web_tools():
        tools = []
        
        # Add Perplexity search (comprehensive research with sources)
        perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        if perplexity_key:
            tools.append(PerplexitySearchTool())
        
        # Add Tavily search (fast web search)
        tavily_key = os.getenv("TAVILY_API_KEY")
        if tavily_key:
            tools.append(TavilySearchTool(api_key=tavily_key))

        # Include simple web page fetcher for reading content
        tools.append(WebPageFetchTool())
            
        return tools
    
    @staticmethod
    def get_mongodb_tools():
        """Get MongoDB query tools for market listings."""
        return [
            MarketListingsSearchTool(),
            MarketListingsStatsTool(),
        ]
    
    @staticmethod
    def get_all_tools():
        return (
            CustomTools.get_file_tools() +
            CustomTools.get_web_tools() +
            CustomTools.get_mongodb_tools()
        )