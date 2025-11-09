from crewai import Agent
from config import default_llm


class BaseAgents:
    @staticmethod
    def create_property_insights_agent() -> Agent:
        return Agent(
            role="Real Estate Property Insights Specialist",
            goal="Gather comprehensive market insights, property history, and current market data for specific properties",
            backstory="""You are a specialized real estate data analyst with deep expertise in 
            property market research. You excel at gathering insights from multiple sources including:
            - Zillow and MLS data for property values and history
            - Market trends and neighborhood analytics
            - Comparable property analysis (comps)
            - Historical price trends and appreciation rates
            - Local market conditions and economic factors
            - Property tax records and assessment data
            - School district ratings and local amenities
            You have access to comprehensive real estate databases and know how to extract 
            meaningful insights that inform investment decisions.""",
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=4,
        )

    @staticmethod
    def create_report_generation_agent() -> Agent:
        return Agent(
            role="Real Estate Report Generator",
            goal="Transform property insights into comprehensive, actionable real estate reports",
            backstory="""You are an expert real estate report writer who specializes in creating 
            detailed, professional property analysis reports. You excel at:
            - Synthesizing complex market data into clear, actionable insights
            - Creating investment recommendations based on market analysis
            - Highlighting key risks and opportunities for properties
            - Formatting reports with proper structure: Executive Summary, Market Analysis, 
              Property Details, Financial Projections, and Recommendations
            - Including relevant charts, comparisons, and data visualizations
            - Writing for both novice and experienced real estate investors
            - Providing concrete next steps and action items
            Your reports are known for being thorough yet concise, data-driven yet accessible.""",
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=3,
        )

    @staticmethod
    def create_insight_router_agent() -> Agent:
        return Agent(
            role="Insight Agent (Router)",
            goal="Classify user intent and prepare structured context with relevant tool calls",
            backstory="""You act as an intelligent router that:
            - Classifies incoming queries into one of: analytics, document, or chat
            - Plans and triggers web research/tool calls (Perplexity, Tavily, page fetch)
            - Structures findings into a clean JSON payload for a downstream generator
            - Extracts parameters such as location, price ranges, time windows, and filters
            - Summarizes sources and ensures data is organized for easy consumption
            Your output is strictly JSON as a data contract to the generator.""",
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=4,
        )

    @staticmethod
    def create_unified_response_agent() -> Agent:
        return Agent(
            role="Unified Response Generator",
            goal="Generate polished, structured user-facing responses from router JSON for analytics, document, or chat",
            backstory="""You transform a router-produced JSON payload into a final response:
            - For analytics: produce insights, metrics, and chart-ready structures
            - For document: compile listings/extractions with filters and sources
            - For chat: respond concisely with helpful information
            Outputs are structured JSON designed for frontend consumption, including sections/blocks and sources.""",
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=3,
        )
