from fastapi import APIRouter, BackgroundTasks, HTTPException
from datetime import datetime
import uuid

from app.schemas import (
    ResearchRequest,
    ProjectPlanningRequest,
    RespondRequest,
    ResearchWithFilesRequest,
    ProjectPlanningWithFilesRequest,
    RespondWithFilesRequest,
    JobResponse,
)
from app.jobs.jobs import job_store
from app.jobs.crew_service import CrewService
from config.models import AnalysisJob, JobStatus, JobType

router = APIRouter()
service = CrewService()

@router.post("/research", response_model=JobResponse)
async def start_research(request: ResearchRequest, background_tasks: BackgroundTasks) -> JobResponse:
    job_id = str(uuid.uuid4())
    job = AnalysisJob(
        job_id=job_id,
        job_type=JobType.PROPERTY_INSIGHTS,
        status=JobStatus.PENDING,
        user_query=request.topic,
        input_parameters={"topic": request.topic},
    )
    await job.save()
    background_tasks.add_task(service.run_research_job, job_id, request.topic)
    return JobResponse(job_id=job.job_id, status=job.status, created_at=job.created_at.isoformat(), result=job.result_text, error=job.error_message)

@router.post("/project-planning", response_model=JobResponse)
async def start_project_planning(request: ProjectPlanningRequest, background_tasks: BackgroundTasks) -> JobResponse:
    job_id = str(uuid.uuid4())
    job = AnalysisJob(
        job_id=job_id,
        job_type=JobType.REPORT_GENERATION,
        status=JobStatus.PENDING,
        user_query=request.project_description,
        input_parameters={"project_description": request.project_description},
    )
    await job.save()
    background_tasks.add_task(service.run_project_planning_job, job_id, request.project_description)
    return JobResponse(job_id=job.job_id, status=job.status, created_at=job.created_at.isoformat(), result=job.result_text, error=job.error_message)

@router.post("/respond", response_model=JobResponse)
async def start_response(request: RespondRequest, background_tasks: BackgroundTasks) -> JobResponse:
    job_id = str(uuid.uuid4())
    job_store[job_id] = {"job_id": job_id, "status": "pending", "created_at": datetime.now().isoformat(), "type": "respond", "input": request.user_query, "result": None, "error": None}
    background_tasks.add_task(run_response_job, job_id, request.user_query)
    return JobResponse(**job_store[job_id])

@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str) -> JobResponse:
    job = await AnalysisJob.find_one(AnalysisJob.job_id == job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse(job_id=job.job_id, status=job.status, created_at=job.created_at.isoformat(), result=job.result_text, error=job.error_message)

@router.get("/jobs")
async def list_jobs() -> dict:
    return {"jobs": list(job_store.values())}

@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str) -> dict:
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail="Job not found")
    del job_store[job_id]
    return {"message": f"Job {job_id} deleted"}

@router.post("/research-with-files", response_model=JobResponse)
async def start_research_with_files(request: ResearchWithFilesRequest, background_tasks: BackgroundTasks) -> JobResponse:
    job_id = str(uuid.uuid4())
    job_store[job_id] = {"job_id": job_id, "status": "pending", "created_at": datetime.now().isoformat(), "type": "research-with-files", "input": request.topic, "files": [file.dict() for file in request.files], "result": None, "error": None}
    background_tasks.add_task(service.run_research_with_files_job, job_id, request.topic, request.files)
    return JobResponse(**job_store[job_id])

@router.post("/project-planning-with-files", response_model=JobResponse)
async def start_project_planning_with_files(request: ProjectPlanningWithFilesRequest, background_tasks: BackgroundTasks) -> JobResponse:
    job_id = str(uuid.uuid4())
    job_store[job_id] = {"job_id": job_id, "status": "pending", "created_at": datetime.now().isoformat(), "type": "project-planning-with-files", "input": request.project_description, "files": [file.dict() for file in request.files], "result": None, "error": None}
    background_tasks.add_task(service.run_project_planning_with_files_job, job_id, request.project_description, request.files)
    return JobResponse(**job_store[job_id])

@router.post("/respond-with-files", response_model=JobResponse)
async def start_response_with_files(request: RespondWithFilesRequest, background_tasks: BackgroundTasks) -> JobResponse:
    job_id = str(uuid.uuid4())
    job_store[job_id] = {"job_id": job_id, "status": "pending", "created_at": datetime.now().isoformat(), "type": "respond-with-files", "input": request.user_query, "files": [file.dict() for file in request.files], "result": None, "error": None}
    background_tasks.add_task(service.run_response_with_files_job, job_id, request.user_query, request.files)
    return JobResponse(**job_store[job_id])
