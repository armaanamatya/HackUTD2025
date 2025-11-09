#!/usr/bin/env python3

import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
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

from src.crews import ResearchCrew, ProjectPlanningCrew
from config import llm_config

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

# In-memory storage for job tracking
job_store: Dict[str, Dict[str, Any]] = {}

class ResearchRequest(BaseModel):
    topic: str

class ProjectPlanningRequest(BaseModel):
    project_description: str

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
            "/jobs/{job_id}": "GET - Get job status and results",
            "/jobs": "GET - List all jobs",
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
    
    # Create job record
    job_store[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "type": "research",
        "input": request.topic,
        "result": None,
        "error": None
    }
    
    # Start background task
    background_tasks.add_task(run_research_job, job_id, request.topic)
    
    return JobResponse(**job_store[job_id])

@app.post("/project-planning", response_model=JobResponse)
async def start_project_planning(request: ProjectPlanningRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    
    # Create job record
    job_store[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "type": "project-planning",
        "input": request.project_description,
        "result": None,
        "error": None
    }
    
    # Start background task
    background_tasks.add_task(run_project_planning_job, job_id, request.project_description)
    
    return JobResponse(**job_store[job_id])

@app.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobResponse(**job_store[job_id])

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

async def run_research_job(job_id: str, topic: str):
    start_time = time.time()
    logger.info(f"Starting research job | Job ID: {job_id}")
    
    try:
        # Update status to running
        job_store[job_id]["status"] = "running"
        logger.info(f"Research job status updated to running | Job ID: {job_id}")
        
        # Run the research crew
        crew = ResearchCrew()
        logger.info(f"Running research crew | Job ID: {job_id}")
        result = crew.run_research(topic)
        
        duration = time.time() - start_time
        logger.info(f"Research crew completed | Job ID: {job_id} | Duration: {duration:.2f}s | Result length: {len(str(result))} chars")
        
        # Update with results
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = str(result)
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Research job failed | Job ID: {job_id} | Duration: {duration:.2f}s | Error: {str(e)}")
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

async def run_project_planning_job(job_id: str, project_description: str):
    start_time = time.time()
    logger.info(f"Starting project planning job | Job ID: {job_id}")
    
    try:
        # Update status to running
        job_store[job_id]["status"] = "running"
        logger.info(f"Project planning job status updated to running | Job ID: {job_id}")
        
        # Run the project planning crew
        crew = ProjectPlanningCrew()
        logger.info(f"Running project planning crew | Job ID: {job_id}")
        result = crew.run_planning(project_description)
        
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
        
        # Run the research crew with enhanced context
        crew = ResearchCrew()
        logger.info(f"Running research crew with file context | Job ID: {job_id}")
        result = crew.run_research(enhanced_topic)
        
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
        
        # Run the project planning crew with enhanced context
        crew = ProjectPlanningCrew()
        logger.info(f"Running project planning crew with file context | Job ID: {job_id}")
        result = crew.run_planning(enhanced_description)
        
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