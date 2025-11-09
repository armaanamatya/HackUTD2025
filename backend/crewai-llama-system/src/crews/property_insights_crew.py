from crewai import Task, Crew
from src.agents import BaseAgents
from src.tools import CustomTools


class PropertyInsightsCrew:
    def __init__(self):
        self.agents = BaseAgents()
        self.tools = CustomTools()
        
    def create_insights_crew(self) -> Crew:
        insights_agent = self.agents.create_property_insights_agent()
        report_agent = self.agents.create_report_generation_agent()
        
        # Assign tools to agents
        insights_agent.tools = self.tools.get_web_tools() + self.tools.get_file_tools()
        report_agent.tools = self.tools.get_file_tools()
        
        # Define tasks
        insights_task = Task(
            description="""Gather comprehensive property insights for the given query.
            Focus on collecting market data, property history, and investment analysis for real estate properties.

            Your analysis should include:
            - Property value history and current market price
            - Comparable properties in the area (comps analysis)
            - Neighborhood market trends and growth patterns
            - Local economic factors affecting property values
            - School districts, amenities, and location advantages
            - Investment potential and rental yield estimates
            - Market risks and opportunities

            Tool usage guidelines:
            - Use web search tools to find current market data and property information
            - Research Zillow, Realtor.com, and other real estate platforms
            - Look for recent sales, property tax records, and market reports
            - Gather economic data for the local area

            Query: {topic}
            """,
            agent=insights_agent,
            expected_output="Comprehensive property market insights including current values, historical trends, comps analysis, and investment potential"
        )
        
        report_task = Task(
            description="""Transform the property insights into a professional real estate analysis report.
            Create a well-structured, actionable report that provides clear investment guidance.

            Your report should include:
            1. Executive Summary - Key findings and investment recommendation
            2. Property Overview - Basic details and current status
            3. Market Analysis - Local trends, comps, and pricing analysis
            4. Financial Analysis - Investment potential, cash flow projections, ROI estimates
            5. Risk Assessment - Potential challenges and market risks
            6. Recommendations - Clear action steps and investment advice

            Make the report professional yet accessible, with specific data points and actionable insights.
            """,
            agent=report_agent,
            expected_output="A comprehensive real estate investment report with executive summary, market analysis, financial projections, and clear recommendations",
            context=[insights_task]
        )
        
        return Crew(
            agents=[insights_agent, report_agent],
            tasks=[insights_task, report_task],
            verbose=True,
            memory=False,
        )
    
    def run_insights_analysis(self, topic: str) -> str:
        crew = self.create_insights_crew()
        result = crew.kickoff(inputs={"topic": topic})
        return result
