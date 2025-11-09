#!/usr/bin/env python3

import asyncio
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Optional

# MongoDB connection
MONGODB_URL = "mongodb+srv://armaanamatya2014_db_user:4czlTmpWmiMKeGEL@cluster0.rxrhayj.mongodb.net/?appName=Cluster0"
DATABASE_NAME = "hackutd_real_estate"

async def test_csv_functionality():
    """Test CSV upload functionality without full schema dependencies"""
    print("Testing CSV upload functionality...")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        database = client[DATABASE_NAME]
        collection = database.market_listings
        
        # Test connection
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB")
        
        # Create sample CSV data
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
        
        # Create DataFrame and save as CSV
        df = pd.DataFrame(sample_data)
        csv_path = 'sample_listings.csv'
        df.to_csv(csv_path, index=False)
        print(f"SUCCESS: Created sample CSV with {len(df)} rows: {csv_path}")
        
        # Convert CSV data to MongoDB documents
        documents = []
        for _, row in df.iterrows():
            doc = {
                "address": row['Street Address'],
                "city": row['City'],
                "state": row['State'],
                "zip_code": str(row['ZIP Code']),
                "bedrooms": int(row['Beds']),
                "bathrooms": float(row['Baths']),
                "square_footage": int(row['Sq Ft']),
                "listing_price": float(row['List Price']),
                "property_type": row['Property Type'].lower().replace(' ', '_'),
                "status": row['Status'].lower(),
                "mls_number": row['MLS#'],
                "data_source": "csv_import",
                "import_date": datetime.utcnow(),
                "raw_data": row.to_dict()
            }
            documents.append(doc)
        
        # Insert into MongoDB
        result = await collection.insert_many(documents)
        print(f"SUCCESS: Inserted {len(result.inserted_ids)} listings into MongoDB")
        
        # Query back to verify
        count = await collection.count_documents({})
        print(f"SUCCESS: Total listings in collection: {count}")
        
        # Test some queries
        austin_count = await collection.count_documents({"city": "Austin"})
        print(f"SUCCESS: Austin listings: {austin_count}")
        
        expensive_listings = await collection.find({"listing_price": {"$gt": 400000}}).to_list(length=None)
        print(f"SUCCESS: Listings over $400k: {len(expensive_listings)}")
        
        # Show sample document
        sample_doc = await collection.find_one()
        if sample_doc:
            print(f"SUCCESS: Sample listing document:")
            print(f"  Address: {sample_doc.get('address')}")
            print(f"  City: {sample_doc.get('city')}")
            print(f"  Price: ${sample_doc.get('listing_price', 0):,.0f}")
            print(f"  Beds/Baths: {sample_doc.get('bedrooms')}/{sample_doc.get('bathrooms')}")
        
        # Clean up test data
        delete_result = await collection.delete_many({"data_source": "csv_import"})
        print(f"SUCCESS: Cleaned up {delete_result.deleted_count} test documents")
        
        print("\nCSV upload test PASSED!")
        
        # Show usage instructions
        print("\n" + "="*60)
        print("CSV UPLOAD INSTRUCTIONS")
        print("="*60)
        print("1. Place your CSV file in the current directory")
        print("2. Run the upload script:")
        print("   python upload_listings_csv.py your_file.csv")
        print()
        print("3. For custom column mappings, create a JSON file:")
        print("   python upload_listings_csv.py your_file.csv custom_mapping.json")
        print()
        print("4. Sample mapping file created: sample_mapping.json")
        print()
        print("Expected CSV columns (auto-detected):")
        print("- Address fields: address, city, state, zip")
        print("- Property: bedrooms, bathrooms, sqft, lot size, year built")
        print("- Pricing: list price, price per sqft")
        print("- Other: MLS#, property type, status, list date")
        
    except Exception as e:
        print(f"ERROR: Test failed: {str(e)}")
        raise
    finally:
        client.close()
        print("MongoDB connection closed")

if __name__ == "__main__":
    asyncio.run(test_csv_functionality())