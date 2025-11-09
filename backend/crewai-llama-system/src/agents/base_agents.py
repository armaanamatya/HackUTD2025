from crewai import Agent
from config import default_llm
import sys
from pathlib import Path
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Add path to access document service
sys.path.append(str(Path(__file__).parent.parent))


class BaseAgents:
    def __init__(self):
        # Import document service to get context
        logger.info("🔧 Initializing BaseAgents...")
        try:
            from src.services.document_service import DocumentService
            self.document_service = DocumentService()
            logger.info("✅ Document service initialized successfully")
        except ImportError as e:
            logger.warning(f"⚠️ Failed to import DocumentService: {str(e)}")
            self.document_service = None
        except Exception as e:
            logger.error(f"❌ Error initializing DocumentService: {str(e)}")
            self.document_service = None
    
    def _get_document_context_for_system(self) -> str:
        """Get all document content to inject into system instructions."""
        logger.info("🔍 Retrieving document context for system instructions...")
        
        if not self.document_service:
            logger.warning("⚠️ Document service not available - no document context will be included")
            return ""
        
        try:
            documents = self.document_service.list_documents()
            logger.info(f"📚 Found {len(documents)} document(s) in storage")
            
            if not documents:
                logger.info("ℹ️ No documents found - returning empty context")
                return ""
            
            context_parts = []
            total_text_length = 0
            
            for idx, doc in enumerate(documents, 1):
                doc_id = doc["document_id"]
                filename = doc.get("original_filename", "Unknown")
                logger.info(f"📄 Processing document {idx}/{len(documents)}: {filename} (ID: {doc_id})")
                
                # Get OCR results
                ocr_results = self.document_service.get_document_ocr_results(doc_id)
                if ocr_results:
                    extracted_text = ocr_results.get("extracted_text", "")
                    metrics = ocr_results.get("metrics", {})
                    clauses = ocr_results.get("clauses", [])
                    
                    text_length = len(extracted_text) if extracted_text else 0
                    total_text_length += text_length
                    
                    logger.info(f"   ✓ Extracted text: {text_length} chars | Metrics: {len(metrics)} | Clauses: {len(clauses)}")
                    
                    doc_context = f"\n=== UPLOADED DOCUMENT: {filename} ===\n"
                    
                    if extracted_text:
                        doc_context += f"DOCUMENT CONTENT:\n{extracted_text}\n\n"
                        logger.info(f"   ✓ Added document content ({text_length} chars)")
                    
                    if metrics:
                        doc_context += "KEY METRICS:\n"
                        for key, value in metrics.items():
                            if value is not None:
                                doc_context += f"- {key}: {value}\n"
                        doc_context += "\n"
                        logger.info(f"   ✓ Added {len(metrics)} metrics")
                    
                    if clauses:
                        doc_context += "IMPORTANT SECTIONS:\n"
                        for clause in clauses:
                            title = clause.get("title", "Unknown")
                            summary = clause.get("summary", "")
                            doc_context += f"- {title}: {summary}\n"
                        doc_context += "\n"
                        logger.info(f"   ✓ Added {len(clauses)} clauses")
                    
                    context_parts.append(doc_context)
                else:
                    logger.warning(f"   ⚠️ No OCR results found for document {filename} (ID: {doc_id})")
            
            if context_parts:
                full_context = "\n".join(context_parts)
                system_context = f"""

==================================================
UPLOADED DOCUMENT CONTEXT (SYSTEM LEVEL)
==================================================

You have access to the following uploaded documents and their complete content. This information is part of your system knowledge and should be referenced when answering questions:

{full_context}

==================================================
END DOCUMENT CONTEXT
==================================================

INSTRUCTIONS: When users ask questions, always consider the context from these uploaded documents. Reference specific information, metrics, and content from the documents when relevant. You have complete access to all document content above.
"""
                context_length = len(system_context)
                logger.info(f"✅ Document context prepared successfully | Total context length: {context_length:,} chars | Total text from documents: {total_text_length:,} chars")
                logger.info(f"📊 Context includes {len(documents)} document(s) with full extracted text, metrics, and clauses")
                return system_context
            else:
                logger.warning("⚠️ No document context parts generated - returning empty context")
            
        except Exception as e:
            logger.error(f"❌ Error getting document context: {str(e)}", exc_info=True)
        
        return ""
    
    def create_property_insights_agent(self) -> Agent:
        # Get document context for system instructions
        logger.info("🤖 Creating property insights agent with document context...")
        document_context = self._get_document_context_for_system()
        
        base_backstory = """You are a specialized real estate data analyst with deep expertise in 
        property market research. You excel at gathering insights from multiple sources including:
        - Zillow and MLS data for property values and history
        - Market trends and neighborhood analytics
        - Comparable property analysis (comps)
        - Historical price trends and appreciation rates
        - Local market conditions and economic factors
        - Property tax records and assessment data
        - School district ratings and local amenities
        You have access to comprehensive real estate databases and know how to extract 
        meaningful insights that inform investment decisions."""
        
        # Inject document context into system instructions
        full_backstory = base_backstory + document_context
        context_length = len(document_context)
        logger.info(f"✅ Property insights agent created | Document context length: {context_length:,} chars")
        
        return Agent(
            role="Real Estate Property Insights Specialist",
            goal="Gather comprehensive market insights, property history, and current market data for specific properties",
            backstory=full_backstory,
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=4,
        )

    def create_report_generation_agent(self) -> Agent:
        # Get document context for system instructions
        document_context = self._get_document_context_for_system()
        
        base_backstory = """You are an expert real estate analyst who specializes in creating 
        concise, information-rich answers. You excel at:
        - Synthesizing complex data from multiple sources (Tavily, Perplexity) into clear, direct answers
        - Extracting and presenting only the most relevant information
        - Providing actionable insights without unnecessary verbosity
        - Structuring answers logically: Key findings, market insights, and recommendations
        - Eliminating redundancy while maintaining completeness
        - Answering specific questions directly with supporting data
        - Presenting information in a scannable, easy-to-digest format
        Your answers are known for being comprehensive yet concise, containing all relevant 
        information without the fluff of traditional lengthy reports."""
        
        # Inject document context into system instructions
        full_backstory = base_backstory + document_context
        
        return Agent(
            role="Real Estate Answer Specialist",
            goal="Provide concise, comprehensive answers synthesizing all relevant information from Tavily and Perplexity searches",
            backstory=full_backstory,
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=3,
        )

    def create_insight_router_agent(self) -> Agent:
        # Get document context for system instructions
        logger.info("🤖 Creating insight router agent with document context...")
        document_context = self._get_document_context_for_system()
        
        base_backstory = """You act as an intelligent router that:
        - Classifies incoming queries into one of: analytics, document, or chat
        - Plans and triggers web research/tool calls (Perplexity, Tavily, page fetch)
        - Uses search_market_listings tool to query MongoDB database when user asks about properties, listings, or real estate data
        - Uses get_market_listings_stats for market statistics and trends analysis
        - Structures findings into a clean JSON payload for a downstream generator
        - Extracts parameters such as location, price ranges, time windows, and filters
        - Summarizes sources and ensures data is organized for easy consumption
        Your output is strictly JSON as a data contract to the generator."""
        
        # Inject document context into system instructions
        full_backstory = base_backstory + document_context
        context_length = len(document_context)
        logger.info(f"✅ Router agent created | Document context length: {context_length:,} chars")
        
        return Agent(
            role="Insight Agent (Router)",
            goal="Classify user intent and prepare structured context with relevant tool calls",
            backstory=full_backstory,
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=4,
        )

    def create_unified_response_agent(self) -> Agent:
        # Get document context for system instructions
        document_context = self._get_document_context_for_system()
        
        base_backstory = """You transform a router-produced JSON payload into a final response:
        - For analytics: produce insights, metrics, and chart-ready structures
        - For document: compile listings/extractions with filters and sources
        - For chat: respond concisely with helpful information
        Outputs are structured JSON designed for frontend consumption, including sections/blocks and sources."""
        
        # Inject document context into system instructions
        full_backstory = base_backstory + document_context
        
        return Agent(
            role="Unified Response Generator",
            goal="Generate polished, structured user-facing responses from router JSON for analytics, document, or chat",
            backstory=full_backstory,
            llm=default_llm,
            verbose=True,
            allow_delegation=False,
            max_iter=3,
        )
