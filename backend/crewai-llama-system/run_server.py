#!/usr/bin/env python3

import os
import sys
import subprocess
import uvicorn
from pathlib import Path

# Check if we have required dependencies
try:
    import crewai
    print("✓ CrewAI found")
except ImportError:
    print("✗ CrewAI not found - installing with UV...")
    subprocess.run(["uv", "pip", "install", "-r", "requirements.txt"], check=True)

# Check for GEMINI_API_KEY
if not os.getenv("GEMINI_API_KEY"):
    print("\n⚠️  WARNING: GEMINI_API_KEY environment variable not set")
    print("Please set your Gemini API key to use the LLM services")
    print("Example: set GEMINI_API_KEY=your_api_key_here")
    print("\nServer will start but LLM requests may fail without API key\n")

# Start the FastAPI server
if __name__ == "__main__":
    print("Starting CrewAI Real Estate Agents Server...")
    print("API Documentation available at: http://localhost:8000/docs")
    print("Server running at: http://localhost:8000")
    print("Press Ctrl+C to stop")
    print()
    
    uvicorn.run(
        "api_server:app", 
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    )