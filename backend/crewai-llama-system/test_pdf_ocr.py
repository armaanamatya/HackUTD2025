#!/usr/bin/env python3
"""
Test script to debug PDF OCR processing
"""

import sys
import os
from pathlib import Path
from dotenv import load_dotenv
import traceback

# Load environment variables
load_dotenv()

# Add paths
sys.path.append(str(Path(__file__).parent / "src"))
sys.path.append(str(Path(__file__).parent.parent.parent))  # Go to project root

from parser.gemini_ocr_service import GeminiOCRService

def test_pdf_upload(pdf_path: str):
    print(f"Testing PDF OCR with file: {pdf_path}")
    
    # Check if file exists
    if not os.path.exists(pdf_path):
        print(f"ERROR: File not found: {pdf_path}")
        return False
    
    file_size = os.path.getsize(pdf_path)
    print(f"File size: {file_size} bytes ({file_size / 1024 / 1024:.2f} MB)")
    
    try:
        # Initialize OCR service
        print("Initializing OCR service...")
        ocr_service = GeminiOCRService()
        print("OCR service initialized successfully")
        
        # Process the PDF
        print("Processing PDF with OCR...")
        result = ocr_service.process_document(pdf_path)
        
        # Display results
        print("\n=== OCR RESULTS ===")
        print(f"Document Type: {result.get('document_type', 'unknown')}")
        print(f"Text Length: {len(result.get('text', ''))}")
        
        # Show first 500 chars of text
        text = result.get('text', '')
        if text:
            print(f"\nFirst 500 characters of extracted text:")
            print("-" * 50)
            print(text[:500])
            if len(text) > 500:
                print("...")
        else:
            print("NO TEXT EXTRACTED!")
        
        # Show metrics
        metrics = result.get('metrics', {})
        if metrics:
            print(f"\nExtracted Metrics ({len(metrics)} items):")
            for key, value in metrics.items():
                print(f"  {key}: {value}")
        else:
            print("\nNo metrics extracted")
        
        # Show clauses
        clauses = result.get('clauses', [])
        if clauses:
            print(f"\nExtracted Clauses ({len(clauses)} items):")
            for i, clause in enumerate(clauses[:3], 1):  # Show first 3 clauses
                title = clause.get('title', 'Unknown')
                summary = clause.get('summary', '')
                print(f"  {i}. {title}: {summary[:100]}...")
        else:
            print("\nNo clauses extracted")
        
        print("\n=== SUCCESS ===")
        return True
        
    except Exception as e:
        print(f"\nERROR during OCR processing:")
        print(f"Error: {str(e)}")
        print("\nFull traceback:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Test with the specific file
    pdf_path = r"c:\Users\armaa\Downloads\CBRE - Challenge Statement - HackUTD 2025 (2).pdf"
    
    # Also try the file in the project directory
    project_pdf = r"C:\Users\armaa\OneDrive\Desktop\hackutd\HackUTD2025\CBRE - Challenge Statement - HackUTD 2025 (1).pdf"
    
    print("Testing PDF OCR functionality...\n")
    
    success = False
    
    # Test with Downloads file first
    if os.path.exists(pdf_path):
        print(f"Testing with Downloads file: {pdf_path}")
        success = test_pdf_upload(pdf_path)
    elif os.path.exists(project_pdf):
        print(f"Downloads file not found, testing with project file: {project_pdf}")
        success = test_pdf_upload(project_pdf)
    else:
        print("No PDF files found. Available test options:")
        print(f"1. {pdf_path}")
        print(f"2. {project_pdf}")
        print("\nPlease make sure one of these files exists.")
    
    if success:
        print("\n✓ OCR is working correctly!")
        print("The issue might be with the API endpoint or file upload handling.")
    else:
        print("\n✗ OCR failed - this explains why uploads aren't working.")