from crewai_tools import FileReadTool, DirectoryReadTool, TavilySearchTool
import os
import requests
from typing import Type, Any, List
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from dotenv import load_dotenv
from urllib.parse import quote_plus
import glob
import pathlib

load_dotenv()


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


class DuckDuckGoSearchInput(BaseModel):
    """Input schema for DuckDuckGo search."""
    query: str = Field(..., description="Search query text")
    max_results: int = Field(5, description="Max number of results to return")


class DuckDuckGoSearchTool(BaseTool):
    name: str = "duckduckgo_search"
    description: str = (
        "Search the web using DuckDuckGo and return top results (title, link, snippet)."
    )
    args_schema: Type[BaseModel] = DuckDuckGoSearchInput

    def _run(self, query: str, max_results: int = 5) -> str:
        """Perform a simple DuckDuckGo search.
        If the duckduckgo-search library is available, use it; otherwise fall back to HTML parsing.
        """
        try:
            from duckduckgo_search import DDGS  # type: ignore

            with DDGS() as ddgs:
                results = []
                for r in ddgs.text(query, max_results=max_results):
                    title = r.get("title", "")
                    href = r.get("href", "")
                    body = r.get("body", "")
                    results.append(f"- {title}\n  {href}\n  {body}")
                if not results:
                    return "No results found"
                return "DuckDuckGo Results:\n\n" + "\n\n".join(results)
        except Exception as e:
            # Fallback: minimal HTML-based search (no dependency)
            try:
                q = quote_plus(query)
                url = f"https://duckduckgo.com/html/?q={q}"
                headers = {"User-Agent": "Mozilla/5.0"}
                resp = requests.get(url, headers=headers, timeout=15)
                if resp.status_code != 200:
                    return f"DuckDuckGo search failed with status: {resp.status_code}"
                # Very naive extraction of results
                items: List[str] = []
                for line in resp.text.splitlines():
                    if "result__a" in line and "href=\"" in line:
                        try:
                            href = line.split('href="')[1].split('"')[0]
                            title = line.split('>')[1].split('<')[0]
                            items.append(f"- {title}\n  {href}")
                        except Exception:
                            continue
                    if len(items) >= max_results:
                        break
                if not items:
                    return "No results found"
                return "DuckDuckGo Results (fallback):\n\n" + "\n\n".join(items)
            except Exception as e2:
                return f"DuckDuckGo search error: {str(e2)}"


class WebPageFetchInput(BaseModel):
    """Input schema for fetching a web page."""
    url: str = Field(..., description="The full URL of the page to fetch")
    max_chars: int = Field(4000, description="Maximum characters of content to return")


class WebPageFetchTool(BaseTool):
    name: str = "fetch_web_page"
    description: str = (
        "Fetch a web page by URL and return the text content (truncated)."
    )
    args_schema: Type[BaseModel] = WebPageFetchInput

    def _run(self, url: str, max_chars: int = 4000) -> str:
        try:
            headers = {"User-Agent": "Mozilla/5.0"}
            resp = requests.get(url, headers=headers, timeout=20)
            if resp.status_code != 200:
                return f"Failed to fetch page. Status: {resp.status_code}"

            text = resp.text
            # Strip basic HTML tags for readability
            import re
            text_only = re.sub(r"<script[\s\S]*?</script>", " ", text, flags=re.IGNORECASE)
            text_only = re.sub(r"<style[\s\S]*?</style>", " ", text_only, flags=re.IGNORECASE)
            text_only = re.sub(r"<[^>]+>", " ", text_only)
            text_only = re.sub(r"\s+", " ", text_only).strip()
            if not text_only:
                return "No readable content found"
            return text_only[:max_chars]
        except Exception as e:
            return f"Error fetching page: {str(e)}"


class FileGlobInput(BaseModel):
    """Input schema for file globbing."""
    directory: str = Field(..., description="Base directory to search")
    pattern: str = Field("**/*", description="Glob pattern (supports ** for recursive)")


class FileGlobTool(BaseTool):
    name: str = "glob_files"
    description: str = (
        "List files in a directory using a glob pattern (e.g., **/*.md)."
    )
    args_schema: Type[BaseModel] = FileGlobInput

    def _run(self, directory: str, pattern: str = "**/*") -> str:
        try:
            base = pathlib.Path(directory)
            if not base.exists() or not base.is_dir():
                return f"Directory not found: {directory}"
            matched = [str(p) for p in base.glob(pattern)]
            files = [m for m in matched if pathlib.Path(m).is_file()]
            if not files:
                return "No files matched the pattern"
            return "Matched files:\n" + "\n".join(files)
        except Exception as e:
            return f"Error globbing files: {str(e)}"


class CustomTools:
    @staticmethod
    def get_file_tools():
        return [
            FileReadTool(),
            DirectoryReadTool(),
            FileGlobTool(),
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

        # Always include DuckDuckGo as a zero-config web search
        tools.append(DuckDuckGoSearchTool())

        # Include simple web page fetcher for reading content
        tools.append(WebPageFetchTool())
            
        return tools
    
    @staticmethod
    def get_all_tools():
        return (
            CustomTools.get_file_tools() +
            CustomTools.get_web_tools()
        )
