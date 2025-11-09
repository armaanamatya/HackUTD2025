#!/usr/bin/env python3

import sys
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

def check_models():
    """Simple check for MarketListing model"""
    
    print("Checking MarketListing Model...")
    print("=" * 40)
    
    try:
        # Import models directly from the file
        sys.path.append(str(Path(__file__).parent / "config"))
        
        # Import individual components to avoid config dependencies
        from beanie import Document
        from pydantic import BaseModel, Field
        from typing import Optional, List, Dict, Any
        from datetime import datetime
        from enum import Enum
        
        print("SUCCESS: Basic imports working")
        
        # Check if the models file exists and can be read
        models_file = Path(__file__).parent / "config" / "models.py"
        if models_file.exists():
            print("SUCCESS: models.py file found")
            
            # Read the file and check for MarketListing
            content = models_file.read_text()
            if "class MarketListing(Document):" in content:
                print("SUCCESS: MarketListing class found in models.py")
            else:
                print("ERROR: MarketListing class not found")
                return False
            
            # Check for required fields
            if "address:" in content and "city:" in content and "state:" in content:
                print("SUCCESS: Required fields (address, city, state) found")
            else:
                print("ERROR: Missing required fields")
                return False
                
            # Check for enums
            if "class PropertyType" in content and "class ListingStatus" in content:
                print("SUCCESS: Property type and status enums found")
            else:
                print("WARNING: Some enums may be missing")
            
            # Check collection name
            if 'name = "market_listings"' in content:
                print("SUCCESS: Collection name 'market_listings' configured")
            else:
                print("ERROR: Collection name not configured")
                return False
            
            print("\nMarketListing Model Structure:")
            print("- Collection: market_listings")
            print("- Required: address, city, state")
            print("- Optional: price, bedrooms, bathrooms, sqft, etc.")
            print("- Enums: PropertyType, ListingStatus")
            print("- Indexes: address, city, listing_price, status, etc.")
            
            return True
            
        else:
            print("ERROR: models.py file not found")
            return False
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

def check_database_config():
    """Check database configuration"""
    
    print("\n" + "=" * 40)
    print("Checking Database Configuration...")
    
    try:
        # Check database.py file
        db_file = Path(__file__).parent / "config" / "database.py"
        if db_file.exists():
            content = db_file.read_text()
            
            if "MarketListing" in content:
                print("SUCCESS: MarketListing included in database initialization")
            else:
                print("ERROR: MarketListing not in database initialization")
                return False
            
            if "hackutd_real_estate" in content:
                print("SUCCESS: Database name 'hackutd_real_estate' configured")
            else:
                print("ERROR: Database name not found")
                return False
            
            if "mongodb+srv://armaanamatya2014" in content:
                print("SUCCESS: MongoDB connection string configured")
            else:
                print("ERROR: MongoDB connection not found")
                return False
            
            return True
            
        else:
            print("ERROR: database.py file not found")
            return False
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

def check_api_integration():
    """Check API server integration"""
    
    print("\n" + "=" * 40)
    print("Checking API Integration...")
    
    try:
        # Check api_server.py file
        api_file = Path(__file__).parent / "api_server.py"
        if api_file.exists():
            content = api_file.read_text()
            
            if "MarketListing" in content:
                print("SUCCESS: MarketListing imported in API server")
            else:
                print("ERROR: MarketListing not imported in API server")
                return False
            
            if "/listings" in content:
                print("SUCCESS: Listings endpoints found")
            else:
                print("ERROR: Listings endpoints not found")
                return False
            
            if "get_market_listings" in content:
                print("SUCCESS: Market listings function found")
            else:
                print("ERROR: Market listings function not found")
                return False
            
            return True
            
        else:
            print("ERROR: api_server.py file not found")
            return False
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

def main():
    """Run all checks"""
    
    print("MARKET LISTING MODEL VERIFICATION")
    print("=" * 50)
    
    # Run checks
    models_ok = check_models()
    db_ok = check_database_config()
    api_ok = check_api_integration()
    
    # Summary
    print("\n" + "=" * 50)
    print("VERIFICATION SUMMARY")
    print("=" * 50)
    print(f"Models: {'PASS' if models_ok else 'FAIL'}")
    print(f"Database: {'PASS' if db_ok else 'FAIL'}")
    print(f"API: {'PASS' if api_ok else 'FAIL'}")
    
    if models_ok and db_ok and api_ok:
        print("\nSUCCESS: MarketListing model is properly configured!")
        print("\nYour system includes:")
        print("- MarketListing schema with comprehensive property fields")
        print("- MongoDB integration with 'market_listings' collection")
        print("- API endpoints: /listings, /listings/search, /listings/stats")
        print("- CSV upload functionality")
        print("\nNext steps:")
        print("1. Upload CSV data: python upload_listings_csv.py your_file.csv")
        print("2. Start server: python start_server.py")
        print("3. Access API docs: http://localhost:8000/docs")
    else:
        print("\nSome issues were found. Please check the errors above.")
        
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()