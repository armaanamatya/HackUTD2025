from crewai import Task, Crew
from src.agents import BaseAgents
from src.tools import CustomTools


class ProjectPlanningCrew:
    def __init__(self):
        self.agents = BaseAgents()
        self.tools = CustomTools()
        
    def create_project_planning_crew(self) -> Crew:
        project_manager = self.agents.create_project_manager()
        researcher = self.agents.create_researcher()
        writer = self.agents.create_writer()
        
        # Assign tools to agents
        project_manager.tools = self.tools.get_file_tools()
        researcher.tools = self.tools.get_web_tools() + self.tools.get_file_tools()
        writer.tools = self.tools.get_file_tools()
        
        # Define tasks
        requirements_task = Task(
            description="""Analyze the project requirements and create a detailed breakdown.
            Include:
            1. Functional requirements
            2. Technical requirements
            3. Resource needs
            4. Timeline estimates
            5. Risk assessment
            
            Project description: {project_description}
            """,
            agent=project_manager,
            expected_output="Comprehensive project requirements analysis"
        )
        
        research_task = Task(
            description="""Research relevant technologies, frameworks, and best practices.
            Look for:
            1. Similar projects and case studies
            2. Recommended technologies and tools
            3. Common challenges and solutions
            4. Industry standards and practices
            
            Requirements: {requirements}
            """,
            agent=researcher,
            expected_output="Technology research summary with recommendations",
            context=[requirements_task]
        )
        
        planning_task = Task(
            description="""Create a detailed project plan including:
            1. Project timeline and milestones
            2. Task breakdown structure
            3. Resource allocation
            4. Risk mitigation strategies
            5. Success metrics
            
            Requirements: {requirements}
            Research findings: {research_findings}
            """,
            agent=writer,
            expected_output="Complete project plan with timeline and deliverables",
            context=[requirements_task, research_task]
        )
        
        return Crew(
            agents=[project_manager, researcher, writer],
            tasks=[requirements_task, research_task, planning_task],
            verbose=True,
            memory=False,
        )
    
    def run_planning(self, project_description: str) -> str:
        crew = self.create_project_planning_crew()
        result = crew.kickoff(inputs={"project_description": project_description})
        return result