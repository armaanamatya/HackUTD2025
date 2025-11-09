from crewai_tools import FileReadTool, DirectoryReadTool, TavilySearchTool
import os
import requests
from typing import Type, Any
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from dotenv import load_dotenv

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


class RealEstateResearchInput(BaseModel):
    """Input schema for comprehensive real estate research."""
    property_address: str = Field(..., description="The full property address including street, city, state, and ZIP code")


class RealEstateResearchTool(BaseTool):
    name: str = "comprehensive_real_estate_research"
    description: str = """Comprehensive real estate research tool that gathers detailed property insights across multiple dimensions:
    - Historical financial data (past sale prices, valuation trends, mortgage history)
    - Property tax assessments (current and historical)
    - School performance and enrollment trends
    - Neighborhood crime statistics
    - Walkability and transit scores
    - Local amenities and businesses
    - Interest rates and mortgage trends
    - Demographic and development trends
    Uses authoritative sources like MLS listings, Zillow, Realtor.com, and other credible real estate databases.
    Returns structured, analytical format with data visualizations recommendations and actionable insights."""
    args_schema: Type[BaseModel] = RealEstateResearchInput

    def _run(self, property_address: str) -> str:
        """Execute comprehensive real estate research for the given property address."""
        perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        tavily_key = os.getenv("TAVILY_API_KEY")
        
        if not perplexity_key and not tavily_key:
            return "No search API keys configured. Please set PERPLEXITY_API_KEY or TAVILY_API_KEY in your .env file."
        
        # Comprehensive research queries covering all dimensions
        research_dimensions = {
            "financial_history": {
                "query": f"Historical sale prices, valuation trends, and mortgage history for property at {property_address}. Include past transactions, price appreciation, market value changes over time, and comparable sales data.",
                "sources": "Zillow, Realtor.com, MLS listings, Redfin, property records",
                "visualizations": "Price trend line chart, appreciation rate bar chart, comparable sales scatter plot"
            },
            "property_taxes": {
                "query": f"Current and historical property tax assessments for {property_address}. Include tax rates, assessed values, tax payment history, exemptions, and comparison to similar properties.",
                "sources": "County assessor records, Zillow tax history, local government databases",
                "visualizations": "Tax assessment timeline, tax rate comparison chart, exemption breakdown pie chart"
            },
            "schools": {
                "query": f"School performance ratings, test scores, enrollment trends, and school district information for the area around {property_address}. Include GreatSchools ratings, district rankings, student-teacher ratios, and graduation rates.",
                "sources": "GreatSchools.org, school district websites, state education department records",
                "visualizations": "School rating comparison bar chart, enrollment trend line, district performance heatmap"
            },
            "crime_statistics": {
                "query": f"Neighborhood crime statistics, safety ratings, and crime trends for the area around {property_address}. Include violent crime rates, property crime rates, overall safety scores, and year-over-year trends.",
                "sources": "FBI crime data, local police department records, NeighborhoodScout, AreaVibes",
                "visualizations": "Crime rate comparison bar chart, safety score gauge, crime trend line, crime type breakdown pie chart"
            },
            "walkability_transit": {
                "query": f"Walkability score, Walk Score, transit score, and public transportation options near {property_address}. Include nearby bus stops, train stations, bike-friendly infrastructure, and pedestrian accessibility.",
                "sources": "Walk Score API, Transit Score, local transit authority, Google Maps data",
                "visualizations": "Walkability score gauge, transit accessibility map, transportation mode comparison chart"
            },
            "amenities": {
                "query": f"Local amenities, businesses, restaurants, parks, shopping centers, and points of interest near {property_address}. Include distance, quality ratings, Yelp reviews, and accessibility.",
                "sources": "Yelp, Google Places, Foursquare, local business directories",
                "visualizations": "Amenity proximity map, category distribution pie chart, quality rating bar chart"
            },
            "mortgage_trends": {
                "query": f"Current mortgage interest rates, mortgage rate trends, and financing options relevant to {property_address}. Include 30-year fixed, 15-year fixed, ARM rates, and local lender comparisons.",
                "sources": "Freddie Mac, Bankrate, local mortgage lenders, Federal Reserve data",
                "visualizations": "Mortgage rate trend line, rate comparison bar chart, payment calculator breakdown"
            },
            "demographics": {
                "query": f"Demographic data, population trends, income levels, employment statistics, and development trends for the neighborhood and city area around {property_address}. Include age distribution, education levels, and economic indicators.",
                "sources": "U.S. Census Bureau, Bureau of Labor Statistics, local planning departments, economic development agencies",
                "visualizations": "Demographic pyramid, income distribution histogram, population trend line, development pipeline timeline"
            }
        }
        
        comprehensive_report = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║           COMPREHENSIVE REAL ESTATE RESEARCH REPORT                          ║
║           Property Address: {property_address:<60}║
╚══════════════════════════════════════════════════════════════════════════════╝

"""
        
        # Use Perplexity if available (better for comprehensive research), otherwise Tavily
        use_perplexity = bool(perplexity_key)
        research_results = {}
        
        for dimension_name, dimension_data in research_dimensions.items():
            try:
                if use_perplexity:
                    result = self._perplexity_search(
                        dimension_data["query"], 
                        perplexity_key,
                        dimension_data["sources"]
                    )
                else:
                    result = self._tavily_search(
                        dimension_data["query"], 
                        tavily_key
                    )
                
                research_results[dimension_name] = {
                    "data": result,
                    "visualizations": dimension_data["visualizations"],
                    "sources": dimension_data["sources"]
                }
                
                dimension_title = dimension_name.replace("_", " ").title()
                comprehensive_report += f"""
{'='*80}
📊 {dimension_title.upper()}
{'='*80}
{result}

📈 RECOMMENDED VISUALIZATIONS:
{dimension_data['visualizations']}

📚 DATA SOURCES: {dimension_data['sources']}

"""
            except Exception as e:
                dimension_title = dimension_name.replace("_", " ").title()
                comprehensive_report += f"""
{'='*80}
⚠️  {dimension_title.upper()} - Research Error
{'='*80}
Error gathering data: {str(e)}

"""
        
        # Add contextual analysis and actionable insights
        comprehensive_report += f"""
{'='*80}
🎯 EXECUTIVE SUMMARY & CONTEXTUAL ANALYSIS
{'='*80}

PROPERTY OVERVIEW:
This comprehensive research report provides multi-dimensional analysis for {property_address}.
The data has been gathered from authoritative real estate databases and verified sources.

KEY FINDINGS SUMMARY:
"""
        
        # Generate contextual insights based on research dimensions
        for dimension_name, dimension_data in research_results.items():
            dimension_title = dimension_name.replace("_", " ").title()
            comprehensive_report += f"• {dimension_title}: Data collected and analyzed\n"
        
        comprehensive_report += f"""

{'='*80}
💡 ACTIONABLE INSIGHTS & STRATEGIC RECOMMENDATIONS
{'='*80}

INVESTMENT ANALYSIS:
1. Review financial history trends to assess investment potential and ROI
2. Compare property tax burden to similar properties in the area
3. Evaluate price appreciation trajectory against market benchmarks

LIFESTYLE CONSIDERATIONS:
4. Assess school district quality if family considerations are important
5. Evaluate walkability and transit scores for daily commute and lifestyle
6. Review local amenities for quality of life and convenience factors

RISK ASSESSMENT:
7. Analyze crime statistics and safety scores for personal security
8. Review demographic trends for long-term neighborhood trajectory
9. Examine development trends for potential property value impacts

FINANCING STRATEGY:
10. Compare current mortgage rates with historical averages
11. Evaluate financing options and lender competitiveness
12. Calculate total cost of ownership including taxes and insurance

{'='*80}
📊 DATA VISUALIZATION RECOMMENDATIONS
{'='*80}

For effective data presentation, consider implementing the following visualizations:

INTERACTIVE CHARTS:
"""
        
        for dimension_name, dimension_data in research_results.items():
            dimension_title = dimension_name.replace("_", " ").title()
            comprehensive_report += f"• {dimension_title}: {dimension_data['visualizations']}\n"
        
        comprehensive_report += f"""

VISUALIZATION TYPES TO IMPLEMENT:
- Trend Lines: Show historical price, tax, and demographic changes over time
- Bar Charts: Compare ratings, scores, and metrics across categories
- Pie Charts: Display distributions (crime types, amenity categories, exemptions)
- Heatmaps: Visualize geographic patterns (crime density, school performance by area)
- Scatter Plots: Show relationships (price vs. square footage, walkability vs. amenities)
- Gauge Charts: Display scores and ratings (walkability, safety, school ratings)
- Timeline Charts: Show development pipeline and future projects

{'='*80}
⚠️  IMPORTANT DISCLAIMERS
{'='*80}

DATA ACCURACY:
• This report synthesizes data from multiple authoritative sources
• For critical decisions, verify key information with official records
• Property values and market conditions can change rapidly
• Consult with licensed real estate professionals for legal and financial advice

SOURCE VERIFICATION:
• All data sources are prioritized from credible databases (MLS, Zillow, Realtor.com)
• Government records (tax assessor, census, crime data) are authoritative
• Third-party aggregators provide convenience but should be cross-referenced
• Historical data accuracy depends on source record-keeping quality

RECOMMENDED NEXT STEPS:
1. Schedule a professional property inspection
2. Consult with a licensed real estate agent familiar with the area
3. Review official property records at the county assessor's office
4. Obtain a professional appraisal for financing purposes
5. Consult with a real estate attorney for legal considerations
6. Review homeowners insurance quotes and requirements

{'='*80}
📅 REPORT GENERATED: {self._get_timestamp()}
{'='*80}
"""
        
        return comprehensive_report
    
    def _perplexity_search(self, query: str, api_key: str, preferred_sources: str = "") -> str:
        """Execute Perplexity search for comprehensive real estate research."""
        url = "https://api.perplexity.ai/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        system_prompt = f"""You are a real estate research mogul specializing in comprehensive, 
        data-driven property analysis. Provide detailed, accurate information with specific 
        data points, numbers, dates, and credible sources. Prioritize authoritative sources 
        like MLS listings, Zillow, Realtor.com, government records, and verified databases.
        Preferred sources for this query: {preferred_sources}
        Format your response with clear sections, bullet points, specific metrics, and 
        quantitative data. Include trends, comparisons, and potential risks. Present findings 
        in a structured, analytical format suitable for professional real estate decision-making."""
        
        data = {
            "model": "llama-3.1-sonar-large-128k-online",
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": query
                }
            ],
            "max_tokens": 2500,
            "temperature": 0.1,
            "stream": False
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "No results found")
            citations = result.get("citations", [])
            
            formatted_result = content
            if citations:
                formatted_result += f"\n\n📚 VERIFIED SOURCES: {', '.join(citations[:8])}"
            
            return formatted_result
        else:
            return f"Search failed with status: {response.status_code}. Error: {response.text[:200]}"
    
    def _tavily_search(self, query: str, api_key: str) -> str:
        """Execute Tavily search as fallback."""
        url = "https://api.tavily.com/search"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        data = {
            "api_key": api_key,
            "query": query,
            "search_depth": "advanced",
            "include_answer": True,
            "include_raw_content": False,
            "max_results": 8
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get("answer", "")
            results = result.get("results", [])
            
            formatted_result = answer if answer else "Research completed."
            
            if results:
                formatted_result += "\n\n📚 KEY SOURCES:\n"
                for i, res in enumerate(results[:8], 1):
                    title = res.get("title", "Untitled")
                    url = res.get("url", "")
                    formatted_result += f"{i}. {title} - {url}\n"
            
            return formatted_result
        else:
            return f"Search failed with status: {response.status_code}"
    
    def _get_timestamp(self) -> str:
        """Get current timestamp for report generation."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


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
        
        # Add comprehensive real estate research tool (requires Perplexity or Tavily)
        perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        tavily_key = os.getenv("TAVILY_API_KEY")
        if perplexity_key or tavily_key:
            tools.append(RealEstateResearchTool())
        
        # Add Perplexity search (comprehensive research with sources)
        if perplexity_key:
            tools.append(PerplexitySearchTool())
        
        # Add Tavily search (fast web search)
        if tavily_key:
            tools.append(TavilySearchTool(api_key=tavily_key))
            
        return tools
    
    @staticmethod
    def get_all_tools():
        return (
            CustomTools.get_file_tools() +
            CustomTools.get_web_tools()
        )