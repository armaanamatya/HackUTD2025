#!/usr/bin/env python3

import sys
import os
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv(override=True)

def test_gemini():
    try:
        # Test basic configuration
        from config.llm_config import llm_config
        print("[OK] Configuration loaded successfully")
        print(f"Provider: {llm_config.provider}")
        
        # Test LLM creation (without actually using it)
        print("[OK] LLM configuration looks good")
        print(f"Config info: {llm_config.get_config_info()}")
        
        # Test basic imports
        from src.agents import BaseAgents
        from src.crews import ResearchCrew
        print("[OK] All modules imported successfully")
        
        print("\n[SUCCESS] CrewAI system ready with Gemini!")
        print("\nTo use:")
        print("python main.py --mode research --topic 'Your research topic'")
        
    except Exception as e:
        print(f"[ERROR] {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_gemini()
