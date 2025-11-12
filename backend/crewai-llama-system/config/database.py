#!/usr/bin/env python3

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional
import logging
from dotenv import load_dotenv
try:
    import certifi
except Exception:
    certifi = None

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

# Load environment variables
load_dotenv()

# MongoDB connection string and database name from environment
MONGODB_URL = os.getenv("DATABASE_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hackutd_real_estate")

async def connect_to_mongo():
    """Create database connection"""
    try:
        if not MONGODB_URL:
            raise RuntimeError("DATABASE_URL is not set. Configure it in your environment or .env file.")
        tls_ca_file = os.getenv("TLS_CA_FILE") or (certifi.where() if certifi else None)
        Database.client = AsyncIOMotorClient(
            MONGODB_URL,
            tls=True,
            tlsAllowInvalidCertificates=False,
            tlsCAFile=tls_ca_file,
        )
        Database.database = Database.client[DATABASE_NAME]
        
        # Test connection
        await Database.client.admin.command('ping')
        logger.info(f"✓ Connected to MongoDB database: {DATABASE_NAME}")
        
        # Initialize Beanie with document models
        from .models import PropertyInsight, RealEstateReport, AnalysisJob, FileUpload, MarketListing, UserSession, APIUsage
        await init_beanie(
            database=Database.database,
            document_models=[PropertyInsight, RealEstateReport, AnalysisJob, FileUpload, MarketListing, UserSession, APIUsage]
        )
        logger.info("✓ Beanie ODM initialized with document models")
        
    except Exception as e:
        logger.error(f"✗ Failed to connect to MongoDB: {str(e)}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if Database.client:
        Database.client.close()
        logger.info("MongoDB connection closed")

def get_database():
    """Get database instance"""
    return Database.database
