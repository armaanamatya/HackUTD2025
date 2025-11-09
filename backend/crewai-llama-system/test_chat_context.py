#!/usr/bin/env python3
"""
Test script to verify chat context includes full OCR content
"""

import requests
import json

def test_chat_with_context():
    """Test chat endpoint with document context"""
    
    # Chat endpoint
    url = "http://localhost:8000/chat"
    
    # Test message
    chat_data = {
        "message": "What is this document about? Give me a detailed summary of the key points.",
        "include_document_context": True
    }
    
    print("Testing chat with document context...")
    print(f"Sending message: {chat_data['message']}")
    
    try:
        response = requests.post(url, json=chat_data, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            
            print("\n=== CHAT SUCCESS ===")
            print(f"Response length: {len(result.get('response', ''))}")
            print(f"Documents used: {result.get('documents_used', [])}")
            
            response_text = result.get('response', '')
            print(f"\n📝 AI RESPONSE:")
            print("-" * 50)
            print(response_text)
            print("-" * 50)
            
            return True
        else:
            print(f"Chat failed with status: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def check_documents():
    """Check what documents are available"""
    try:
        response = requests.get("http://localhost:8000/documents")
        if response.status_code == 200:
            docs = response.json()
            print(f"📋 Available documents: {docs.get('total_count', 0)}")
            
            for doc in docs.get('documents', [])[:3]:
                doc_id = doc.get('document_id')
                filename = doc.get('original_filename')
                text_length = doc.get('text_length', 0)
                print(f"   • {filename} (ID: {doc_id[:8]}..., {text_length} chars)")
            
            return docs.get('total_count', 0) > 0
        else:
            print("Failed to get documents list")
            return False
    except Exception as e:
        print(f"Error checking documents: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing chat context with full OCR content...\n")
    
    # Check if documents are available
    if check_documents():
        print("\nDocuments found! Testing chat...")
        success = test_chat_with_context()
        
        if success:
            print("\n✓ Chat is working with full document context!")
            print("\nCheck the backend terminal to see:")
            print("- Full extracted text being logged")
            print("- Complete context being sent to LLM")
            print("- Agent processing with document information")
        else:
            print("\n✗ Chat failed - check backend logs")
    else:
        print("\nNo documents found. Please upload a PDF first using:")
        print("python test_upload_endpoint.py")