#!/usr/bin/env python3

import os
from dotenv import load_dotenv
load_dotenv(override=True)

def test_gemini_models():
    try:
        import google.genai as genai
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("[ERROR] GEMINI_API_KEY not found")
            return
            
        # Initialize the client
        client = genai.Client(api_key=api_key)
        
        print("[INFO] Testing Gemini API connection...")
        
        # List available models
        try:
            models = client.models.list()
            print("[SUCCESS] Available models:")
            for model in models.models[:10]:  # Show first 10
                print(f"  - {model.name}")
        except Exception as e:
            print(f"[ERROR] Could not list models: {e}")
            
        # Test different model names
        test_models = [
            "gemini-2.0-flash-exp",
            "models/gemini-2.0-flash-exp",
            "gemini-exp-1114",
            "models/gemini-exp-1114",
            "gemini-1.5-flash-8b",
            "models/gemini-1.5-flash-8b",
            "gemini-1.5-flash-002",
            "models/gemini-1.5-flash-002"
        ]
        
        print("\n[INFO] Testing model access:")
        for model_name in test_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents="Hello, test message"
                )
                print(f"[SUCCESS] {model_name} - Working!")
                break
            except Exception as e:
                print(f"[FAIL] {model_name} - {str(e)[:100]}...")
                
    except ImportError:
        print("[ERROR] google.genai not installed")
    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    test_gemini_models()
