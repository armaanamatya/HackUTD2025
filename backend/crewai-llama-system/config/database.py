#!/usr/bin/env python3

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

# MongoDB connection string
MONGODB_URL = "mongodb+srv://armaanamatya2014_db_user:4czlTmpWmiMKeGEL@cluster0.rxrhayj.mongodb.net/?appName=Cluster0"
DATABASE_NAME = "hackutd_real_estate"

async def connect_to_mongo():
    """Create database connection"""
    try:
        Database.client = AsyncIOMotorClient(MONGODB_URL)
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