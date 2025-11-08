#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.crews import ResearchCrew
from config import llm_config


def main():
    print("=== CrewAI + Llama 3.1 8B Research Example ===")
    print(f"LLM Configuration: {llm_config.get_config_info()}")
    print()
    
    # Initialize the research crew
    research_crew = ResearchCrew()
    
    # Define research topic
    topic = "Latest developments in AI multi-agent systems 2025"
    
    print(f"Starting research on topic: {topic}")
    print("This may take a few minutes...")
    print()
    
    try:
        # Run the research
        result = research_crew.run_research(topic)
        
        print("=== Research Results ===")
        print(result)
        
    except Exception as e:
        print(f"Error during research: {str(e)}")
        print("\nMake sure your local LLM server is running:")
        print("- For Ollama: run 'ollama serve' and 'ollama pull llama3.1:8b-instruct'")
        print("- For vLLM: run 'vllm serve meta-llama/Llama-3.1-8B-Instruct'")


if __name__ == "__main__":
    main()