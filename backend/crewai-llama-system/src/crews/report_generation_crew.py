from crewai import Task, Crew
from src.agents import BaseAgents
from src.tools import CustomTools


class ReportGenerationCrew:
    def __init__(self):
        self.agents = BaseAgents()
        self.tools = CustomTools()
        
    def create_report_crew(self) -> Crew:
        insights_agent = self.agents.create_property_insights_agent()
        report_agent = self.agents.create_report_generation_agent()
        
        # Assign tools to agents
        insights_agent.tools = self.tools.get_web_tools() + self.tools.get_file_tools()
        report_agent.tools = self.tools.get_file_tools()
        
        # Define tasks
        market_analysis_task = Task(
            description="""Conduct comprehensive market analysis for the real estate investment or development project.
            Focus on gathering data that supports strategic planning and decision-making.

            Your analysis should include:
            - Target market demographics and trends
            - Competitive landscape and market saturation
            - Economic indicators affecting the real estate market
            - Zoning laws and development regulations
            - Infrastructure and future development plans
            - Market demand projections and growth potential
            - Financing options and market conditions

            Tool usage guidelines:
            - Research local market reports and economic data
            - Look for development patterns and upcoming projects
            - Analyze regulatory environment and permitting requirements
            - Gather data on market demand and supply dynamics

            Project description: {project_description}
            """,
            agent=insights_agent,
            expected_output="Comprehensive market analysis with strategic insights for real estate project planning"
        )
        
        answer_task = Task(
            description="""Create a concise, comprehensive answer based on the market analysis and search data.
            Synthesize all relevant information from Tavily and Perplexity searches into a direct, actionable response.

            Your answer should be:
            - Concise but complete, containing all relevant information
            - Well-structured with clear sections
            - Focused on key insights and actionable recommendations
            - Free of unnecessary verbosity while maintaining thoroughness
            - Based on data from multiple sources (market analysis, web searches)

            Structure your answer as:
            • Key Findings - Most important insights from the research
            • Market Summary - Essential market data and trends
            • Recommendations - Clear, actionable next steps
            • Supporting Data - Relevant metrics and sources

            Prioritize clarity and usefulness over length. Every sentence should add value.
            """,
            agent=report_agent,
            expected_output="Concise, comprehensive answer containing all relevant information from searches and analysis",
            context=[market_analysis_task]
        )
        
        return Crew(
            agents=[insights_agent, report_agent],
            tasks=[market_analysis_task, answer_task],
            verbose=True,
            memory=False,
        )
    
    def run_report_generation(self, project_description: str) -> str:
        crew = self.create_report_crew()
        result = crew.kickoff(inputs={"project_description": project_description})
        return result