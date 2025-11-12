from typing import Dict, Any
from fastapi import APIRouter
from config import llm_config
from config.database import get_database

router = APIRouter()

@router.get("/")
async def root() -> Dict[str, Any]:
    """API root describing available endpoints and basic metadata."""
    return {
        "message": "CrewAI Agent API Server",
        "version": "1.0.0",
        "endpoints": {
            "/research": "POST",
            "/project-planning": "POST",
            "/research-with-files": "POST",
            "/project-planning-with-files": "POST",
            "/respond": "POST",
            "/respond-with-files": "POST",
            "/jobs/{job_id}": "GET",
            "/jobs": "GET",
            "/listings": "GET",
            "/listings/search": "POST",
            "/config": "GET"
        }
    }

@router.get("/config")
async def get_config() -> Dict[str, Any]:
    """Return active LLM configuration and readiness status."""
    return {"llm_config": llm_config.get_config_info(), "status": "ready"}

@router.get("/healthz")
async def healthz() -> Dict[str, bool]:
    """Health check indicating database connectivity status."""
    return {"db_connected": get_database() is not None}
