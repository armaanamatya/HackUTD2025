from pydantic import BaseModel
from typing import Dict, Any, Optional, List

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
    status: str
    created_at: str
    result: Optional[str] = None
    error: Optional[str] = None

class ListingSearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = {}
    limit: int = 50
