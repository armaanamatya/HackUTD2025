#!/usr/bin/env python3

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_api():
    print("Testing CrewAI FastAPI Server")
    print("=" * 40)
    
    # Test root endpoint
    print("1. Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "=" * 40)
    
    # Test config endpoint
    print("2. Testing config endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/config")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "=" * 40)
    
    # Test research endpoint
    print("3. Testing research endpoint...")
    try:
        research_data = {"topic": "FastAPI and CrewAI integration"}
        response = requests.post(f"{BASE_URL}/research", json=research_data)
        print(f"Status: {response.status_code}")
        job_response = response.json()
        print(f"Response: {json.dumps(job_response, indent=2)}")
        
        # Check job status
        job_id = job_response["job_id"]
        print(f"\n4. Checking job status for {job_id}...")
        
        # Poll for completion (max 60 seconds)
        for i in range(12):
            time.sleep(5)
            status_response = requests.get(f"{BASE_URL}/jobs/{job_id}")
            status_data = status_response.json()
            print(f"Job status: {status_data['status']}")
            
            if status_data["status"] in ["completed", "failed"]:
                print(f"Final result: {json.dumps(status_data, indent=2)}")
                break
        
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "=" * 40)
    
    # Test list jobs endpoint
    print("5. Testing list jobs endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/jobs")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Make sure the API server is running on http://localhost:8000")
    print("Start it with: python api_server.py")
    print("Press Enter to continue with tests...")
    input()
    
    test_api()