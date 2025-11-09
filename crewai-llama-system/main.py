#!/usr/bin/env python3

import argparse
import sys
from pathlib import Path

# Add src directory to path
sys.path.append(str(Path(__file__).parent / "src"))

from src.crews import ResearchCrew, ProjectPlanningCrew
from config import llm_config


def main():
    parser = argparse.ArgumentParser(description="CrewAI Multi-Agent System with Llama 3.1 8B")
    parser.add_argument("--mode", choices=["research", "project-planning"], 
                       required=True, help="Select the crew mode to run")
    parser.add_argument("--topic", help="Research topic (for research mode)")
    parser.add_argument("--project-desc", help="Project description (for project-planning mode)")
    parser.add_argument("--config", action="store_true", help="Show current configuration")
    
    args = parser.parse_args()
    
    if args.config:
        print("Current LLM Configuration:")
        print(llm_config.get_config_info())
        return
    
    print("=== CrewAI Multi-Agent System ===")
    print(f"Mode: {args.mode}")
    print(f"LLM: {llm_config.get_config_info()}")
    print()
    
    try:
        if args.mode == "research":
            if not args.topic:
                args.topic = input("Enter research topic: ")
            
            crew = ResearchCrew()
            print(f"Starting research on: {args.topic}")
            result = crew.run_research(args.topic)
            
        elif args.mode == "project-planning":
            if not args.project_desc:
                print("Enter project description (press Enter twice when done):")
                lines = []
                while True:
                    line = input()
                    if line == "":
                        break
                    lines.append(line)
                args.project_desc = "\n".join(lines)
            
            crew = ProjectPlanningCrew()
            print("Starting project planning...")
            result = crew.run_planning(args.project_desc)
        
        print("\n" + "="*50)
        print("RESULTS")
        print("="*50)
        print(result)
        
    except KeyboardInterrupt:
        print("\nProcess interrupted by user.")
    except Exception as e:
        print(f"\nError: {str(e)}")
        print("\nMake sure your local LLM server is running:")
        print("- For Ollama: 'ollama serve' and 'ollama pull llama3.1:8b-instruct'")
        print("- For vLLM: 'vllm serve meta-llama/Llama-3.1-8B-Instruct'")


if __name__ == "__main__":
    main()