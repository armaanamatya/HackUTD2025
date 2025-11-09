#!/usr/bin/env python3
"""
Simple test script to verify OCR functionality is working
"""

import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add paths
sys.path.append(str(Path(__file__).parent / "src"))
sys.path.append(str(Path(__file__).parent.parent.parent))  # Go to project root

from parser.gemini_ocr_service import GeminiOCRService

def test_ocr_service():
    print("Testing OCR Service Initialization...")
    
    # Check environment variable
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("X GEMINI_API_KEY environment variable not set")
        return False
    else:
        print(f"+ GEMINI_API_KEY found (length: {len(api_key)} chars)")
    
    # Try to initialize OCR service
    try:
        ocr_service = GeminiOCRService()
        print("+ OCR service initialized successfully")
    except Exception as e:
        print(f"X OCR service initialization failed: {str(e)}")
        return False
    
    print("\n*** OCR system is ready for file uploads!")
    return True

if __name__ == "__main__":
    success = test_ocr_service()
    if success:
        print("\nNext steps:")
        print("1. Start server: python start_server.py")
        print("2. Visit: http://localhost:8000/status")
        print("3. Upload PDF: http://localhost:8000/docs (upload-document endpoint)")
        print("4. View OCR results: http://localhost:8000/documents/{doc_id}/ocr")
    else:
        print("\nPlease fix the issues above before testing OCR uploads.")
        sys.exit(1)