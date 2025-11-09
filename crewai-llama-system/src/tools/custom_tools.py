from crewai_tools import FileReadTool, DirectoryReadTool, TavilySearchTool
import os
import requests
from typing import Type, Any
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from dotenv import load_dotenv

load_dotenv(override=True)


class PerplexitySearchInput(BaseModel):
    """Input schema for Perplexity search."""
    query: str = Field(..., description="The search query to research")


class PerplexitySearchTool(BaseTool):
    name: str = "perplexity_search"
    description: str = "Search using Perplexity AI for comprehensive research with sources and citations"
    args_schema: Type[BaseModel] = PerplexitySearchInput

    def _run(self, query: str) -> str:
        """Execute the Perplexity search."""
        api_key = os.getenv("PERPLEXITY_API_KEY")
        
        if not api_key:
            return "Perplexity API key not configured"
            
        try:
            url = "https://api.perplexity.ai/chat/completions"
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "llama-3.1-sonar-small-128k-online",
                "messages": [
                    {
                        "role": "system", 
                        "content": "You are a helpful research assistant. Provide comprehensive information with sources and citations."
                    },
                    {
                        "role": "user",
                        "content": f"Research and provide detailed information about: {query}"
                    }
                ],
                "max_tokens": 1500,
                "temperature": 0.2,
                "stream": False
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "No results found")
                return f"Perplexity Research Results:\n\n{content}"
            else:
                return f"Perplexity search failed with status: {response.status_code}"
                
        except Exception as e:
            return f"Perplexity search error: {str(e)}"


class CustomTools:
    @staticmethod
    def get_file_tools():
        return [
            FileReadTool(),
            DirectoryReadTool(),
        ]
    
    @staticmethod
    def get_web_tools():
        tools = []
        
        # Add Perplexity search (comprehensive research with sources)
        perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        if perplexity_key:
            tools.append(PerplexitySearchTool())
        
        # Add Tavily search (fast web search)
        tavily_key = os.getenv("TAVILY_API_KEY")
        if tavily_key:
            tools.append(TavilySearchTool(api_key=tavily_key))
            
        return tools
    
    @staticmethod
    def get_all_tools():
        return (
            CustomTools.get_file_tools() +
            CustomTools.get_web_tools()
        )
