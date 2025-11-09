#!/usr/bin/env python3

import os
import sys
import subprocess
import uvicorn
from pathlib import Path
from dotenv import load_dotenv

# Load environment with override to ensure .env takes precedence
load_dotenv(override=True)

# Check if we have required dependencies
try:
    import crewai
    print("✓ CrewAI found")
except ImportError:
    print("✗ CrewAI not found - installing with UV...")
    subprocess.run(["uv", "pip", "install", "-r", "requirements.txt"], check=True)

# Warn about GEMINI_API_KEY only when needed
try:
    from config import llm_config
    provider = llm_config.provider
    allow_fallback = getattr(llm_config, "allow_gemini_fallback", False)
    needs_gemini = provider == "gemini" or (provider == "local" and allow_fallback)
    if needs_gemini and not os.getenv("GEMINI_API_KEY"):
        print("\n⚠️  WARNING: GEMINI_API_KEY environment variable not set")
        print("Gemini will be required by current configuration but no API key is set.")
        print("Set GEMINI_API_KEY=your_api_key_here or disable fallback via ALLOW_GEMINI_FALLBACK=false")
        print("\nServer will start, but Gemini LLM requests will fail without an API key.\n")
except Exception:
    # If config import fails, skip conditional warning
    pass

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
