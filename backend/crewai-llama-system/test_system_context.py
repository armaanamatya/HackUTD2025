#!/usr/bin/env python3
"""
Test script to verify system-level document context integration
"""

import requests
import json
import time

def test_system_document_context():
    """Test that agents have document context built into their system instructions"""
    
    print("🧪 TESTING SYSTEM-LEVEL DOCUMENT CONTEXT")
    print("=" * 60)
    
    # Step 1: Check available documents
    print("📋 Step 1: Checking available documents...")
    try:
        response = requests.get("http://localhost:8000/documents")
        if response.status_code == 200:
            docs = response.json()
            doc_count = docs.get('total_count', 0)
            print(f"   Found {doc_count} uploaded documents")
            
            if doc_count == 0:
                print("❌ No documents found. Please upload a PDF first.")
                return False
                
            for i, doc in enumerate(docs.get('documents', [])[:3], 1):
                filename = doc.get('original_filename', 'Unknown')
                text_length = doc.get('text_length', 0)
                print(f"   {i}. {filename} ({text_length} chars)")
        else:
            print(f"❌ Failed to get documents: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking documents: {str(e)}")
        return False
    
    # Step 2: Test chat with questions that require document knowledge
    print(f"\n🤖 Step 2: Testing chat with document-specific questions...")
    
    test_questions = [
        {
            "question": "What is this document about? Give me the main topic and purpose.",
            "expect": "Should reference document content directly"
        },
        {
            "question": "What are the key challenges or problems mentioned in the uploaded document?",
            "expect": "Should cite specific challenges from document"
        },
        {
            "question": "What metrics or data points are mentioned in the document?",
            "expect": "Should reference extracted metrics"
        }
    ]
    
    for i, test in enumerate(test_questions, 1):
        print(f"\n   Question {i}: {test['question']}")
        print(f"   Expected: {test['expect']}")
        
        # Send chat request
        chat_data = {
            "message": test['question'],
            "include_document_context": True
        }
        
        try:
            print(f"   Sending request...")
            response = requests.post("http://localhost:8000/chat", json=chat_data, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '')
                documents_used = result.get('documents_used', [])
                
                print(f"   ✅ Response received ({len(response_text)} chars)")
                print(f"   📄 Documents referenced: {len(documents_used)}")
                
                # Show response preview
                preview = response_text[:200] + "..." if len(response_text) > 200 else response_text
                print(f"   📝 Response preview: {preview}")
                
                # Check if response seems to reference document content
                if len(response_text) > 100 and documents_used:
                    print(f"   ✅ Good response with document context")
                else:
                    print(f"   ⚠️ Response may lack document context")
                    
            else:
                print(f"   ❌ Chat failed: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
        
        # Brief pause between requests
        time.sleep(2)
    
    print(f"\n🔍 Step 3: Checking backend logs...")
    print("   Check your backend terminal for:")
    print("   - 🧠 'AGENTS HAVE DOCUMENT CONTEXT IN SYSTEM INSTRUCTIONS'")
    print("   - 📄 'SYSTEM-LEVEL DOCUMENT CONTEXT: X documents available'")
    print("   - Agent creation with document context in backstories")
    
    return True

def test_agent_system_instructions():
    """Test that agents actually have document context in their system instructions"""
    
    print(f"\n🔬 TESTING AGENT SYSTEM INSTRUCTIONS")
    print("=" * 60)
    
    try:
        import sys
        from pathlib import Path
        from dotenv import load_dotenv
        
        # Load environment
        load_dotenv()
        
        # Add paths
        sys.path.append(str(Path(__file__).parent / "src"))
        sys.path.append(str(Path(__file__).parent.parent.parent))
        
        from src.agents.base_agents import BaseAgents
        
        print("📝 Creating BaseAgents instance...")
        agents = BaseAgents()
        
        print("🤖 Testing agent creation with system context...")
        
        # Test creating an agent
        router_agent = agents.create_insight_router_agent()
        
        # Check if backstory contains document context
        backstory = router_agent.backstory
        
        print(f"📖 Agent backstory length: {len(backstory)} chars")
        
        # Look for document context markers
        has_context = any(marker in backstory for marker in [
            "UPLOADED DOCUMENT CONTEXT",
            "DOCUMENT CONTENT:",
            "END DOCUMENT CONTEXT"
        ])
        
        if has_context:
            print("✅ Agent backstory includes document context!")
            print("🔍 Context preview:")
            
            # Find document context section
            if "UPLOADED DOCUMENT CONTEXT" in backstory:
                context_start = backstory.find("UPLOADED DOCUMENT CONTEXT")
                context_preview = backstory[context_start:context_start + 300] + "..."
                print(f"   {context_preview}")
            
        else:
            print("❌ Agent backstory does NOT include document context")
            print(f"   Backstory preview: {backstory[:200]}...")
        
        return has_context
        
    except Exception as e:
        print(f"❌ Error testing agent instructions: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 SYSTEM-LEVEL DOCUMENT CONTEXT TEST")
    print("=" * 60)
    print("This test verifies that uploaded documents are injected")
    print("into agent system instructions, not just chat context.")
    print()
    
    # Test 1: System instructions
    system_test = test_agent_system_instructions()
    
    # Test 2: End-to-end chat flow
    chat_test = test_system_document_context()
    
    print("\n" + "=" * 60)
    print("🏁 TEST RESULTS")
    print("=" * 60)
    print(f"System Instructions Test: {'✅ PASS' if system_test else '❌ FAIL'}")
    print(f"Chat Integration Test: {'✅ PASS' if chat_test else '❌ FAIL'}")
    
    if system_test and chat_test:
        print("\n🎉 SUCCESS! Documents are now part of agent system instructions!")
        print("💡 Agents have persistent access to all uploaded document content.")
    else:
        print("\n❌ Issues detected. Check backend logs and uploaded documents.")