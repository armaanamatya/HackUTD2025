#!/usr/bin/env python3

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# MongoDB connection string
MONGODB_URL = "mongodb+srv://armaanamatya2014_db_user:4czlTmpWmiMKeGEL@cluster0.rxrhayj.mongodb.net/?appName=Cluster0"
DATABASE_NAME = "hackutd_real_estate"

async def test_mongodb_simple():
    """Simple MongoDB connection test"""
    print("Testing MongoDB connection...")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        database = client[DATABASE_NAME]
        
        # Test connection with ping
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB!")
        
        # Test basic collection operations
        test_collection = database.test_collection
        
        # Insert a test document
        test_doc = {
            "test_id": "test_123",
            "message": "Hello from CrewAI Real Estate Agents!",
            "timestamp": datetime.utcnow(),
            "data": {
                "property_address": "123 Main St, Austin, TX",
                "analysis_type": "property_insights"
            }
        }
        
        result = await test_collection.insert_one(test_doc)
        print(f"SUCCESS: Inserted test document with ID: {result.inserted_id}")
        
        # Retrieve the document
        retrieved_doc = await test_collection.find_one({"test_id": "test_123"})
        if retrieved_doc:
            print("SUCCESS: Retrieved test document:")
            print(f"   - Message: {retrieved_doc['message']}")
            print(f"   - Property: {retrieved_doc['data']['property_address']}")
            print(f"   - Timestamp: {retrieved_doc['timestamp']}")
        
        # Count documents
        count = await test_collection.count_documents({})
        print(f"SUCCESS: Total documents in test collection: {count}")
        
        # Clean up
        await test_collection.delete_one({"test_id": "test_123"})
        print("SUCCESS: Cleaned up test document!")
        
        # List available collections
        collections = await database.list_collection_names()
        print(f"SUCCESS: Available collections: {collections}")
        
        print("\nMongoDB connection test passed!")
        
    except Exception as e:
        print(f"ERROR: MongoDB test failed: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        raise
    finally:
        # Close connection
        client.close()
        print("MongoDB connection closed")

if __name__ == "__main__":
    asyncio.run(test_mongodb_simple())