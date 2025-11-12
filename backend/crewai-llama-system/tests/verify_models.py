#!/usr/bin/env python3

import sys
from pathlib import Path
import asyncio

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

async def verify_models():
    """Verify all models are properly defined and accessible"""
    
    print("Verifying MongoDB Models...")
    print("=" * 50)
    
    try:
        # Test importing models directly
        print("1. Testing model imports...")
        
        try:
            from config.models import (
                MarketListing, PropertyInsight, RealEstateReport, 
                AnalysisJob, FileUpload, UserSession, APIUsage,
                PropertyType, ListingStatus, JobType, JobStatus
            )
            print("✅ All models imported successfully!")
        except ImportError as e:
            print(f"❌ Model import failed: {e}")
            return
        
        # Test model structure
        print("\n2. Testing MarketListing model structure...")
        
        # Check if MarketListing has required fields
        listing_fields = MarketListing.__fields__.keys()
        required_fields = ['address', 'city', 'state']
        
        print(f"   MarketListing has {len(listing_fields)} fields")
        print(f"   Required fields present: {all(field in listing_fields for field in required_fields)}")
        
        # Show some key fields
        key_fields = ['address', 'city', 'state', 'listing_price', 'bedrooms', 'bathrooms']
        present_fields = [field for field in key_fields if field in listing_fields]
        print(f"   Key fields available: {present_fields}")
        
        # Test enums
        print("\n3. Testing enum values...")
        print(f"   PropertyType options: {[e.value for e in PropertyType]}")
        print(f"   ListingStatus options: {[e.value for e in ListingStatus]}")
        
        # Test creating a sample listing
        print("\n4. Testing model instantiation...")
        
        sample_listing = MarketListing(
            address="123 Test St",
            city="Austin",
            state="TX",
            zip_code="78701",
            bedrooms=3,
            bathrooms=2.5,
            listing_price=450000.0,
            property_type=PropertyType.SINGLE_FAMILY,
            status=ListingStatus.ACTIVE
        )
        
        print("✅ MarketListing model created successfully!")
        print(f"   Address: {sample_listing.address}")
        print(f"   Price: ${sample_listing.listing_price:,.0f}")
        print(f"   Type: {sample_listing.property_type}")
        print(f"   Status: {sample_listing.status}")
        
        # Test database collection name
        print(f"\n5. Database collection: '{sample_listing.Settings.name}'")
        print(f"   Indexes: {sample_listing.Settings.indexes}")
        
        print("\n" + "=" * 50)
        print("✅ ALL MODEL VERIFICATION TESTS PASSED!")
        print("MarketListing model is properly configured and ready to use.")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Verification failed: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        return False

async def test_database_connection():
    """Test database connection without full dependencies"""
    print("\n" + "=" * 50)
    print("Testing Database Connection...")
    
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        
        # MongoDB connection
        MONGODB_URL = "mongodb+srv://armaanamatya2014_db_user:4czlTmpWmiMKeGEL@cluster0.rxrhayj.mongodb.net/?appName=Cluster0"
        
        client = AsyncIOMotorClient(MONGODB_URL)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Test collection access
        database = client["hackutd_real_estate"]
        collection = database["market_listings"]
        
        count = await collection.count_documents({})
        print(f"✅ market_listings collection accessible")
        print(f"   Current document count: {count}")
        
        # List collections
        collections = await database.list_collection_names()
        print(f"✅ Available collections: {collections}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {str(e)}")
        return False

async def main():
    """Run all verification tests"""
    
    print("MONGODB MODELS VERIFICATION")
    print("=" * 60)
    
    # Test 1: Model verification
    models_ok = await verify_models()
    
    # Test 2: Database connection
    db_ok = await test_database_connection()
    
    # Summary
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"Models: {'✅ PASS' if models_ok else '❌ FAIL'}")
    print(f"Database: {'✅ PASS' if db_ok else '❌ FAIL'}")
    
    if models_ok and db_ok:
        print("\n🎉 MarketListing model is ready to use!")
        print("\nNext steps:")
        print("1. Upload your CSV: python upload_listings_csv.py your_file.csv")
        print("2. Start the API server: python start_server.py")
        print("3. Test the API: python test_market_listings_api.py")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())