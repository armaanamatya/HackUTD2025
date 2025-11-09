#!/usr/bin/env python3
"""
Test script to test the upload endpoint directly
"""

import requests
import os
from pathlib import Path

def test_upload_endpoint():
    print("Testing /upload-document endpoint...")
    
    # File to upload
    pdf_path = r"c:\Users\armaa\Downloads\CBRE - Challenge Statement - HackUTD 2025 (2).pdf"
    
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return False
    
    # API endpoint
    url = "http://localhost:8000/upload-document"
    
    try:
        # Prepare file for upload
        with open(pdf_path, 'rb') as f:
            files = {
                'file': (os.path.basename(pdf_path), f, 'application/pdf')
            }
            
            print(f"Uploading file: {os.path.basename(pdf_path)}")
            print(f"File size: {os.path.getsize(pdf_path)} bytes")
            print(f"Sending POST request to: {url}")
            
            # Make the request
            response = requests.post(url, files=files, timeout=60)
            
            print(f"Response status code: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print("\n=== UPLOAD SUCCESS ===")
                print(f"Document ID: {result.get('document_id')}")
                print(f"Filename: {result.get('filename')}")
                print(f"Status: {result.get('status')}")
                print(f"Message: {result.get('message')}")
                print(f"Text Length: {result.get('text_length')}")
                print(f"Clauses Count: {result.get('clauses_count')}")
                
                if result.get('metrics'):
                    print(f"Metrics: {result.get('metrics')}")
                
                doc_id = result.get('document_id')
                if doc_id:
                    # Test the OCR display endpoint
                    print(f"\nTesting OCR display endpoint...")
                    ocr_url = f"http://localhost:8000/documents/{doc_id}/ocr"
                    ocr_response = requests.get(ocr_url)
                    
                    if ocr_response.status_code == 200:
                        ocr_data = ocr_response.json()
                        print(f"OCR display working! Text preview: {ocr_data.get('extracted_content', {}).get('text_preview', '')[:100]}...")
                    else:
                        print(f"OCR display failed: {ocr_response.status_code}")
                
                return True
            else:
                print(f"\n=== UPLOAD FAILED ===")
                print(f"Status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to server. Make sure the server is running on http://localhost:8000")
        print("Start server with: python start_server.py")
        return False
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

def test_server_status():
    """Test if server is running and OCR service is available"""
    try:
        response = requests.get("http://localhost:8000/status", timeout=5)
        if response.status_code == 200:
            status = response.json()
            print("=== SERVER STATUS ===")
            print(f"API Status: {status.get('api_status')}")
            print(f"OCR Service: {status.get('services', {}).get('ocr_service')}")
            print(f"Document Service: {status.get('services', {}).get('document_service')}")
            print(f"Has Gemini API Key: {status.get('environment', {}).get('has_gemini_api_key')}")
            return status.get('services', {}).get('ocr_service') == 'initialized'
        else:
            print(f"Server status check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("ERROR: Server not running. Start with: python start_server.py")
        return False

if __name__ == "__main__":
    print("Testing upload endpoint functionality...\n")
    
    # First check if server is running
    if test_server_status():
        print("\nServer is running and OCR service is available!")
        print("\nTesting file upload...")
        success = test_upload_endpoint()
        
        if success:
            print("\n✓ Upload endpoint is working correctly!")
        else:
            print("\n✗ Upload endpoint has issues.")
    else:
        print("\nServer is not properly configured or not running.")