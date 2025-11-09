#!/usr/bin/env python3

# Simple script to test configuration without complex imports
import sys
import os
sys.path.append(os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

def check_config():
    provider = os.getenv("LLM_PROVIDER", "ollama")
    
    print("=== CrewAI Configuration Check ===")
    print(f"LLM Provider: {provider}")
    
    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        print(f"Gemini API Key: {'[SET]' if api_key else '[MISSING]'}")
        print(f"Model: gemini-flash-latest")
    elif provider == "openai":
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        model = os.getenv("OPENAI_MODEL", "gpt-5")
        api_key = os.getenv("OPENAI_API_KEY")
        print(f"Base URL: {base_url}")
        print(f"Model: {model}")
        print(f"OpenAI API Key: {'[SET]' if api_key else '[MISSING]'}")
    elif provider == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        model = os.getenv("OLLAMA_MODEL", "llama3.1:8b-instruct")
        print(f"Base URL: {base_url}")
        print(f"Model: {model}")
    elif provider == "vllm":
        base_url = os.getenv("VLLM_BASE_URL", "http://localhost:8000/v1")
        model = os.getenv("VLLM_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
        print(f"Base URL: {base_url}")
        print(f"Model: {model}")
    
    print(f"Debug Mode: {os.getenv('DEBUG', 'false')}")
    print(f"Telemetry Opt-out: {os.getenv('CREWAI_TELEMETRY_OPT_OUT', 'false')}")
    print("\nConfiguration looks good! [OK]")

if __name__ == "__main__":
    check_config()
