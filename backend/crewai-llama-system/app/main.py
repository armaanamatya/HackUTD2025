import sys
from pathlib import Path
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.routers.config import router as config_router
from app.routers.jobs import router as jobs_router
from app.routers.listings import router as listings_router
from config import llm_config
from config.database import connect_to_mongo, close_mongo_connection

logging.basicConfig(level=logging.INFO, format='[BACKEND] %(asctime)s | %(levelname)s | %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

sys.path.append(str(Path(__file__).parent.parent / "src"))

app = FastAPI(title="CrewAI Agent API", description="API server for querying CrewAI agents", version="1.0.0")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"INCOMING | {request.method} {request.url.path} | Query: {dict(request.query_params)}")
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"OUTGOING | {request.method} {request.url.path} | Status: {response.status_code} | Duration: {process_time:.2f}s")
    return response

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup_event():
    try:
        await connect_to_mongo()
        logger.info("✓ Database connection established")
    except Exception as e:
        logger.error(f"✗ Failed to connect to database: {e}")
    logger.info(f"Active LLM configuration: {llm_config.get_config_info()}")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    logger.info("Database connection closed")

app.include_router(config_router)
app.include_router(jobs_router)
app.include_router(listings_router)
