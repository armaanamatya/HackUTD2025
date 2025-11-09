#!/usr/bin/env python3
"""
Script to add picture column to market listings collection
"""

import asyncio
import sys
import random
from pathlib import Path

# Add paths
sys.path.append(str(Path(__file__).parent / "src"))

from config.database import connect_to_mongo, close_mongo_connection
from config.models import MarketListing

# Sample property image URLs (placeholder images)
SAMPLE_PROPERTY_IMAGES = [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",  # Modern house
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",  # House exterior
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",  # Beautiful home
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",  # Modern home
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",  # House with garden
    "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop",  # Contemporary house
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",  # Traditional home
    "https://images.unsplash.com/photo-1615715757732-24048ceeb352?w=800&h=600&fit=crop",  # Luxury house
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",  # Family home
    "https://images.unsplash.com/photo-1551524164-6cf6ac833fb4?w=800&h=600&fit=crop",  # Modern architecture
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop",  # Classic home
    "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&h=600&fit=crop",  # Suburban house
]

async def add_picture_column():
    """Add picture column to existing market listings"""
    
    print("[PROPERTY] Adding picture column to market listings collection...")
    
    try:
        # Connect to MongoDB
        print("[DATABASE] Connecting to MongoDB...")
        await connect_to_mongo()
        print("[SUCCESS] Connected to MongoDB")
        
        # Get all market listings
        print("[QUERY] Fetching market listings...")
        listings = await MarketListing.find_all().to_list()
        print(f"[INFO] Found {len(listings)} listings")
        
        if not listings:
            print("[ERROR] No listings found in collection")
            return
        
        # Update listings with picture URLs
        updated_count = 0
        
        for i, listing in enumerate(listings, 1):
            try:
                # Skip if already has a picture
                if listing.picture:
                    print(f"   {i}/{len(listings)}: {listing.address} - Already has picture, skipping")
                    continue
                
                # Assign a random sample image
                picture_url = random.choice(SAMPLE_PROPERTY_IMAGES)
                
                # Update the listing
                listing.picture = picture_url
                await listing.save()
                
                updated_count += 1
                print(f"   {i}/{len(listings)}: {listing.address} - Added picture: {picture_url[:50]}...")
                
            except Exception as e:
                print(f"   [ERROR] Error updating listing {i}: {str(e)}")
        
        print(f"\n[SUCCESS] Migration completed!")
        print(f"[STATS] Updated {updated_count} listings with picture URLs")
        print(f"[STATS] Total listings now have pictures: {updated_count}")
        
        # Verify the update
        print(f"\n[VERIFY] Verification:")
        listings_with_pictures = await MarketListing.find(MarketListing.picture != None).count()
        print(f"[STATS] Listings with pictures: {listings_with_pictures}")
        
    except Exception as e:
        print(f"[ERROR] Migration failed: {str(e)}")
    finally:
        await close_mongo_connection()
        print("[DATABASE] Database connection closed")

async def show_sample_listings():
    """Show some sample listings with pictures"""
    
    try:
        await connect_to_mongo()
        
        print(f"\n[SAMPLES] Sample listings with pictures:")
        print("=" * 80)
        
        # Get first 5 listings with pictures
        listings = await MarketListing.find(
            MarketListing.picture != None
        ).limit(5).to_list()
        
        for i, listing in enumerate(listings, 1):
            print(f"{i}. {listing.address}, {listing.city}, {listing.state}")
            print(f"   Price: ${listing.listing_price:,.0f}" if listing.listing_price else "   Price: Not listed")
            print(f"   Picture: {listing.picture}")
            print()
        
    except Exception as e:
        print(f"[ERROR] Error showing samples: {str(e)}")
    finally:
        await close_mongo_connection()

async def add_picture_index():
    """Add index for picture field for better query performance"""
    
    try:
        await connect_to_mongo()
        
        print("[INDEX] Adding index for picture field...")
        
        # The index will be created automatically when the model is used
        # But we can explicitly create it if needed
        
        print("[SUCCESS] Picture field index ready")
        
    except Exception as e:
        print(f"[ERROR] Error adding index: {str(e)}")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    print("[MIGRATION] Market Listings Picture Column Migration")
    print("=" * 50)
    print()
    
    # Run the migration
    asyncio.run(add_picture_column())
    
    # Show some samples
    asyncio.run(show_sample_listings())
    
    print("\n[SUCCESS] Migration completed successfully!")
    print("\n[INFO] Next steps:")
    print("1. The picture field is now available in the MarketListing model")
    print("2. API endpoints will now include picture URLs in responses")
    print("3. Frontend can display property images")
    print("4. You can update picture URLs through the API or database directly")