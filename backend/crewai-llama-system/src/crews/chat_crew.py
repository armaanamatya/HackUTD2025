from crewai import Task, Crew
from src.agents.base_agents import BaseAgents
from src.tools.custom_tools import CustomTools


class ChatCrew:
    def __init__(self):
        self.agents = BaseAgents()
        self.tools = CustomTools()
        
    def create_chat_crew(self) -> Crew:
        # Create the router and response agents (now with document context in system instructions)
        router_agent = self.agents.create_insight_router_agent()
        response_agent = self.agents.create_unified_response_agent()
        
        # Assign tools to agents
        router_agent.tools = self.tools.get_web_tools() + self.tools.get_file_tools() + self.tools.get_mongodb_tools()
        response_agent.tools = self.tools.get_file_tools()
        
        # Define tasks
        routing_task = Task(
            description="""Analyze the user's query and any provided document context to classify intent and gather relevant information.

Your responsibilities:
- Classify the query type (analytics, document search, or general chat)
- Process any provided OCR document context
- Extract key parameters like locations, dates, financial figures
- Use search_market_listings tool to query MongoDB database when user asks about properties, listings, or real estate data
- Use get_market_listings_stats for market statistics and trends analysis
- Perform web research using Perplexity and Tavily if needed for external data
- Structure findings into clean JSON format for the response generator

User Query: {user_query}

Document Context: {document_context}

Output a structured JSON with:
- query_type: analytics/document/chat
- key_findings: relevant information from documents and web research
- parameters: extracted entities and filters
- sources: document names and web sources used
- context_summary: brief summary of available context
            """,
            agent=router_agent,
            expected_output="Structured JSON with query classification, findings, and organized context information"
        )
        
        response_task = Task(
            description="""Generate a comprehensive, user-friendly response based on the router's JSON output.

Transform the structured data into:
- For document queries: Direct answers using document content with source citations
- For analytics: Insights and metrics with clear explanations
- For general chat: Helpful responses incorporating available context

Your response should be:
- Concise but comprehensive
- Well-structured and easy to read
- Include relevant information from uploaded documents
- Cite sources when using specific document content
- Provide actionable insights when applicable

Focus on answering the user's question directly while leveraging all available context.
            """,
            agent=response_agent,
            expected_output="Clear, comprehensive response that directly addresses the user's query using available context",
            context=[routing_task]
        )
        
        return Crew(
            agents=[router_agent, response_agent],
            tasks=[routing_task, response_task],
            verbose=True,
            memory=False,
        )
    
    def run_chat(self, user_query: str, document_context: str = "") -> str:
        crew = self.create_chat_crew()
        result = crew.kickoff(inputs={
            "user_query": user_query,
            "document_context": document_context
        })
        return result