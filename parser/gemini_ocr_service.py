"""
Gemini OCR Service for Document Processing

Uses Google Gemini API to scan reports, contracts, or sustainability plans
and automatically extract useful metrics or clauses.
"""

import os
import base64
from typing import Dict, List, Optional, Any
from pathlib import Path
from dotenv import load_dotenv
import time
import logging

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[OCR] %(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
except ImportError:
    raise ImportError("google-generativeai package is required. Install with: pip install google-generativeai")


class GeminiOCRService:
    """OCR service using Gemini API for document analysis and extraction."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Gemini OCR service.
        
        Args:
            api_key: Gemini API key. If not provided, reads from GEMINI_API_KEY env var.
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        logger.info("Initializing Gemini OCR service")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("Gemini OCR service initialized successfully")
    
    def process_document(
        self,
        file_path: str,
        document_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a document and extract metrics/clauses.
        
        Args:
            file_path: Path to the document file (PDF, image, etc.)
            document_type: Type of document ('contract', 'report', 'sustainability_plan', None for auto-detect)
            
        Returns:
            Dictionary with extracted text, metrics, and clauses
        """
        start_time = time.time()
        file_name = Path(file_path).name
        logger.info(f"Starting document processing | File: {file_name} | Type: {document_type or 'auto-detect'}")
        
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            raise FileNotFoundError(f"File not found: {file_path}")
        
        file_extension = Path(file_path).suffix.lower()
        file_size = os.path.getsize(file_path)
        logger.info(f"File details | Name: {file_name} | Extension: {file_extension} | Size: {file_size} bytes")
        
        # Read file as base64
        with open(file_path, "rb") as f:
            file_data = f.read()
        
        file_base64 = base64.b64encode(file_data).decode("utf-8")
        logger.info(f"File encoded to base64 | Original size: {file_size} bytes | Encoded size: {len(file_base64)} chars")
        
        # Determine MIME type
        mime_type = self._get_mime_type(file_extension)
        logger.info(f"MIME type determined: {mime_type}")
        
        # Create prompt based on document type
        prompt = self._create_extraction_prompt(document_type, file_name)
        logger.info(f"Extraction prompt created | Length: {len(prompt)} chars")
        
        # Process with Gemini
        try:
            logger.info(f"Sending request to Gemini API | File: {file_name}")
            gemini_start = time.time()
            
            response = self.model.generate_content([
                {
                    "mime_type": mime_type,
                    "data": file_base64
                },
                prompt
            ])
            
            gemini_duration = time.time() - gemini_start
            extracted_text = response.text
            logger.info(f"Gemini API response received | Duration: {gemini_duration:.2f}s | Response length: {len(extracted_text)} chars")
            
            # Parse structured data from response
            logger.info(f"Parsing structured data from response | File: {file_name}")
            metrics = self._extract_metrics_from_response(extracted_text)
            clauses = self._extract_clauses_from_response(extracted_text)
            
            total_duration = time.time() - start_time
            logger.info(f"Document processing completed | File: {file_name} | Total duration: {total_duration:.2f}s | Metrics: {len(metrics)} items | Clauses: {len(clauses)} items")
            
            return {
                "text": extracted_text,
                "metrics": metrics,
                "clauses": clauses,
                "document_type": document_type or "auto-detected",
                "file_name": file_name
            }
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"Document processing failed | File: {file_name} | Duration: {duration:.2f}s | Error: {str(e)}")
            raise RuntimeError(f"Error processing document with Gemini: {str(e)}")
    
    def process_document_bytes(
        self,
        file_bytes: bytes,
        file_name: str,
        mime_type: str,
        document_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process document from bytes (useful for API endpoints).
        
        Args:
            file_bytes: Document file as bytes
            file_name: Name of the file
            mime_type: MIME type of the file
            document_type: Type of document ('contract', 'report', 'sustainability_plan', None for auto-detect)
            
        Returns:
            Dictionary with extracted text, metrics, and clauses
        """
        start_time = time.time()
        logger.info(f"Starting document processing from bytes | File: {file_name} | Size: {len(file_bytes)} bytes | MIME: {mime_type} | Type: {document_type or 'auto-detect'}")
        
        file_base64 = base64.b64encode(file_bytes).decode("utf-8")
        logger.info(f"File encoded to base64 | Original size: {len(file_bytes)} bytes | Encoded size: {len(file_base64)} chars")
        
        prompt = self._create_extraction_prompt(document_type, file_name)
        logger.info(f"Extraction prompt created | Length: {len(prompt)} chars")
        
        try:
            logger.info(f"Sending request to Gemini API | File: {file_name}")
            gemini_start = time.time()
            
            response = self.model.generate_content([
                {
                    "mime_type": mime_type,
                    "data": file_base64
                },
                prompt
            ])
            
            gemini_duration = time.time() - gemini_start
            extracted_text = response.text
            logger.info(f"Gemini API response received | Duration: {gemini_duration:.2f}s | Response length: {len(extracted_text)} chars")
            
            logger.info(f"Parsing structured data from response | File: {file_name}")
            metrics = self._extract_metrics_from_response(extracted_text)
            clauses = self._extract_clauses_from_response(extracted_text)
            
            total_duration = time.time() - start_time
            logger.info(f"Document processing from bytes completed | File: {file_name} | Total duration: {total_duration:.2f}s | Metrics: {len(metrics)} items | Clauses: {len(clauses)} items")
            
            return {
                "text": extracted_text,
                "metrics": metrics,
                "clauses": clauses,
                "document_type": document_type or "auto-detected",
                "file_name": file_name
            }
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"Document processing from bytes failed | File: {file_name} | Duration: {duration:.2f}s | Error: {str(e)}")
            raise RuntimeError(f"Error processing document with Gemini: {str(e)}")
    
    def _get_mime_type(self, file_extension: str) -> str:
        """Get MIME type from file extension."""
        mime_types = {
            ".pdf": "application/pdf",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".webp": "image/webp",
        }
        return mime_types.get(file_extension, "application/octet-stream")
    
    def _create_extraction_prompt(
        self,
        document_type: Optional[str],
        file_name: str
    ) -> str:
        """Create extraction prompt based on document type."""
        base_prompt = """Analyze this document and extract the following information in a structured format:

1. **Full Text**: Extract all readable text from the document.

2. **Key Metrics** (extract as JSON):
   - Total clauses/sections count
   - Rent amount (if applicable)
   - Expiration/end dates
   - Compliance indicators
   - Financial figures
   - Dates and deadlines
   - Any numerical metrics relevant to the document type

3. **Important Clauses** (list each with title and summary):
   - Legal clauses
   - Terms and conditions
   - Renewal/termination clauses
   - Financial terms
   - Compliance requirements
   - Risk factors
   - Sustainability metrics (if applicable)

Format your response as:
TEXT:
[Full extracted text]

METRICS:
{
  "totalClauses": number,
  "rentAmount": "string or null",
  "expiringSoon": boolean,
  "complianceScore": number (0-100),
  "expirationDate": "string or null",
  "financialMetrics": {},
  "otherMetrics": {}
}

CLAUSES:
- [Clause Title]: [Brief summary]
- [Clause Title]: [Brief summary]
...
"""
        
        if document_type == "contract":
            base_prompt += "\n\nFocus on lease terms, rent amounts, dates, renewal options, and legal obligations."
        elif document_type == "report":
            base_prompt += "\n\nFocus on performance metrics, financial data, compliance status, and key findings."
        elif document_type == "sustainability_plan":
            base_prompt += "\n\nFocus on sustainability metrics, environmental goals, compliance requirements, and green building standards."
        
        return base_prompt
    
    def _extract_metrics_from_response(self, response_text: str) -> Dict[str, Any]:
        """Extract metrics from Gemini response."""
        logger.info("Extracting metrics from Gemini response")
        
        metrics = {
            "totalClauses": 0,
            "rentAmount": None,
            "expiringSoon": False,
            "complianceScore": 85,
            "expirationDate": None,
            "financialMetrics": {},
            "otherMetrics": {}
        }
        
        # Try to extract JSON from METRICS section
        if "METRICS:" in response_text:
            logger.info("Found METRICS section in response")
            metrics_section = response_text.split("METRICS:")[1].split("CLAUSES:")[0].strip()
            logger.info(f"Metrics section length: {len(metrics_section)} chars")
            
            try:
                import json
                import re
                # Extract JSON object
                json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', metrics_section, re.DOTALL)
                if json_match:
                    logger.info("Found JSON in metrics section")
                    parsed_metrics = json.loads(json_match.group())
                    metrics.update(parsed_metrics)
                    logger.info(f"Successfully parsed metrics: {list(parsed_metrics.keys())}")
                else:
                    logger.warning("No valid JSON found in metrics section")
            except Exception as e:
                logger.error(f"Failed to parse metrics JSON: {str(e)}")
        else:
            logger.warning("No METRICS section found in response")
        
        logger.info(f"Metrics extraction completed | Found {len(metrics)} metric fields")
        return metrics
    
    def _extract_clauses_from_response(self, response_text: str) -> List[Dict[str, str]]:
        """Extract clauses from Gemini response."""
        logger.info("Extracting clauses from Gemini response")
        clauses = []
        
        if "CLAUSES:" in response_text:
            logger.info("Found CLAUSES section in response")
            clauses_section = response_text.split("CLAUSES:")[1].strip()
            lines = clauses_section.split("\n")
            logger.info(f"Processing {len(lines)} lines for clauses")
            
            for i, line in enumerate(lines):
                line = line.strip()
                if line.startswith("-") and ":" in line:
                    parts = line[1:].split(":", 1)
                    if len(parts) == 2:
                        clause = {
                            "title": parts[0].strip(),
                            "summary": parts[1].strip()
                        }
                        clauses.append(clause)
                        logger.info(f"Extracted clause {len(clauses)}: {clause['title'][:50]}...")
        else:
            logger.warning("No CLAUSES section found in response")
        
        logger.info(f"Clauses extraction completed | Found {len(clauses)} clauses")
        return clauses


def process_document_with_gemini(
    file_path: str,
    document_type: Optional[str] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Convenience function to process a document with Gemini OCR.
    
    Args:
        file_path: Path to the document file
        document_type: Type of document ('contract', 'report', 'sustainability_plan', None for auto-detect)
        api_key: Optional Gemini API key
        
    Returns:
        Dictionary with extracted text, metrics, and clauses
    """
    service = GeminiOCRService(api_key=api_key)
    return service.process_document(file_path, document_type=document_type)

