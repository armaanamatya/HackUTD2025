from crewai import Agent
from config import default_llm


class BaseAgents:
    @staticmethod
    def create_researcher() -> Agent:
        return Agent(
            role="Senior Research Analyst",
            goal="Conduct thorough research and analysis on given topics",
            backstory="""You are a seasoned research analyst with expertise in 
            gathering, analyzing, and synthesizing information from multiple sources. 
            You have a keen eye for detail and excel at identifying key insights 
            and patterns in complex data.""",
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=3,
        )

    @staticmethod
    def create_writer() -> Agent:
        return Agent(
            role="Technical Writer",
            goal="Create clear, well-structured, and engaging written content",
            backstory="""You are an experienced technical writer who specializes 
            in transforming complex research and analysis into clear, accessible, 
            and well-structured documents. You have a talent for organizing 
            information logically and presenting it in an engaging manner.""",
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=3,
        )

    @staticmethod
    def create_code_analyst() -> Agent:
        return Agent(
            role="Senior Code Analyst",
            goal="Analyze code structure, patterns, and provide optimization recommendations",
            backstory="""You are a senior software engineer with extensive experience 
            in code review, architecture analysis, and performance optimization. 
            You have worked with multiple programming languages and frameworks, 
            and excel at identifying code quality issues and improvement opportunities.""",
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=3,
        )

    @staticmethod
    def create_project_manager() -> Agent:
        return Agent(
            role="Project Coordinator",
            goal="Coordinate tasks, manage workflows, and ensure project completion",
            backstory="""You are an experienced project manager with a strong 
            background in coordinating complex multi-agent workflows. You excel 
            at breaking down complex problems into manageable tasks, delegating 
            work appropriately, and ensuring all team members work towards 
            common objectives.""",
            llm=default_llm,
            verbose=True,
            allow_delegation=True,
            max_iter=5,
        )