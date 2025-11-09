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
        
        planning_task = Task(
            description="""Create a detailed real estate project plan based on the market analysis.
            Develop a strategic roadmap with actionable steps and clear objectives.

            Your plan should include:
            1. Executive Summary - Project overview and strategic objectives
            2. Market Opportunity - Key findings from market analysis
            3. Project Scope - Detailed description of the real estate project
            4. Implementation Timeline - Phased approach with key milestones
            5. Financial Projections - Budget, funding requirements, and ROI estimates
            6. Risk Management - Potential challenges and mitigation strategies
            7. Success Metrics - KPIs and measurement criteria
            8. Next Steps - Immediate action items and recommendations

            Make the plan practical and actionable for real estate professionals.
            """,
            agent=report_agent,
            expected_output="Complete real estate project plan with timeline, financial projections, and implementation strategy",
            context=[market_analysis_task]
        )
        
        return Crew(
            agents=[insights_agent, report_agent],
            tasks=[market_analysis_task, planning_task],
            verbose=True,
            memory=False,
        )
    
    def run_report_generation(self, project_description: str) -> str:
        crew = self.create_report_crew()
        result = crew.kickoff(inputs={"project_description": project_description})
        return result