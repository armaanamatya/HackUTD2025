#!/usr/bin/env python3

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add config directory to path
sys.path.append(str(Path(__file__).parent))

from config.database import connect_to_mongo, close_mongo_connection
from config.models import AnalysisJob, JobType, JobStatus

async def test_mongodb_connection():
    """Test MongoDB connection and basic operations"""
    print("🔄 Testing MongoDB connection...")
    
    try:
        # Connect to MongoDB
        await connect_to_mongo()
        print("✅ Successfully connected to MongoDB!")
        
        # Test creating a job
        test_job = AnalysisJob(
            job_id="test_job_123",
            job_type=JobType.PROPERTY_INSIGHTS,
            status=JobStatus.PENDING,
            user_query="Test property analysis for 123 Main St",
            input_parameters={"address": "123 Main St", "city": "Austin"}
        )
        
        # Save to database
        await test_job.save()
        print("✅ Successfully created test job in database!")
        
        # Retrieve the job
        retrieved_job = await AnalysisJob.find_one(AnalysisJob.job_id == "test_job_123")
        if retrieved_job:
            print(f"✅ Successfully retrieved job: {retrieved_job.job_id}")
            print(f"   - Type: {retrieved_job.job_type}")
            print(f"   - Status: {retrieved_job.status}")
            print(f"   - Query: {retrieved_job.user_query}")
            print(f"   - Created: {retrieved_job.created_at}")
        else:
            print("❌ Failed to retrieve test job")
        
        # Update the job status
        retrieved_job.status = JobStatus.COMPLETED
        retrieved_job.result_text = "Test analysis completed successfully"
        retrieved_job.completed_at = datetime.utcnow()
        await retrieved_job.save()
        print("✅ Successfully updated job status!")
        
        # Clean up test data
        await retrieved_job.delete()
        print("✅ Successfully cleaned up test data!")
        
        print("\n🎉 All MongoDB tests passed!")
        
    except Exception as e:
        print(f"❌ MongoDB test failed: {str(e)}")
        raise
    finally:
        # Close connection
        await close_mongo_connection()
        print("🔄 MongoDB connection closed")

if __name__ == "__main__":
    asyncio.run(test_mongodb_connection())