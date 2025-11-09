#!/usr/bin/env python3

import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, UploadFile, File
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
sys.path.append(str(Path(__file__).parent.parent))

from src.crews import PropertyInsightsCrew, ReportGenerationCrew, ChatCrew
from src.services.document_service import DocumentService
from config import llm_config
from config.models import MarketListing, PropertyType, ListingStatus
from config.database import connect_to_mongo, close_mongo_connection

# Import the OCR service from the parser directory
sys.path.append(str(Path(__file__).parent.parent.parent))  # Go to project root
from parser.gemini_ocr_service import GeminiOCRService

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
async def startup_db():
    """Initialize database connection on startup."""
    try:
        logger.info("Initializing database connection...")
        await connect_to_mongo()
        logger.info("✓ Database initialized successfully")
    except Exception as e:
        logger.error(f"✗ Failed to initialize database: {str(e)}")
        # Don't crash the server, just log the error

@app.on_event("shutdown")
async def shutdown_db():
    """Close database connection on shutdown."""
    try:
        logger.info("Closing database connection...")
        await close_mongo_connection()
        logger.info("✓ Database connection closed")
    except Exception as e:
        logger.error(f"✗ Error closing database: {str(e)}")

# Initialize services
document_service = DocumentService()

# Initialize OCR service with error handling
try:
    ocr_service = GeminiOCRService()
    logger.info("✓ OCR service initialized successfully")
except Exception as e:
    logger.error(f"✗ Failed to initialize OCR service: {str(e)}")
    ocr_service = None

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

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    message: str
    text_length: Optional[int] = None
    metrics: Optional[Dict[str, Any]] = None
    clauses_count: Optional[int] = None

class DocumentListResponse(BaseModel):
    documents: List[Dict[str, Any]]
    total_count: int

class ChatRequest(BaseModel):
    message: str
    include_document_context: bool = True

class ChatResponse(BaseModel):
    response: str
    documents_used: List[str]

class ListingsResponse(BaseModel):
    listings: List[Dict[str, Any]]
    total_count: int
    returned_count: int
    page: int
    per_page: int

class ListingSearchRequest(BaseModel):
    query: str
    limit: int = 10

class ListingSearchResponse(BaseModel):
    listings: List[Dict[str, Any]]
    count: int
    query: str

class ListingsStatsResponse(BaseModel):
    total_listings: int
    avg_price: Optional[float]
    median_price: Optional[float]
    min_price: Optional[float]
    max_price: Optional[float]
    top_cities: List[Dict[str, Any]]
    property_types: List[Dict[str, Any]]
    status_distribution: List[Dict[str, Any]]

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
            "/config": "GET - Show LLM configuration",
            "/upload-document": "POST - Upload and process PDF/document with OCR",
            "/documents": "GET - List all uploaded documents", 
            "/documents/{doc_id}": "GET - Get specific document details",
            "/documents/{doc_id}/ocr": "GET - Display OCR extracted information", 
            "/documents/{doc_id}": "DELETE - Delete a document",
            "/chat": "POST - Chat with document context",
            "/test-system-context": "GET - Test system-level document context injection",
            "/listings": "GET - List market listings with filters",
            "/listings/search": "POST - Search listings by query",
            "/listings/stats": "GET - Get market statistics"
        }
    }

@app.get("/config")
async def get_config():
    return {
        "llm_config": llm_config.get_config_info(),
        "status": "ready"
    }

@app.get("/status")
async def get_status():
    """Get the status of all services including OCR."""
    import os
    
    return {
        "api_status": "running",
        "services": {
            "document_service": "initialized" if document_service else "failed",
            "ocr_service": "initialized" if ocr_service else "failed",
        },
        "environment": {
            "has_gemini_api_key": bool(os.getenv("GEMINI_API_KEY")),
            "gemini_api_key_length": len(os.getenv("GEMINI_API_KEY", "")) if os.getenv("GEMINI_API_KEY") else 0
        },
        "endpoints": {
            "upload_document": "/upload-document",
            "list_documents": "/documents", 
            "view_ocr": "/documents/{doc_id}/ocr",
            "chat": "/chat"
        }
    }

@app.get("/test-system-context")
async def test_system_context():
    """Test endpoint to show what document context is injected into agent system instructions."""
    logger.info("Test system context endpoint called")
    
    try:
        from src.agents.base_agents import BaseAgents
        
        # Create agents instance
        agents = BaseAgents()
        
        # Get the raw document context that would be injected
        document_context = agents._get_document_context_for_system()
        
        # Create a test agent to see the full system instructions
        test_agent = agents.create_insight_router_agent()
        
        # Get available documents
        documents = document_service.list_documents()
        
        response_data = {
            "test_results": {
                "documents_available": len(documents),
                "document_list": [
                    {
                        "filename": doc.get("original_filename", "Unknown"),
                        "text_length": doc.get("text_length", 0),
                        "upload_date": doc.get("upload_timestamp", "")
                    }
                    for doc in documents
                ],
                "has_document_context": len(document_context) > 0,
                "context_length": len(document_context),
                "agent_backstory_length": len(test_agent.backstory),
                "context_preview": document_context[:500] + "..." if len(document_context) > 500 else document_context,
                "agent_backstory_includes_docs": "UPLOADED DOCUMENT CONTEXT" in test_agent.backstory
            },
            "full_context": document_context if len(document_context) < 2000 else document_context[:2000] + "\n... [TRUNCATED] ...",
            "system_instructions_sample": test_agent.backstory[-1000:] if len(test_agent.backstory) > 1000 else test_agent.backstory
        }
        
        logger.info(f"System context test completed | Documents: {len(documents)} | Context length: {len(document_context)} chars")
        
        return response_data
        
    except Exception as e:
        logger.error(f"System context test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

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
@app.post("/upload-document", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a PDF or image document with OCR."""
    start_time = time.time()
    logger.info(f"Document upload started | Filename: {file.filename} | Content type: {file.content_type}")
    
    try:
        # Validate file type
        allowed_types = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            logger.warning(f"Invalid file type uploaded | Type: {file.content_type} | Filename: {file.filename}")
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
        
        # Read file
        file_bytes = await file.read()
        file_size = len(file_bytes)
        logger.info(f"File read successfully | Size: {file_size} bytes | Filename: {file.filename}")
        
        # Process with OCR
        logger.info(f"Starting OCR processing | Filename: {file.filename}")
        
        if ocr_service is None:
            logger.error("OCR service not available - initialization failed")
            raise HTTPException(status_code=503, detail="OCR service unavailable. Please check GEMINI_API_KEY configuration.")
        
        ocr_start = time.time()
        
        try:
            ocr_result = ocr_service.process_document_bytes(
                file_bytes=file_bytes,
                file_name=file.filename,
                mime_type=file.content_type
            )
        except Exception as ocr_error:
            logger.error(f"OCR processing failed | Filename: {file.filename} | Error: {str(ocr_error)}")
            raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(ocr_error)}")
        
        ocr_duration = time.time() - ocr_start
        text_length = len(ocr_result.get("text", ""))
        clauses_count = len(ocr_result.get("clauses", []))
        metrics_count = len(ocr_result.get("metrics", {}))
        
        logger.info(f"OCR processing completed | Duration: {ocr_duration:.2f}s | Text length: {text_length} chars | Clauses: {clauses_count} | Metrics: {metrics_count}")
        
        # Log detailed OCR results to terminal
        logger.info("=" * 60)
        logger.info(f"📄 OCR RESULTS FOR: {file.filename}")
        logger.info("=" * 60)
        
        # Log extracted text (FULL CONTENT)
        extracted_text = ocr_result.get("text", "")
        if extracted_text:
            logger.info(f"📝 EXTRACTED FULL TEXT ({text_length} total chars):")
            # Split into lines and log each line for better readability
            for line in extracted_text.split('\n')[:50]:  # Show first 50 lines
                if line.strip():
                    logger.info(f"   {line}")
            if extracted_text.count('\n') > 50:
                logger.info(f"   ... [Content continues for {extracted_text.count('\n') - 50} more lines] ...")
        else:
            logger.info("❌ NO TEXT EXTRACTED")
        
        # Log metrics
        metrics = ocr_result.get("metrics", {})
        if metrics:
            logger.info(f"📊 EXTRACTED METRICS ({len(metrics)} items):")
            for key, value in metrics.items():
                if value is not None:
                    logger.info(f"   • {key}: {value}")
        else:
            logger.info("📊 NO METRICS EXTRACTED")
        
        # Log clauses
        clauses = ocr_result.get("clauses", [])
        if clauses:
            logger.info(f"📋 EXTRACTED CLAUSES ({len(clauses)} items):")
            for i, clause in enumerate(clauses[:5], 1):  # Show first 5 clauses
                title = clause.get("title", "Unknown")
                summary = clause.get("summary", "")[:100]
                logger.info(f"   {i}. {title}: {summary}...")
            if len(clauses) > 5:
                logger.info(f"   ... and {len(clauses) - 5} more clauses")
        else:
            logger.info("📋 NO CLAUSES EXTRACTED")
        
        logger.info("=" * 60)
        
        # Store document
        logger.info(f"Storing document | Filename: {file.filename}")
        doc_id = document_service.store_document(
            file_bytes=file_bytes,
            filename=file.filename,
            mime_type=file.content_type,
            ocr_result=ocr_result
        )
        
        total_duration = time.time() - start_time
        logger.info(f"Document upload completed | ID: {doc_id} | Total duration: {total_duration:.2f}s | Filename: {file.filename}")
        
        return DocumentUploadResponse(
            document_id=doc_id,
            filename=file.filename,
            status="success",
            message="Document uploaded and processed successfully",
            text_length=text_length,
            metrics=ocr_result.get("metrics"),
            clauses_count=clauses_count
        )
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Document upload failed | Duration: {duration:.2f}s | Error: {str(e)} | Filename: {file.filename}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.get("/documents", response_model=DocumentListResponse)
async def list_documents():
    """List all uploaded documents."""
    logger.info("Listing documents request received")
    
    try:
        documents = document_service.list_documents()
        logger.info(f"Documents listed successfully | Count: {len(documents)}")
        
        return DocumentListResponse(
            documents=documents,
            total_count=len(documents)
        )
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")

@app.get("/documents/{doc_id}")
async def get_document(doc_id: str):
    """Get details for a specific document."""
    logger.info(f"Document details request | ID: {doc_id}")
    
    try:
        metadata = document_service.get_document_metadata(doc_id)
        if not metadata:
            logger.warning(f"Document not found | ID: {doc_id}")
            raise HTTPException(status_code=404, detail="Document not found")
        
        ocr_results = document_service.get_document_ocr_results(doc_id)
        
        response = {
            "metadata": metadata,
            "ocr_results": ocr_results
        }
        
        logger.info(f"Document details retrieved successfully | ID: {doc_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document details | ID: {doc_id} | Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting document: {str(e)}")

@app.get("/documents/{doc_id}/ocr")
async def get_document_ocr_display(doc_id: str):
    """Display OCR extracted information in a formatted way."""
    logger.info(f"OCR display request | Document ID: {doc_id}")
    
    try:
        # Get document metadata
        metadata = document_service.get_document_metadata(doc_id)
        if not metadata:
            logger.warning(f"Document not found for OCR display | ID: {doc_id}")
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get OCR results
        ocr_results = document_service.get_document_ocr_results(doc_id)
        if not ocr_results:
            logger.warning(f"OCR results not found | ID: {doc_id}")
            raise HTTPException(status_code=404, detail="OCR results not found")
        
        # Format the display response
        extracted_text = ocr_results.get("extracted_text", "")
        metrics = ocr_results.get("metrics", {})
        clauses = ocr_results.get("clauses", [])
        document_type = ocr_results.get("document_type", "unknown")
        
        # Create formatted display
        display_data = {
            "document_info": {
                "filename": metadata.get("original_filename", "Unknown"),
                "upload_date": metadata.get("upload_timestamp", ""),
                "file_size": metadata.get("file_size", 0),
                "document_type": document_type,
                "processing_date": ocr_results.get("processing_timestamp", "")
            },
            "extracted_content": {
                "text_length": len(extracted_text),
                "full_text": extracted_text,
                "text_preview": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text
            },
            "key_metrics": {
                "total_metrics": len(metrics),
                "metrics": metrics
            },
            "important_clauses": {
                "total_clauses": len(clauses),
                "clauses": clauses
            },
            "summary": {
                "has_financial_data": any(key in str(metrics).lower() for key in ["rent", "price", "amount", "cost"]),
                "has_legal_clauses": len(clauses) > 0,
                "has_dates": any(key in str(metrics).lower() for key in ["date", "expir", "renew"]),
                "confidence_score": metrics.get("complianceScore", 0) if metrics.get("complianceScore") else "N/A"
            }
        }
        
        logger.info(f"OCR display data prepared | Document ID: {doc_id} | Text length: {len(extracted_text)} | Metrics: {len(metrics)} | Clauses: {len(clauses)}")
        
        return display_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error preparing OCR display | Document ID: {doc_id} | Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error preparing OCR display: {str(e)}")

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document."""
    logger.info(f"Document deletion request | ID: {doc_id}")
    
    try:
        success = document_service.delete_document(doc_id)
        if not success:
            logger.warning(f"Document not found for deletion | ID: {doc_id}")
            raise HTTPException(status_code=404, detail="Document not found")
        
        logger.info(f"Document deleted successfully | ID: {doc_id}")
        return {"message": f"Document {doc_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document | ID: {doc_id} | Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_documents(request: ChatRequest, background_tasks: BackgroundTasks):
    """Chat with the AI using document context and current agent implementation."""
    start_time = time.time()
    logger.info("=" * 80)
    logger.info(f"💬 CHAT REQUEST RECEIVED")
    logger.info(f"   Message: {request.message[:100]}{'...' if len(request.message) > 100 else ''}")
    logger.info(f"   Message length: {len(request.message)} chars")
    logger.info(f"   Include document context: {request.include_document_context}")
    logger.info("=" * 80)
    
    try:
        # Get list of available documents for response metadata
        documents_used = []
        
        # Always check for documents, regardless of include_document_context flag
        # (since context is injected at agent creation time)
        documents_list = document_service.list_documents()
        documents_used = [doc.get("original_filename", "Unknown") for doc in documents_list]
        
        logger.info(f"📚 DOCUMENT STORAGE STATUS: {len(documents_used)} document(s) available")
        if documents_used:
            for i, filename in enumerate(documents_used, 1):
                logger.info(f"   {i}. {filename}")
        else:
            logger.info("   ℹ️ No documents found in storage")
        
        logger.info("=" * 80)
        logger.info("🧠 CREATING AGENTS WITH DOCUMENT CONTEXT")
        logger.info("   Document context will be injected into agent system instructions")
        logger.info("   Agents will have access to all uploaded document content")
        logger.info("=" * 80)
        
        # Use the ChatCrew - agents now have document context built into their system instructions
        chat_crew = ChatCrew()
        logger.info("✅ ChatCrew initialized - agents created with document context in system instructions")
        logger.info("🚀 Starting chat execution...")
        
        result = chat_crew.run_chat(
            user_query=request.message,
            document_context=""  # No longer needed - context is in system instructions
        )
        
        duration = time.time() - start_time
        response_length = len(str(result))
        logger.info("=" * 80)
        logger.info(f"✅ CHAT RESPONSE GENERATED")
        logger.info(f"   Duration: {duration:.2f}s")
        logger.info(f"   Response length: {response_length:,} chars")
        logger.info(f"   Documents available: {len(documents_used)}")
        logger.info("=" * 80)
        
        return ChatResponse(
            response=str(result),
            documents_used=documents_used
        )
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error("=" * 80)
        logger.error(f"❌ CHAT REQUEST FAILED")
        logger.error(f"   Duration: {duration:.2f}s")
        logger.error(f"   Error: {str(e)}")
        logger.error("=" * 80, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@app.get("/listings", response_model=ListingsResponse)
async def get_listings(
    page: int = 1,
    per_page: int = 100,
    city: Optional[str] = None,
    state: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_bedrooms: Optional[int] = None,
    max_bedrooms: Optional[int] = None,
    status: Optional[str] = None
):
    """Get market listings with optional filters."""
    logger.info(f"Listings request | Page: {page} | Per page: {per_page} | Filters: city={city}, min_price={min_price}, max_price={max_price}")
    
    try:
        # Build filter criteria
        filter_criteria = {}
        
        if city:
            filter_criteria["city"] = {"$regex": city, "$options": "i"}
        if state:
            filter_criteria["state"] = state
        if property_type:
            filter_criteria["property_type"] = property_type
        if min_price is not None:
            filter_criteria.setdefault("listing_price", {})["$gte"] = min_price
        if max_price is not None:
            filter_criteria.setdefault("listing_price", {})["$lte"] = max_price
        if min_bedrooms is not None:
            filter_criteria.setdefault("bedrooms", {})["$gte"] = min_bedrooms
        if max_bedrooms is not None:
            filter_criteria.setdefault("bedrooms", {})["$lte"] = max_bedrooms
        if status:
            filter_criteria["status"] = status
            
        logger.info(f"Filter criteria: {filter_criteria}")
        
        # Calculate skip for pagination
        skip = (page - 1) * per_page
        
        # Get total count
        total_count = await MarketListing.find(filter_criteria).count()
        
        # Get filtered results
        listings_cursor = MarketListing.find(filter_criteria).skip(skip).limit(per_page).sort("-import_date")
        listings = await listings_cursor.to_list()
        
        # Convert to dict format
        listings_data = []
        for listing in listings:
            listing_dict = listing.dict()
            # Convert datetime objects to strings
            if listing_dict.get("list_date"):
                listing_dict["list_date"] = listing_dict["list_date"].isoformat()
            if listing_dict.get("import_date"):
                listing_dict["import_date"] = listing_dict["import_date"].isoformat()
            listings_data.append(listing_dict)
        
        logger.info(f"Listings retrieved | Total: {total_count} | Returned: {len(listings_data)} | Page: {page}")
        
        return ListingsResponse(
            listings=listings_data,
            total_count=total_count,
            returned_count=len(listings_data),
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        logger.error(f"Error retrieving listings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving listings: {str(e)}")

@app.post("/listings/search", response_model=ListingSearchResponse)
async def search_listings(request: ListingSearchRequest):
    """Search listings by query string."""
    logger.info(f"Listings search | Query: {request.query} | Limit: {request.limit}")
    
    try:
        # Build search criteria
        search_criteria = {
            "$or": [
                {"address": {"$regex": request.query, "$options": "i"}},
                {"city": {"$regex": request.query, "$options": "i"}},
                {"state": {"$regex": request.query, "$options": "i"}},
                {"neighborhood": {"$regex": request.query, "$options": "i"}},
                {"description": {"$regex": request.query, "$options": "i"}}
            ]
        }
        
        # Get search results
        listings_cursor = MarketListing.find(search_criteria).limit(request.limit).sort("-import_date")
        listings = await listings_cursor.to_list()
        
        # Convert to dict format
        listings_data = []
        for listing in listings:
            listing_dict = listing.dict()
            # Convert datetime objects to strings
            if listing_dict.get("list_date"):
                listing_dict["list_date"] = listing_dict["list_date"].isoformat()
            if listing_dict.get("import_date"):
                listing_dict["import_date"] = listing_dict["import_date"].isoformat()
            listings_data.append(listing_dict)
        
        logger.info(f"Search completed | Query: {request.query} | Results: {len(listings_data)}")
        
        return ListingSearchResponse(
            listings=listings_data,
            count=len(listings_data),
            query=request.query
        )
        
    except Exception as e:
        logger.error(f"Error searching listings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching listings: {str(e)}")

@app.get("/listings/stats", response_model=ListingsStatsResponse)
async def get_listings_stats():
    """Get market statistics."""
    logger.info("Listings statistics request")
    
    try:
        # Get total count
        total_count = await MarketListing.count()
        
        # Get price statistics (only for listings with prices)
        price_pipeline = [
            {"$match": {"listing_price": {"$exists": True, "$ne": None, "$gt": 0}}},
            {"$group": {
                "_id": None,
                "avg_price": {"$avg": "$listing_price"},
                "median_price": {"$push": "$listing_price"},
                "min_price": {"$min": "$listing_price"},
                "max_price": {"$max": "$listing_price"}
            }}
        ]
        
        price_stats = await MarketListing.aggregate(price_pipeline).to_list()
        price_data = price_stats[0] if price_stats else {}
        
        # Calculate median manually
        if price_data.get("median_price"):
            prices = sorted(price_data["median_price"])
            n = len(prices)
            median_price = prices[n//2] if n % 2 == 1 else (prices[n//2-1] + prices[n//2]) / 2
        else:
            median_price = None
        
        # Get top cities
        city_pipeline = [
            {"$match": {"city": {"$exists": True, "$ne": None, "$ne": ""}}},
            {"$group": {"_id": "$city", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        
        city_stats = await MarketListing.aggregate(city_pipeline).to_list()
        top_cities = [{"city": stat["_id"], "count": stat["count"]} for stat in city_stats]
        
        # Get property types
        type_pipeline = [
            {"$match": {"property_type": {"$exists": True, "$ne": None}}},
            {"$group": {"_id": "$property_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        type_stats = await MarketListing.aggregate(type_pipeline).to_list()
        property_types = [{"type": stat["_id"], "count": stat["count"]} for stat in type_stats]
        
        # Get status distribution
        status_pipeline = [
            {"$match": {"status": {"$exists": True, "$ne": None}}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        status_stats = await MarketListing.aggregate(status_pipeline).to_list()
        status_distribution = [{"status": stat["_id"], "count": stat["count"]} for stat in status_stats]
        
        logger.info(f"Statistics generated | Total listings: {total_count} | Top cities: {len(top_cities)} | Property types: {len(property_types)}")
        
        return ListingsStatsResponse(
            total_listings=total_count,
            avg_price=price_data.get("avg_price"),
            median_price=median_price,
            min_price=price_data.get("min_price"),
            max_price=price_data.get("max_price"),
            top_cities=top_cities,
            property_types=property_types,
            status_distribution=status_distribution
        )
        
    except Exception as e:
        logger.error(f"Error generating statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating statistics: {str(e)}")

async def run_research_job(job_id: str, topic: str):
    start_time = time.time()
    logger.info(f"Starting research job | Job ID: {job_id}")
    
    try:
        # Update status to running
        job_store[job_id]["status"] = "running"
        logger.info(f"Research job status updated to running | Job ID: {job_id}")
        
        # Run the property insights crew
        crew = PropertyInsightsCrew()
        logger.info(f"Running property insights crew | Job ID: {job_id}")
        result = crew.run_insights_analysis(topic)
        
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
