"""
Document Service for storing and managing uploaded documents and their extracted content.
"""

import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentService:
    """Service for managing document uploads, OCR results, and context storage."""
    
    def __init__(self, storage_path: str = "data/documents"):
        """
        Initialize the document service.
        
        Args:
            storage_path: Path to store documents and metadata
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        self.files_path = self.storage_path / "files"
        self.metadata_path = self.storage_path / "metadata"
        self.ocr_results_path = self.storage_path / "ocr_results"
        
        # Create subdirectories
        self.files_path.mkdir(exist_ok=True)
        self.metadata_path.mkdir(exist_ok=True)
        self.ocr_results_path.mkdir(exist_ok=True)
        
        logger.info(f"Document service initialized with storage path: {self.storage_path}")
    
    def store_document(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        ocr_result: Dict[str, Any]
    ) -> str:
        """
        Store a document and its OCR results.
        
        Args:
            file_bytes: The document file as bytes
            filename: Original filename
            mime_type: MIME type of the file
            ocr_result: Result from OCR processing
            
        Returns:
            Document ID for future reference
        """
        doc_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        logger.info(f"Storing document | ID: {doc_id} | Filename: {filename}")
        
        # Store the file
        file_extension = Path(filename).suffix
        stored_filename = f"{doc_id}{file_extension}"
        file_path = self.files_path / stored_filename
        
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        
        # Store metadata
        metadata = {
            "document_id": doc_id,
            "original_filename": filename,
            "stored_filename": stored_filename,
            "mime_type": mime_type,
            "upload_timestamp": timestamp,
            "file_size": len(file_bytes),
            "file_path": str(file_path)
        }
        
        metadata_file = self.metadata_path / f"{doc_id}.json"
        with open(metadata_file, "w") as f:
            json.dump(metadata, f, indent=2)
        
        # Store OCR results
        ocr_data = {
            "document_id": doc_id,
            "processing_timestamp": timestamp,
            "extracted_text": ocr_result.get("text", ""),
            "metrics": ocr_result.get("metrics", {}),
            "clauses": ocr_result.get("clauses", []),
            "document_type": ocr_result.get("document_type", "unknown")
        }
        
        ocr_file = self.ocr_results_path / f"{doc_id}_ocr.json"
        with open(ocr_file, "w") as f:
            json.dump(ocr_data, f, indent=2)
        
        logger.info(f"Document stored successfully | ID: {doc_id}")
        return doc_id
    
    def get_document_text(self, doc_id: str) -> Optional[str]:
        """
        Get the extracted text from a document.
        
        Args:
            doc_id: Document ID
            
        Returns:
            Extracted text or None if not found
        """
        ocr_file = self.ocr_results_path / f"{doc_id}_ocr.json"
        
        if not ocr_file.exists():
            logger.warning(f"OCR results not found for document ID: {doc_id}")
            return None
        
        try:
            with open(ocr_file, "r") as f:
                ocr_data = json.load(f)
            return ocr_data.get("extracted_text", "")
        except Exception as e:
            logger.error(f"Error reading OCR results for {doc_id}: {str(e)}")
            return None
    
    def get_document_metadata(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a document.
        
        Args:
            doc_id: Document ID
            
        Returns:
            Document metadata or None if not found
        """
        metadata_file = self.metadata_path / f"{doc_id}.json"
        
        if not metadata_file.exists():
            logger.warning(f"Metadata not found for document ID: {doc_id}")
            return None
        
        try:
            with open(metadata_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading metadata for {doc_id}: {str(e)}")
            return None
    
    def get_document_ocr_results(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full OCR results for a document.
        
        Args:
            doc_id: Document ID
            
        Returns:
            OCR results or None if not found
        """
        ocr_file = self.ocr_results_path / f"{doc_id}_ocr.json"
        
        if not ocr_file.exists():
            logger.warning(f"OCR results not found for document ID: {doc_id}")
            return None
        
        try:
            with open(ocr_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading OCR results for {doc_id}: {str(e)}")
            return None
    
    def list_documents(self) -> List[Dict[str, Any]]:
        """
        List all stored documents with their metadata.
        
        Returns:
            List of document metadata
        """
        documents = []
        
        for metadata_file in self.metadata_path.glob("*.json"):
            try:
                with open(metadata_file, "r") as f:
                    metadata = json.load(f)
                
                # Add OCR summary
                doc_id = metadata["document_id"]
                ocr_results = self.get_document_ocr_results(doc_id)
                if ocr_results:
                    metadata["has_ocr"] = True
                    metadata["text_length"] = len(ocr_results.get("extracted_text", ""))
                    metadata["metrics_count"] = len(ocr_results.get("metrics", {}))
                    metadata["clauses_count"] = len(ocr_results.get("clauses", []))
                else:
                    metadata["has_ocr"] = False
                
                documents.append(metadata)
            except Exception as e:
                logger.error(f"Error reading metadata file {metadata_file}: {str(e)}")
        
        # Sort by upload timestamp (newest first)
        documents.sort(key=lambda x: x.get("upload_timestamp", ""), reverse=True)
        
        logger.info(f"Listed {len(documents)} documents")
        return documents
    
    def delete_document(self, doc_id: str) -> bool:
        """
        Delete a document and all its associated data.
        
        Args:
            doc_id: Document ID
            
        Returns:
            True if deleted successfully, False otherwise
        """
        logger.info(f"Deleting document | ID: {doc_id}")
        
        success = True
        
        # Delete metadata
        metadata_file = self.metadata_path / f"{doc_id}.json"
        if metadata_file.exists():
            try:
                metadata_file.unlink()
                logger.info(f"Deleted metadata for {doc_id}")
            except Exception as e:
                logger.error(f"Error deleting metadata for {doc_id}: {str(e)}")
                success = False
        
        # Delete OCR results
        ocr_file = self.ocr_results_path / f"{doc_id}_ocr.json"
        if ocr_file.exists():
            try:
                ocr_file.unlink()
                logger.info(f"Deleted OCR results for {doc_id}")
            except Exception as e:
                logger.error(f"Error deleting OCR results for {doc_id}: {str(e)}")
                success = False
        
        # Delete original file
        metadata = self.get_document_metadata(doc_id)
        if metadata:
            file_path = Path(metadata.get("file_path", ""))
            if file_path.exists():
                try:
                    file_path.unlink()
                    logger.info(f"Deleted file for {doc_id}")
                except Exception as e:
                    logger.error(f"Error deleting file for {doc_id}: {str(e)}")
                    success = False
        
        return success
    
    def get_all_document_texts(self) -> str:
        """
        Get concatenated text from all documents for use as context.
        
        Returns:
            Combined text from all documents
        """
        all_texts = []
        documents = self.list_documents()
        
        for doc in documents:
            doc_id = doc["document_id"]
            text = self.get_document_text(doc_id)
            if text:
                filename = doc.get("original_filename", "Unknown")
                all_texts.append(f"=== Document: {filename} ===\n{text}\n")
        
        combined_text = "\n".join(all_texts)
        logger.info(f"Combined text from {len(documents)} documents | Total length: {len(combined_text)} chars")
        
        return combined_text
    
    def search_documents(self, query: str) -> List[Dict[str, Any]]:
        """
        Search documents by filename or extracted text content.
        
        Args:
            query: Search query
            
        Returns:
            List of matching documents with relevance info
        """
        query_lower = query.lower()
        matches = []
        
        for doc in self.list_documents():
            doc_id = doc["document_id"]
            score = 0
            
            # Check filename match
            if query_lower in doc.get("original_filename", "").lower():
                score += 10
            
            # Check text content match
            text = self.get_document_text(doc_id)
            if text and query_lower in text.lower():
                score += 5
                # Count occurrences for better scoring
                occurrences = text.lower().count(query_lower)
                score += min(occurrences, 20)  # Cap at 20 extra points
            
            if score > 0:
                doc_copy = doc.copy()
                doc_copy["relevance_score"] = score
                matches.append(doc_copy)
        
        # Sort by relevance score
        matches.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        logger.info(f"Found {len(matches)} documents matching query: {query}")
        return matches