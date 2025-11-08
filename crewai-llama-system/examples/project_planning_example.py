#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.crews import ProjectPlanningCrew
from config import llm_config


def main():
    print("=== CrewAI + Llama 3.1 8B Project Planning Example ===")
    print(f"LLM Configuration: {llm_config.get_config_info()}")
    print()
    
    # Initialize the project planning crew
    planning_crew = ProjectPlanningCrew()
    
    # Define project description
    project_description = """
    Build a web application for task management with the following features:
    - User authentication and authorization
    - Task creation, editing, and deletion
    - Task assignment to team members
    - Real-time collaboration features
    - Mobile-responsive design
    - Integration with popular calendar applications
    
    The application should be scalable, secure, and user-friendly.
    Target users are small to medium-sized teams (5-50 people).
    """
    
    print("Starting project planning...")
    print("Project: Task Management Web Application")
    print("This may take several minutes...")
    print()
    
    try:
        # Run the planning
        result = planning_crew.run_planning(project_description)
        
        print("=== Project Planning Results ===")
        print(result)
        
    except Exception as e:
        print(f"Error during project planning: {str(e)}")
        print("\nMake sure your local LLM server is running:")
        print("- For Ollama: run 'ollama serve' and 'ollama pull llama3.1:8b-instruct'")
        print("- For vLLM: run 'vllm serve meta-llama/Llama-3.1-8B-Instruct'")


if __name__ == "__main__":
    main()