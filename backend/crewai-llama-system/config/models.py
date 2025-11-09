#!/usr/bin/env python3

from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running" 
    COMPLETED = "completed"
    FAILED = "failed"

class JobType(str, Enum):
    PROPERTY_INSIGHTS = "property_insights"
    REPORT_GENERATION = "report_generation"
    RESEARCH_WITH_FILES = "research_with_files"
    PROJECT_PLANNING_WITH_FILES = "project_planning_with_files"

class FileType(str, Enum):
    PDF = "pdf"
    IMAGE = "image"
    TEXT = "text"
    DOCUMENT = "document"

class ListingStatus(str, Enum):
    ACTIVE = "active"
    PENDING = "pending"
    SOLD = "sold"
    OFF_MARKET = "off_market"
    EXPIRED = "expired"

class PropertyType(str, Enum):
    SINGLE_FAMILY = "single_family"
    CONDO = "condo"
    TOWNHOUSE = "townhouse"
    MULTI_FAMILY = "multi_family"
    LAND = "land"
    COMMERCIAL = "commercial"
    OTHER = "other"

# Property-related schemas
class PropertyLocation(BaseModel):
    address: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PropertyMetrics(BaseModel):
    current_value: Optional[float] = None
    estimated_rent: Optional[float] = None
    price_per_sqft: Optional[float] = None
    cap_rate: Optional[float] = None
    cash_on_cash_return: Optional[float] = None
    total_return: Optional[float] = None
    appreciation_rate: Optional[float] = None

class ComparableProperty(BaseModel):
    address: str
    sale_price: float
    sale_date: datetime
    square_footage: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    distance_miles: Optional[float] = None

class MarketTrends(BaseModel):
    median_home_price: Optional[float] = None
    price_change_1yr: Optional[float] = None
    price_change_5yr: Optional[float] = None
    days_on_market: Optional[int] = None
    inventory_level: Optional[str] = None
    market_temperature: Optional[str] = None  # hot, warm, cold

class NeighborhoodData(BaseModel):
    school_rating: Optional[float] = None
    crime_rate: Optional[str] = None
    walkability_score: Optional[int] = None
    nearby_amenities: List[str] = []
    public_transportation: Optional[str] = None

# Main document schemas
class PropertyInsight(Document):
    """Property insights and analysis data"""
    
    # Basic property info
    property_address: Indexed(str)
    location: PropertyLocation
    property_type: Optional[str] = None  # single_family, condo, townhouse, etc.
    
    # Analysis metadata
    analysis_date: datetime = Field(default_factory=datetime.utcnow)
    job_id: Optional[str] = None
    query: str  # Original user query
    
    # Market data
    current_metrics: PropertyMetrics
    market_trends: MarketTrends
    neighborhood_data: NeighborhoodData
    comparable_properties: List[ComparableProperty] = []
    
    # Investment analysis
    investment_score: Optional[float] = None  # 1-10 scale
    risk_factors: List[str] = []
    opportunities: List[str] = []
    
    # Raw data sources
    zillow_data: Optional[Dict[str, Any]] = None
    mls_data: Optional[Dict[str, Any]] = None
    other_sources: Optional[Dict[str, Any]] = None
    
    class Settings:
        name = "property_insights"
        indexes = [
            "property_address",
            "analysis_date",
            "investment_score"
        ]

class RealEstateReport(Document):
    """Generated real estate analysis reports"""
    
    # Report metadata
    report_id: str = Field(default_factory=lambda: f"report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}")
    created_date: datetime = Field(default_factory=datetime.utcnow)
    job_id: Optional[str] = None
    
    # Report content
    title: str
    executive_summary: str
    property_overview: str
    market_analysis: str
    financial_analysis: str
    risk_assessment: str
    recommendations: str
    
    # Related data
    property_insight_id: Optional[str] = None  # Reference to PropertyInsight
    property_address: Indexed(str)
    
    # Report metadata
    word_count: Optional[int] = None
    confidence_score: Optional[float] = None  # AI confidence in analysis
    
    # File attachments
    charts_generated: List[str] = []  # URLs or references to charts
    supporting_documents: List[str] = []
    
    class Settings:
        name = "real_estate_reports"
        indexes = [
            "property_address",
            "created_date",
            "report_id"
        ]

class MarketListing(Document):
    """Market listings from CSV data"""
    
    # Listing identification
    listing_id: Optional[str] = None
    mls_number: Optional[str] = None
    
    # Property details
    address: Indexed(str)
    city: str
    state: str
    zip_code: Optional[str] = None
    
    # Property characteristics
    property_type: Optional[PropertyType] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    square_footage: Optional[int] = None
    lot_size: Optional[float] = None
    year_built: Optional[int] = None
    
    # Listing details
    listing_price: Optional[float] = None
    price_per_sqft: Optional[float] = None
    list_date: Optional[datetime] = None
    status: Optional[ListingStatus] = ListingStatus.ACTIVE
    days_on_market: Optional[int] = None
    
    # Location details
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    neighborhood: Optional[str] = None
    school_district: Optional[str] = None
    
    # Property features
    garage_spaces: Optional[int] = None
    pool: Optional[bool] = None
    fireplace: Optional[bool] = None
    air_conditioning: Optional[bool] = None
    heating_type: Optional[str] = None
    
    # Financial details
    property_tax: Optional[float] = None
    hoa_fee: Optional[float] = None
    estimated_payment: Optional[float] = None
    
    # Listing agent info
    listing_agent: Optional[str] = None
    listing_agency: Optional[str] = None
    agent_phone: Optional[str] = None
    
    # Data source and metadata
    data_source: str = "csv_import"
    import_date: datetime = Field(default_factory=datetime.utcnow)
    raw_data: Optional[Dict[str, Any]] = None  # Original CSV row data
    
    # Additional fields that might be in CSV
    description: Optional[str] = None
    features: List[str] = []
    photos: List[str] = []
    virtual_tour_url: Optional[str] = None
    zillow_url: Optional[str] = None
    
    class Settings:
        name = "market_listings"
        indexes = [
            "address",
            "city",
            "listing_price",
            "status", 
            "list_date",
            "property_type",
            "import_date"
        ]

class AnalysisJob(Document):
    """Track analysis jobs and their status"""
    
    # Job identification
    job_id: Indexed(str, unique=True)
    job_type: JobType
    status: JobStatus = JobStatus.PENDING
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Input data
    user_query: str
    input_parameters: Dict[str, Any] = {}
    uploaded_files: List[str] = []  # References to FileUpload documents
    
    # Results
    result_text: Optional[str] = None
    property_insight_id: Optional[str] = None  # Reference to PropertyInsight
    report_id: Optional[str] = None  # Reference to RealEstateReport
    error_message: Optional[str] = None
    
    # Performance metrics
    processing_time_seconds: Optional[float] = None
    tokens_used: Optional[int] = None
    
    class Settings:
        name = "analysis_jobs"
        indexes = [
            "job_id",
            "status",
            "created_at",
            "job_type"
        ]

class FileUpload(Document):
    """Track uploaded files and their processing"""
    
    # File identification
    file_id: str = Field(default_factory=lambda: f"file_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}")
    original_filename: str
    file_type: FileType
    file_size_bytes: int
    
    # Upload metadata
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    uploaded_by: Optional[str] = None  # User ID if available
    job_id: Optional[str] = None  # Associated job
    
    # File storage
    file_path: Optional[str] = None  # Local file path
    cloud_url: Optional[str] = None  # Cloud storage URL
    
    # Processing results
    extracted_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    processing_status: str = "pending"  # pending, processed, failed
    processing_error: Optional[str] = None
    
    # Extracted metadata
    document_type: Optional[str] = None  # lease, contract, deed, etc.
    key_entities: List[str] = []  # Extracted entities
    metadata: Dict[str, Any] = {}
    
    class Settings:
        name = "file_uploads"
        indexes = [
            "file_id",
            "uploaded_at",
            "job_id",
            "processing_status"
        ]

# Additional utility schemas
class UserSession(Document):
    """Track user sessions for analytics"""
    
    session_id: str = Field(default_factory=lambda: f"session_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}")
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    
    # User activity
    queries_count: int = 0
    files_uploaded: int = 0
    reports_generated: int = 0
    
    # Session data
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    
    class Settings:
        name = "user_sessions"

class APIUsage(Document):
    """Track API usage for monitoring"""
    
    endpoint: str
    method: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Request/Response data
    status_code: int
    response_time_ms: float
    request_size_bytes: Optional[int] = None
    response_size_bytes: Optional[int] = None
    
    # User context
    session_id: Optional[str] = None
    job_id: Optional[str] = None
    
    # Error tracking
    error_message: Optional[str] = None
    
    class Settings:
        name = "api_usage"
        indexes = [
            "endpoint",
            "timestamp",
            "status_code"
        ]