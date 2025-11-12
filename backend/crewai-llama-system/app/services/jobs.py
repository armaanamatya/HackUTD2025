import time
from datetime import datetime
from typing import List, Dict, Any
import uuid
import logging

from app.utils.json_utils import normalize_json_result
from app.schemas import FileContext
from src.crews import PropertyInsightsCrew, ReportGenerationCrew, ResponseRoutingCrew
from config.models import AnalysisJob, JobStatus, JobType

logger = logging.getLogger(__name__)

job_store: Dict[str, Dict[str, Any]] = {}

async def run_research_job(job_id: str, topic: str):
    start_time = time.time()
    job = await AnalysisJob.find_one(AnalysisJob.job_id == job_id)
    if not job:
        return
    try:
        job.status = JobStatus.RUNNING
        job.started_at = datetime.utcnow()
        await job.save()
        crew = PropertyInsightsCrew()
        result = crew.run_insights_analysis(topic)
        duration = time.time() - start_time
        job.status = JobStatus.COMPLETED
        job.result_text = str(result)
        job.completed_at = datetime.utcnow()
        job.processing_time_seconds = duration
        await job.save()
    except Exception as e:
        duration = time.time() - start_time
        job.status = JobStatus.FAILED
        job.error_message = str(e)
        job.completed_at = datetime.utcnow()
        job.processing_time_seconds = duration
        await job.save()

async def run_project_planning_job(job_id: str, project_description: str):
    start_time = time.time()
    try:
        job_store[job_id]["status"] = "running"
        crew = ReportGenerationCrew()
        result = crew.run_report_generation(project_description)
        duration = time.time() - start_time
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = str(result)
    except Exception as e:
        duration = time.time() - start_time
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

async def run_response_job(job_id: str, user_query: str):
    start_time = time.time()
    try:
        job_store[job_id]["status"] = "running"
        crew = ResponseRoutingCrew()
        result = crew.run_response_workflow(user_query)
        duration = time.time() - start_time
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = normalize_json_result(str(result))
    except Exception as e:
        duration = time.time() - start_time
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

async def run_response_with_files_job(job_id: str, user_query: str, files: List[FileContext]):
    start_time = time.time()
    try:
        job_store[job_id]["status"] = "running"
        file_context = "\n\n=== DOCUMENT CONTEXT ===\n"
        for file in files:
            file_context += f"\n--- File: {file.fileName} ---\n"
            file_context += f"Content: {file.content}\n"
            if file.extractedText:
                file_context += f"Extracted Text: {file.extractedText}\n"
            if file.metrics:
                file_context += f"Metrics: {file.metrics}\n"
        file_context += "\n=== END DOCUMENT CONTEXT ===\n\n"
        enhanced_query = f"{user_query}\n\n{file_context}Please consider the uploaded documents in classification and generation."
        crew = ResponseRoutingCrew()
        result = crew.run_response_workflow(enhanced_query)
        duration = time.time() - start_time
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = normalize_json_result(str(result))
    except Exception as e:
        duration = time.time() - start_time
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

async def run_research_with_files_job(job_id: str, topic: str, files: List[FileContext]):
    start_time = time.time()
    try:
        job_store[job_id]["status"] = "running"
        file_context = "\n\n=== DOCUMENT CONTEXT ===\n"
        for file in files:
            file_context += f"\n--- File: {file.fileName} ---\n"
            file_context += f"Content: {file.content}\n"
            if file.extractedText:
                file_context += f"Extracted Text: {file.extractedText}\n"
            if file.metrics:
                file_context += f"Metrics: {file.metrics}\n"
        file_context += "\n=== END DOCUMENT CONTEXT ===\n\n"
        enhanced_topic = f"{topic}\n\n{file_context}Please consider the uploaded documents in your research and analysis."
        crew = PropertyInsightsCrew()
        result = crew.run_insights_analysis(enhanced_topic)
        duration = time.time() - start_time
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = str(result)
    except Exception as e:
        duration = time.time() - start_time
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)

async def run_project_planning_with_files_job(job_id: str, project_description: str, files: List[FileContext]):
    start_time = time.time()
    try:
        job_store[job_id]["status"] = "running"
        file_context = "\n\n=== DOCUMENT CONTEXT ===\n"
        for file in files:
            file_context += f"\n--- File: {file.fileName} ---\n"
            file_context += f"Content: {file.content}\n"
            if file.extractedText:
                file_context += f"Extracted Text: {file.extractedText}\n"
            if file.metrics:
                file_context += f"Metrics: {file.metrics}\n"
        file_context += "\n=== END DOCUMENT CONTEXT ===\n\n"
        enhanced_description = f"{project_description}\n\n{file_context}Please consider the uploaded documents in your project planning and analysis."
        crew = ReportGenerationCrew()
        result = crew.run_report_generation(enhanced_description)
        duration = time.time() - start_time
        job_store[job_id]["status"] = "completed"
        job_store[job_id]["result"] = str(result)
    except Exception as e:
        duration = time.time() - start_time
        job_store[job_id]["status"] = "failed"
        job_store[job_id]["error"] = str(e)
