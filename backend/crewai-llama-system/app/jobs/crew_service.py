from typing import List

from app.schemas import FileContext
from app.jobs import jobs as jobs_module


class CrewService:
    """Service wrapper around job orchestration functions."""

    async def run_research_job(self, job_id: str, topic: str) -> None:
        await jobs_module.run_research_job(job_id, topic)

    async def run_project_planning_job(self, job_id: str, project_description: str) -> None:
        await jobs_module.run_project_planning_job(job_id, project_description)

    async def run_response_job(self, job_id: str, user_query: str) -> None:
        await jobs_module.run_response_job(job_id, user_query)

    async def run_response_with_files_job(self, job_id: str, user_query: str, files: List[FileContext]) -> None:
        await jobs_module.run_response_with_files_job(job_id, user_query, files)

    async def run_research_with_files_job(self, job_id: str, topic: str, files: List[FileContext]) -> None:
        await jobs_module.run_research_with_files_job(job_id, topic, files)

    async def run_project_planning_with_files_job(self, job_id: str, project_description: str, files: List[FileContext]) -> None:
        await jobs_module.run_project_planning_with_files_job(job_id, project_description, files)
