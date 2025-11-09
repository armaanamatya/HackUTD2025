from crewai import Task, Crew
from src.agents import BaseAgents
from src.tools import CustomTools


class ResponseRoutingCrew:
    def __init__(self):
        self.agents = BaseAgents()
        self.tools = CustomTools()

    def create_response_crew(self) -> Crew:
        router_agent = self.agents.create_insight_router_agent()
        generator_agent = self.agents.create_unified_response_agent()

        # Assign tools to router; generator only needs file tools for optional formatting/reads
        router_agent.tools = self.tools.get_web_tools() + self.tools.get_file_tools()
        generator_agent.tools = self.tools.get_file_tools()

        # Few-shot examples used inside the router prompt for classification
        few_shots = [
            {"input": "Predict which properties might drop in value next quarter.", "output": "analytics"},
            {"input": "Show me a graph of housing price trends in Austin, TX over the last 5 years.", "output": "analytics"},
            {"input": "Show me apartments in downtown Dallas under $1,500.", "output": "document"},
            {"input": "Find luxury homes for sale in Jakarta.", "output": "document"},
            {"input": "Extract key clauses from this contract about termination.", "output": "document"},
            {"input": "Hey CURA, can you help me find something?", "output": "chat"},
            {"input": "What's the weather like today?", "output": "chat"},
            {"input": "Thanks, that was helpful!", "output": "chat"},
        ]

        router_task = Task(
            description=f"""
            You are the Insight Agent (Router). Classify the user query into one of three response types:
            - analytics
            - document
            - chat

            Use the following few-shot guidance to map queries to response_type:
            {few_shots}

            Then prepare structured context via tool calls when helpful:
            - Use perplexity_search for comprehensive web research. Prefer queries like: site:zillow.com OR site:realtor.com plus user intent.
            - Use Tavily search if available for quick sources.
            - Use fetch_web_page to pull readable content for top sources.

            Extract parameters from the query: location(s), price range, time range, filters (e.g., beds/baths), and any constraints.

            OUTPUT STRICT JSON ONLY with this exact schema:
            {{
              "response_type": "analytics" | "document" | "chat",
              "query": "{{user_query}}",
              "classification_confidence": 0.0,
              "parameters": {{
                "locations": ["city/state"],
                "price_range": {{"min": null, "max": null}},
                "time_range": "e.g., last_5_years or next_quarter",
                "filters": ["string filters"],
                "forecast_horizon": "e.g., 1_quarter or 12_months"
              }},
              "context": {{
                "search_results": [{{"title": "...", "url": "...", "snippet": "..."}}],
                "entities": ["property addresses or named entities"],
                "notes": "key points or assumptions",
                "raw": "high-level summary or combined findings"
              }},
              "tools_used": ["perplexity_search", "tavily_search", "fetch_web_page"],
              "sources": [{{"title": "...", "url": "..."}}],
              "generated_at": "ISO-8601 timestamp"
            }}

            Requirements:
            - Be decisive. Choose one response_type.
            - If tools are unavailable, proceed with best-effort classification and parameter extraction.
            - Keep JSON minimal, valid, and free of commentary.

            User query: {{user_query}}
            """,
            agent=router_agent,
            expected_output="Strict JSON data contract for the Report Agent",
        )

        generator_task = Task(
            description="""
            You are the Report Agent (Generator). Consume the router JSON and produce the final structured response.
            Adapt output to the response_type:
            - For analytics: include insights, metrics, and chart-ready blocks.
            - For document: return a results list with applied filters, and source references.
            - For chat: provide a concise helpful message.

            OUTPUT STRICT JSON ONLY with this schema:
            {
              "response_type": "analytics" | "document" | "chat",
              "title": "Short title",
              "summary": "One-paragraph summary",
              "blocks": [
                {"type": "text", "heading": "...", "body": "..."},
                {"type": "table", "columns": ["..."], "rows": [["..."]]},
                {"type": "chart", "chart_type": "line|bar|table|map", "data": {"series": []}}
              ],
              "sources": [{"title": "...", "url": "..."}],
              "next_actions": ["..."],
              "generated_at": "ISO-8601 timestamp"
            }

            Use the router JSON faithfully. Do not hallucinate sources.
            """,
            agent=generator_agent,
            expected_output="Strict JSON final response for frontend",
            context=[router_task],
        )

        return Crew(
            agents=[router_agent, generator_agent],
            tasks=[router_task, generator_task],
            verbose=True,
            memory=False,
        )

    def run_response_workflow(self, user_query: str) -> str:
        crew = self.create_response_crew()
        result = crew.kickoff(inputs={"user_query": user_query})
        return result

