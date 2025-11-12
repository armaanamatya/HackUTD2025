#!/usr/bin/env python3

import os
from dotenv import load_dotenv
load_dotenv()

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
        # Prefer current stable text models; older variants may be deprecated
        test_models = [
            "gemini-flash-latest",
            "models/gemini-flash-latest",
            "gemini-flash-lite-latest",
            "models/gemini-flash-lite-latest",
            "gemini-2.5-pro",
            "models/gemini-2.5-pro",
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
