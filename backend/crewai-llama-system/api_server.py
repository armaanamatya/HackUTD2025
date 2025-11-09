#!/usr/bin/env python3

import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import re
import json
from datetime import datetime, timezone
import asyncio
from datetime import datetime
import uuid
import time
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[BACKEND] %(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Add src directory to path
sys.path.append(str(Path(__file__).parent / "src"))

from src.crews import PropertyInsightsCrew, ReportGenerationCrew, ResponseRoutingCrew
from config import llm_config
from config.database import connect_to_mongo, close_mongo_connection
from config.models import AnalysisJob, PropertyInsight, RealEstateReport, FileUpload, MarketListing, JobStatus, JobType

app = FastAPI(
    title="CrewAI Agent API",
    description="API server for querying CrewAI agents",
    version="1.0.0"
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request (but skip headers for brevity)
    logger.info(f"INCOMING | {request.method} {request.url.path} | Query: {dict(request.query_params)}")
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(f"OUTGOING | {request.method} {request.url.path} | Status: {response.status_code} | Duration: {process_time:.2f}s")
    
    return response

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Connect to MongoDB on startup"""
    try:
        await connect_to_mongo()
        logger.info("✓ Database connection established")
    except Exception as e:
        logger.error(f"✗ Failed to connect to database: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown"""
    await close_mongo_connection()
    logger.info("Database connection closed")

# In-memory storage for job tracking
job_store: Dict[str, Dict[str, Any]] = {}


def _normalize_json_result(raw: str) -> str:
    """Attempt to return a clean JSON string from agent output.
    - If raw is valid JSON, return compact dumps.
    - Else, try to extract a ```json fenced block.
    - Else, try to find the first JSON object via braces.
    - Fallback to original string if parsing fails.
    """
    def _ensure_timestamp(obj: Dict[str, Any]) -> Dict[str, Any]:
        # Ensure generated_at is a current ISO-8601 UTC timestamp
        now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        if not isinstance(obj, dict):
            return obj
        if "generated_at" not in obj or not isinstance(obj["generated_at"], str):
            obj["generated_at"] = now_iso
        return obj

    try:
        parsed = json.loads(raw)
        parsed = _ensure_timestamp(parsed)
        return json.dumps(parsed, separators=(",", ":"))
    except Exception:
        pass

    # Look for fenced code block ```json ... ```
    m = re.search(r"```json\s*([\s\S]*?)\s*```", raw)
    if m:
        block = m.group(1).strip()
        try:
            parsed = json.loads(block)
            parsed = _ensure_timestamp(parsed)
            return json.dumps(parsed, separators=(",", ":"))
        except Exception:
            pass

    # Heuristic: find first { ... } matching block
    brace_start = raw.find("{")
    brace_end = raw.rfind("}")
    if brace_start != -1 and brace_end != -1 and brace_end > brace_start:
        candidate = raw[brace_start:brace_end + 1]
        try:
            parsed = json.loads(candidate)
            parsed = _ensure_timestamp(parsed)
            return json.dumps(parsed, separators=(",", ":"))
        except Exception:
            pass

    return raw

class ResearchRequest(BaseModel):
    topic: str

class ProjectPlanningRequest(BaseModel):
    project_description: str

class RespondRequest(BaseModel):
    user_query: str

class FileContext(BaseModel):
    fileName: str
    content: str
    fileType: str
    extractedText: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
    clauses: Optional[List[Dict[str, str]]] = None

class ResearchWithFilesRequest(BaseModel):
    topic: str
    files: List[FileContext]

class ProjectPlanningWithFilesRequest(BaseModel):
    project_description: str
    files: List[FileContext]

class RespondWithFilesRequest(BaseModel):
    user_query: str
    files: List[FileContext]

class JobResponse(BaseModel):
    job_id: str
    status: str  # "pending", "running", "completed", "failed"
    created_at: str
    result: Optional[str] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "CrewAI Agent API Server",
        "version": "1.0.0",
        "endpoints": {
            "/research": "POST - Run research crew",
            "/project-planning": "POST - Run project planning crew", 
            "/research-with-files": "POST - Run research crew with file context",
            "/project-planning-with-files": "POST - Run project planning crew with file context",
            "/respond": "POST - Classify and generate multi-agent response",
            "/respond-with-files": "POST - Classify and generate response with file context",
            "/jobs/{job_id}": "GET - Get job status and results",
            "/jobs": "GET - List all jobs",
            "/listings": "GET - Get market listings",
            "/listings/search": "POST - Search market listings",
            "/config": "GET - Show LLM configuration"
        }
    }

@app.get("/config")
async def get_config():
    return {
        "llm_config": llm_config.get_config_info(),
        "status": "ready"
    }

@app.post("/research", response_model=JobResponse)
async def start_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    
    # Create job record in MongoDB
    job = AnalysisJob(
        job_id=job_id,
        job_type=JobType.PROPERTY_INSIGHTS,
        status=JobStatus.PENDING,
        user_query=request.topic,
        input_parameters={"topic": request.topic}
    )
    await job.save()
    
    # Start background task
    background_tasks.add_task(run_research_job, job_id, request.topic)
    
    return JobResponse(
        job_id=job.job_id,
        status=job.status,
        created_at=job.created_at.isoformat(),
        result=job.result_text,
        error=job.error_message
    )

@app.post("/project-planning", response_model=JobResponse)
async def start_project_planning(request: ProjectPlanningRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    
    # Create job record in MongoDB
    job = AnalysisJob(
        job_id=job_id,
        job_type=JobType.REPORT_GENERATION,
        status=JobStatus.PENDING,
        user_query=request.project_description,
        input_parameters={"project_description": request.project_description}
    )
    await job.save()
    
    # Start background task
    background_tasks.add_task(run_project_planning_job, job_id, request.project_description)
    
    return JobResponse(
        job_id=job.job_id,
        status=job.status,
        created_at=job.created_at.isoformat(),
        result=job.result_text,
        error=job.error_message
    )

@app.post("/respond", response_model=JobResponse)
async def start_response(request: RespondRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    
    job_store[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "type": "respond",
        "input": request.user_query,
        "result": None,
        "error": None
    }
    
    background_tasks.add_task(run_response_job, job_id, request.user_query)
    
    return JobResponse(**job_store[job_id])

@app.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    job = await AnalysisJob.find_one(AnalysisJob.job_id == job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobResponse(
        job_id=job.job_id,
        status=job.status,
        created_at=job.created_at.isoformat(),
        result=job.result_text,
        error=job.error_message
    )

@app.get("/jobs")
async def list_jobs():
    return {"jobs": list(job_store.values())}

@app.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail="Job not found")
    
    del job_store[job_id]
    return {"message": f"Job {job_id} deleted"}

@app.post("/research-with-files", response_model=JobResponse)
async def start_research_with_files(request: ResearchWithFilesRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    
    # Create job record
    job_store[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "type": "research-with-files",
        "input": request.topic,
        "files": [file.dict() for file in request.files],
        "result": None,
        "error": None
    }
    
    # Start background task
    background_tasks.add_task(run_research_with_files_job, job_id, request.topic, request.files)
    
    return JobResponse(**job_store[job_id])

@app.post("/project-planning-with-files", response_model=JobResponse)
async def start_project_planning_with_files(request: ProjectPlanningWithFilesRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    
    # Create job record
    job_store[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "type": "project-planning-with-files",
        "input": request.project_description,
        "files": [file.dict() for file in request.files],
        "result": None,
        "error": None
    }
    
    # Start background task
    background_tasks.add_task(run_project_planning_with_files_job, job_id, request.project_description, request.files)
    
    return JobResponse(**job_store[job_id])

<<<<<<< Updated upstream
# Helper function to clean NaN values from dictionaries
def clean_nan_values(obj: Any) -> Any:
    """Recursively convert NaN values to None for JSON serialization"""
    import math
    
    if isinstance(obj, dict):
        return {key: clean_nan_values(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj):
            return None
        return obj
    else:
        return obj

# Market Listings Endpoints
@app.get("/listings")
async def get_market_listings(
    city: Optional[str] = None,
    state: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
):
    """Get market listings with optional filters"""
    try:
        # Build filter query
        filters = {}
        if city:
            filters["city"] = {"$regex": city, "$options": "i"}
        if state:
            filters["state"] = state.upper()
        if min_price is not None or max_price is not None:
            price_filter = {}
            if min_price is not None:
                price_filter["$gte"] = min_price
            if max_price is not None:
                price_filter["$lte"] = max_price
            filters["listing_price"] = price_filter
        if property_type:
            filters["property_type"] = property_type
        if status:
            filters["status"] = status
        
        # Query database
        cursor = MarketListing.find(filters).skip(skip).limit(limit)
        listings = await cursor.to_list()
        
        # Get total count
        total_count = await MarketListing.find(filters).count()
        
        # Convert listings to dicts and clean NaN values
        listings_dicts = [clean_nan_values(listing.dict()) for listing in listings]
        
        return {
            "listings": listings_dicts,
            "total_count": total_count,
            "returned_count": len(listings),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"Error fetching listings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class ListingSearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = {}
    limit: int = 50

@app.post("/listings/search")
async def search_listings(request: ListingSearchRequest):
    """Search market listings by address, city, or neighborhood"""
    try:
        # Build search query
        search_filters = []
        
        # Text search across multiple fields
        if request.query:
            search_pattern = {"$regex": request.query, "$options": "i"}
            search_filters.append({
                "$or": [
                    {"address": search_pattern},
                    {"city": search_pattern},
                    {"neighborhood": search_pattern},
                    {"zip_code": search_pattern}
                ]
            })
        
        # Add additional filters
        if request.filters:
            search_filters.append(request.filters)
        
        # Combine filters
        if search_filters:
            final_filter = {"$and": search_filters} if len(search_filters) > 1 else search_filters[0]
        else:
            final_filter = {}
        
        # Execute search
        cursor = MarketListing.find(final_filter).limit(request.limit)
        listings = await cursor.to_list()
        
        # Convert listings to dicts and clean NaN values
        listings_dicts = [clean_nan_values(listing.dict()) for listing in listings]
        
        return {
            "query": request.query,
            "results": listings_dicts,
            "count": len(listings)
        }
        
    except Exception as e:
        logger.error(f"Error searching listings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/listings/stats")
async def get_listing_stats():
    """Get market listing statistics"""
    try:
        total_listings = await MarketListing.count()
        
        # Aggregate statistics
        pipeline = [
            {
                "$group": {
                    "_id": "$city",
                    "count": {"$sum": 1},
                    "avg_price": {"$avg": "$listing_price"},
                    "min_price": {"$min": "$listing_price"},
                    "max_price": {"$max": "$listing_price"}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        
        city_stats = await MarketListing.aggregate(pipeline).to_list()
        
        # Property type distribution
        type_pipeline = [
            {
                "$group": {
                    "_id": "$property_type",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}}
        ]
        
        type_stats = await MarketListing.aggregate(type_pipeline).to_list()
        
        # Clean NaN values from stats
        city_stats_cleaned = clean_nan_values(city_stats)
        type_stats_cleaned = clean_nan_values(type_stats)
        
        return {
            "total_listings": total_listings,
            "top_cities": city_stats_cleaned,
            "property_types": type_stats_cleaned,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting listing stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
=======
@app.post("/respond-with-files", response_model=JobResponse)
async def start_response_with_files(request: RespondWithFilesRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    
    job_store[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "type": "respond-with-files",
        "input": request.user_query,
        "files": [file.dict() for file in request.files],
        "result": None,
        "error": None
    }
    
    background_tasks.add_task(run_response_with_files_job, job_id, request.user_query, request.files)
    
    return JobResponse(**job_store[job_id])
>>>>>>> Stashed changes

async def run_research_job(job_id: str, topic: str):
    start_time = time.time()
    logger.info(f"Starting research job | Job ID: {job_id}")
    
    # Get job from MongoDB
    job = await AnalysisJob.find_one(AnalysisJob.job_id == job_id)
    if not job:
        logger.error(f"Job {job_id} not found in database")
        return
    
    try:
        # Update status to running
        job.status = JobStatus.RUNNING
        job.started_at = datetime.utcnow()
        await job.save()
        logger.info(f"Research job status updated to running | Job ID: {job_id}")
        
        # Run the property insights crew
        crew = PropertyInsightsCrew()
        logger.info(f"Running property insights crew | Job ID: {job_id}")
        result = crew.run_insights_analysis(topic)
        
        duration = time.time() - start_time
        logger.info(f"Research crew completed | Job ID: {job_id} | Duration: {duration:.2f}s | Result length: {len(str(result))} chars")
        
        # Update with results
        job.status = JobStatus.COMPLETED
        job.result_text = str(result)
        job.completed_at = datetime.utcnow()
        job.processing_time_seconds = duration
        await job.save()
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Research job failed | Job ID: {job_id} | Duration: {duration:.2f}s | Error: {str(e)}")
        job.status = JobStatus.FAILED
        job.error_message = str(e)
        job.completed_at = datetime.utcnow()
        job.processing_time_seconds = duration
        await job.save()

async def run_project_planning_job(job_id: str, project_description: str):
    start_time = time.time()
    logger.info(f"Starting project planning job | Job ID: {job_id}")
    
    try:
        # Update status to running
        job_store[job_id]["status"] = "running"
        logger.info(f"Project planning job status updated to running | Job ID: {job_id}")
        
        # Run the report generation crew
        crew = ReportGenerationCrew()
        logger.info(f"Running report generation crew | Job ID: {job_id}")
        result = crew.run_report_generation(project_description)
        
        duration = time.time() - start_time
        logger.info(f"Project planning crew completed | Job ID: {job_id} | Duration: {duration:.2f}s | Result length: {len(str(result))} chars")
        
        # Update with results
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = str(result)
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Project planning job failed | Job ID: {job_id} | Duration: {duration:.2f}s | Error: {str(e)}")
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

async def run_response_job(job_id: str, user_query: str):
    start_time = time.time()
    logger.info(f"Starting response job | Job ID: {job_id}")
    
    try:
        job_store[job_id]["status"] = "running"
        logger.info(f"Response job status updated to running | Job ID: {job_id}")
        
        crew = ResponseRoutingCrew()
        logger.info(f"Running response routing crew | Job ID: {job_id}")
        result = crew.run_response_workflow(user_query)
        
        duration = time.time() - start_time
        logger.info(f"Response routing completed | Job ID: {job_id} | Duration: {duration:.2f}s | Result length: {len(str(result))} chars")
        
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = _normalize_json_result(str(result))
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Response job failed | Job ID: {job_id} | Duration: {duration:.2f}s | Error: {str(e)}")
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

async def run_response_with_files_job(job_id: str, user_query: str, files: List[FileContext]):
    start_time = time.time()
    logger.info(f"Starting response with files job | Job ID: {job_id} | File count: {len(files)}")
    
    try:
        job_store[job_id]["status"] = "running"
        logger.info(f"Response with files job status updated to running | Job ID: {job_id}")

        file_context = "\n\n=== DOCUMENT CONTEXT ===\n"
        total_content_length = 0
        for i, file in enumerate(files):
            logger.info(f"Processing file {i+1}/{len(files)}: {file.fileName} | Job ID: {job_id}")
            file_context += f"\n--- File: {file.fileName} ---\n"
            file_context += f"Content: {file.content}\n"
            total_content_length += len(file.content)
            if file.extractedText:
                file_context += f"Extracted Text: {file.extractedText}\n"
                total_content_length += len(file.extractedText)
            if file.metrics:
                file_context += f"Metrics: {file.metrics}\n"
        file_context += "\n=== END DOCUMENT CONTEXT ===\n\n"
        logger.info(f"File context prepared | Job ID: {job_id} | Total content length: {total_content_length} chars")
        
        enhanced_query = f"{user_query}\n\n{file_context}Please consider the uploaded documents in classification and generation."
        logger.info(f"Enhanced query length: {len(enhanced_query)} chars | Job ID: {job_id}")
        
        crew = ResponseRoutingCrew()
        logger.info(f"Running response routing crew with file context | Job ID: {job_id}")
        result = crew.run_response_workflow(enhanced_query)
        
        duration = time.time() - start_time
        logger.info(f"Response with files completed | Job ID: {job_id} | Duration: {duration:.2f}s | Result length: {len(str(result))} chars")
        
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = _normalize_json_result(str(result))
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Response with files job failed | Job ID: {job_id} | Duration: {duration:.2f}s | Error: {str(e)}")
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

async def run_research_with_files_job(job_id: str, topic: str, files: List[FileContext]):
    start_time = time.time()
    logger.info(f"Starting research with files job | Job ID: {job_id} | File count: {len(files)}")
    
    try:
        # Update status to running
        job_store[job_id]["status"] = "running"
        logger.info(f"Research with files job status updated to running | Job ID: {job_id}")
        
        # Prepare context from files
        logger.info(f"Preparing file context | Job ID: {job_id}")
        file_context = "\n\n=== DOCUMENT CONTEXT ===\n"
        total_content_length = 0
        
        for i, file in enumerate(files):
            logger.info(f"Processing file {i+1}/{len(files)}: {file.fileName} | Job ID: {job_id}")
            file_context += f"\n--- File: {file.fileName} ---\n"
            file_context += f"Content: {file.content}\n"
            total_content_length += len(file.content)
            
            if file.extractedText:
                file_context += f"Extracted Text: {file.extractedText}\n"
                total_content_length += len(file.extractedText)
            if file.metrics:
                file_context += f"Metrics: {file.metrics}\n"
                
        file_context += "\n=== END DOCUMENT CONTEXT ===\n\n"
        logger.info(f"File context prepared | Job ID: {job_id} | Total content length: {total_content_length} chars")
        
        # Combine topic with file context
        enhanced_topic = f"{topic}\n\n{file_context}Please consider the uploaded documents in your research and analysis."
        logger.info(f"Enhanced topic length: {len(enhanced_topic)} chars | Job ID: {job_id}")
        
        # Run the property insights crew with enhanced context
        crew = PropertyInsightsCrew()
        logger.info(f"Running property insights crew with file context | Job ID: {job_id}")
        result = crew.run_insights_analysis(enhanced_topic)
        
        duration = time.time() - start_time
        logger.info(f"Research with files crew completed | Job ID: {job_id} | Duration: {duration:.2f}s | Result length: {len(str(result))} chars")
        
        # Update with results
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = str(result)
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Research with files job failed | Job ID: {job_id} | Duration: {duration:.2f}s | Error: {str(e)}")
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

async def run_project_planning_with_files_job(job_id: str, project_description: str, files: List[FileContext]):
    start_time = time.time()
    logger.info(f"Starting project planning with files job | Job ID: {job_id} | File count: {len(files)}")
    
    try:
        # Update status to running
        job_store[job_id]["status"] = "running"
        logger.info(f"Project planning with files job status updated to running | Job ID: {job_id}")
        
        # Prepare context from files
        logger.info(f"Preparing file context | Job ID: {job_id}")
        file_context = "\n\n=== DOCUMENT CONTEXT ===\n"
        total_content_length = 0
        
        for i, file in enumerate(files):
            logger.info(f"Processing file {i+1}/{len(files)}: {file.fileName} | Job ID: {job_id}")
            file_context += f"\n--- File: {file.fileName} ---\n"
            file_context += f"Content: {file.content}\n"
            total_content_length += len(file.content)
            
            if file.extractedText:
                file_context += f"Extracted Text: {file.extractedText}\n"
                total_content_length += len(file.extractedText)
            if file.metrics:
                file_context += f"Metrics: {file.metrics}\n"
                
        file_context += "\n=== END DOCUMENT CONTEXT ===\n\n"
        logger.info(f"File context prepared | Job ID: {job_id} | Total content length: {total_content_length} chars")
        
        # Combine project description with file context
        enhanced_description = f"{project_description}\n\n{file_context}Please consider the uploaded documents in your project planning and analysis."
        logger.info(f"Enhanced description length: {len(enhanced_description)} chars | Job ID: {job_id}")
        
        # Run the report generation crew with enhanced context
        crew = ReportGenerationCrew()
        logger.info(f"Running report generation crew with file context | Job ID: {job_id}")
        result = crew.run_report_generation(enhanced_description)
        
        duration = time.time() - start_time
        logger.info(f"Project planning with files crew completed | Job ID: {job_id} | Duration: {duration:.2f}s | Result length: {len(str(result))} chars")
        
        # Update with results
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = str(result)
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Project planning with files job failed | Job ID: {job_id} | Duration: {duration:.2f}s | Error: {str(e)}")
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
