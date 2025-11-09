from crewai import Task, Crew
from src.agents import BaseAgents
from src.tools import CustomTools


class ResearchCrew:
    def __init__(self):
        self.agents = BaseAgents()
        self.tools = CustomTools()
        
    def create_research_crew(self) -> Crew:
        researcher = self.agents.create_researcher()
        writer = self.agents.create_writer()
        
        # Assign tools to agents
        researcher.tools = self.tools.get_web_tools() + self.tools.get_file_tools()
        writer.tools = self.tools.get_file_tools()
        
        # Define tasks
        research_task = Task(
            description="""Research the given topic thoroughly. 
            Gather information from multiple sources and identify key insights.
            Focus on recent developments, trends, and important facts.
            
            Topic: {topic}
            """,
            agent=researcher,
            expected_output="A comprehensive research summary with key findings and insights"
        )
        
        writing_task = Task(
            description="""Based on the research findings, create a well-structured report.
            The report should be clear, engaging, and properly organized.
            Include an executive summary, main findings, and conclusions.
            """,
            agent=writer,
            expected_output="A professional research report with clear structure and insights",
            context=[research_task]
        )
        
        return Crew(
            agents=[researcher, writer],
            tasks=[research_task, writing_task],
            verbose=True,
            memory=False,
        )
    
    def run_research(self, topic: str) -> str:
        crew = self.create_research_crew()
        result = crew.kickoff(inputs={"topic": topic})
        return result