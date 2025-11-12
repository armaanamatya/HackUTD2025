#!/usr/bin/env python3

import asyncio
import pandas as pd
import sys
from pathlib import Path
from datetime import datetime

# Add config directory to path
sys.path.append(str(Path(__file__).parent))

from config.database import connect_to_mongo, close_mongo_connection
from config.models import MarketListing

async def test_listing_upload():
    """Test the MarketListing schema and create sample data"""
    print("Testing MarketListing upload functionality...")
    
    try:
        # Connect to MongoDB
        await connect_to_mongo()
        print("SUCCESS: Connected to MongoDB")
        
        # Create sample listing data
        sample_listings = [
            {
                "address": "123 Main St",
                "city": "Austin",
                "state": "TX",
                "zip_code": "78701",
                "bedrooms": 3,
                "bathrooms": 2.5,
                "square_footage": 2000,
                "listing_price": 450000.0,
                "property_type": "single_family"
            },
            {
                "address": "456 Oak Ave",
                "city": "Austin", 
                "state": "TX",
                "zip_code": "78702",
                "bedrooms": 2,
                "bathrooms": 2.0,
                "square_footage": 1200,
                "listing_price": 350000.0,
                "property_type": "condo"
            },
            {
                "address": "789 Pine Rd",
                "city": "Dallas",
                "state": "TX", 
                "zip_code": "75201",
                "bedrooms": 4,
                "bathrooms": 3.0,
                "square_footage": 2800,
                "listing_price": 650000.0,
                "property_type": "single_family"
            }
        ]
        
        # Convert to MarketListing objects
        listings = []
        for data in sample_listings:
            listing = MarketListing(**data)
            listings.append(listing)
        
        # Insert into database
        await MarketListing.insert_many(listings)
        print(f"SUCCESS: Inserted {len(listings)} sample listings")
        
        # Query back to verify
        count = await MarketListing.count()
        print(f"SUCCESS: Total listings in database: {count}")
        
        # Test queries
        austin_listings = await MarketListing.find(MarketListing.city == "Austin").to_list()
        print(f"SUCCESS: Found {len(austin_listings)} listings in Austin")
        
        expensive_listings = await MarketListing.find(MarketListing.listing_price > 400000).to_list()
        print(f"SUCCESS: Found {len(expensive_listings)} listings over $400k")
        
        # Show sample listing
        sample = await MarketListing.find_one()
        if sample:
            print(f"SUCCESS: Sample listing:")
            print(f"  Address: {sample.address}, {sample.city}, {sample.state}")
            print(f"  Price: ${sample.listing_price:,.0f}")
            print(f"  Beds/Baths: {sample.bedrooms}/{sample.bathrooms}")
            print(f"  Sq Ft: {sample.square_footage}")
            print(f"  Import Date: {sample.import_date}")
        
        # Clean up test data
        await MarketListing.delete_all()
        print("SUCCESS: Cleaned up test data")
        
        print("\nMarketListing schema test PASSED!")
        
    except Exception as e:
        print(f"ERROR: Test failed: {str(e)}")
        raise
    finally:
        await close_mongo_connection()
        print("MongoDB connection closed")

# Create sample CSV file for testing
def create_sample_csv():
    """Create a sample CSV file for testing uploads"""
    sample_data = {
        'Street Address': [
            '123 Main St',
            '456 Oak Ave', 
            '789 Pine Rd',
            '321 Elm Dr',
            '654 Cedar Ln'
        ],
        'City': ['Austin', 'Austin', 'Dallas', 'Houston', 'San Antonio'],
        'State': ['TX', 'TX', 'TX', 'TX', 'TX'],
        'ZIP Code': ['78701', '78702', '75201', '77001', '78201'],
        'Beds': [3, 2, 4, 3, 5],
        'Baths': [2.5, 2.0, 3.0, 2.5, 3.5],
        'Sq Ft': [2000, 1200, 2800, 1800, 3200],
        'List Price': [450000, 350000, 650000, 420000, 750000],
        'Property Type': ['Single Family', 'Condo', 'Single Family', 'Townhouse', 'Single Family'],
        'Status': ['Active', 'Pending', 'Active', 'Sold', 'Active'],
        'MLS#': ['MLS001', 'MLS002', 'MLS003', 'MLS004', 'MLS005']
    }
    
    df = pd.DataFrame(sample_data)
    csv_path = 'sample_listings.csv'
    df.to_csv(csv_path, index=False)
    print(f"Created sample CSV: {csv_path}")
    return csv_path

async def main():
    """Run the test"""
    print("=" * 60)
    print("MARKET LISTING SCHEMA TEST")
    print("=" * 60)
    
    # Test schema
    await test_listing_upload()
    
    # Create sample CSV
    print("\n" + "=" * 60)
    print("CREATING SAMPLE CSV")
    print("=" * 60)
    csv_path = create_sample_csv()
    
    print(f"\nTo upload your CSV file, run:")
    print(f"python upload_listings_csv.py your_file.csv")
    print(f"\nTo test with the sample CSV:")
    print(f"python upload_listings_csv.py {csv_path}")

if __name__ == "__main__":
    asyncio.run(main())