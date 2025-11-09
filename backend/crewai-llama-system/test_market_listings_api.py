#!/usr/bin/env python3

import asyncio
import requests
import json
from datetime import datetime

async def test_market_listings_api():
    """Test the market listings API endpoints"""
    
    # API base URL
    base_url = "http://localhost:8000"
    
    print("Testing Market Listings API...")
    print("=" * 50)
    
    try:
        # Test 1: Check if API is running
        print("1. Testing API connection...")
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            print("✅ API is running!")
            print(f"   Available endpoints: {len(data.get('endpoints', {}))}")
            if '/listings' in str(data.get('endpoints', {})):
                print("✅ Market listings endpoints found!")
            else:
                print("❌ Market listings endpoints not found")
        else:
            print(f"❌ API not responding: {response.status_code}")
            return
        
        # Test 2: Get all listings
        print("\n2. Testing GET /listings...")
        response = requests.get(f"{base_url}/listings")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {data.get('returned_count', 0)} listings")
            print(f"   Total in database: {data.get('total_count', 0)}")
            
            # Show sample listing if available
            if data.get('listings'):
                sample = data['listings'][0]
                print(f"   Sample listing: {sample.get('address', 'N/A')}, {sample.get('city', 'N/A')}")
        else:
            print(f"❌ Failed to get listings: {response.status_code}")
            print(f"   Error: {response.text}")
        
        # Test 3: Search listings
        print("\n3. Testing POST /listings/search...")
        search_payload = {
            "query": "Austin",
            "limit": 10
        }
        response = requests.post(
            f"{base_url}/listings/search",
            json=search_payload,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search returned {data.get('count', 0)} results for 'Austin'")
        else:
            print(f"❌ Search failed: {response.status_code}")
            print(f"   Error: {response.text}")
        
        # Test 4: Get statistics
        print("\n4. Testing GET /listings/stats...")
        response = requests.get(f"{base_url}/listings/stats")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Statistics retrieved!")
            print(f"   Total listings: {data.get('total_listings', 0)}")
            print(f"   Top cities: {len(data.get('top_cities', []))}")
            print(f"   Property types: {len(data.get('property_types', []))}")
        else:
            print(f"❌ Stats failed: {response.status_code}")
            print(f"   Error: {response.text}")
        
        # Test 5: Filtered query
        print("\n5. Testing filtered listings...")
        params = {
            "city": "Austin",
            "min_price": 300000,
            "max_price": 500000,
            "limit": 5
        }
        response = requests.get(f"{base_url}/listings", params=params)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Filtered query returned {data.get('returned_count', 0)} results")
            print(f"   Filter: Austin, $300k-$500k")
        else:
            print(f"❌ Filtered query failed: {response.status_code}")
        
        print("\n" + "=" * 50)
        print("Market Listings API Test Complete!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
        print("   Make sure the server is running: python start_server.py")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

def create_curl_examples():
    """Generate curl command examples for testing"""
    base_url = "http://localhost:8000"
    
    examples = [
        # Basic listings
        f'curl -X GET "{base_url}/listings"',
        
        # Filtered listings
        f'curl -X GET "{base_url}/listings?city=Austin&min_price=300000&max_price=500000&limit=10"',
        
        # Search listings
        f'''curl -X POST "{base_url}/listings/search" \\
     -H "Content-Type: application/json" \\
     -d '{{"query": "Austin", "limit": 10}}\'''',
        
        # Statistics
        f'curl -X GET "{base_url}/listings/stats"',
        
        # API info
        f'curl -X GET "{base_url}/"'
    ]
    
    print("\n" + "=" * 60)
    print("CURL COMMAND EXAMPLES")
    print("=" * 60)
    
    for i, cmd in enumerate(examples, 1):
        print(f"\n{i}. {cmd.split('/')[-1].split('?')[0].split(' ')[0].upper()} request:")
        print(f"   {cmd}")

if __name__ == "__main__":
    print("MARKET LISTINGS API TESTER")
    print("=" * 60)
    print("This script tests the market listings API endpoints")
    print("Make sure the server is running first!")
    print()
    
    # Run async test
    asyncio.run(test_market_listings_api())
    
    # Show curl examples
    create_curl_examples()
    
    print("\n" + "=" * 60)
    print("To upload your CSV data:")
    print("   python upload_listings_csv.py your_file.csv")
    print()
    print("To start the API server:")
    print("   python start_server.py")
    print("=" * 60)