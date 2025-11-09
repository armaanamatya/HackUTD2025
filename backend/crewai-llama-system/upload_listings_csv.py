#!/usr/bin/env python3

import asyncio
import pandas as pd
import sys
import os
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
import json
import re

# Add config directory to path
sys.path.append(str(Path(__file__).parent))

from config.database import connect_to_mongo, close_mongo_connection
from config.models import MarketListing, PropertyType, ListingStatus

class CSVListingUploader:
    """Upload market listings from CSV to MongoDB"""
    
    def __init__(self):
        self.stats = {
            'total_rows': 0,
            'successful_uploads': 0,
            'failed_uploads': 0,
            'skipped_rows': 0,
            'errors': []
        }
    
    def clean_numeric_value(self, value: Any) -> Optional[float]:
        """Clean and convert numeric values from CSV"""
        if pd.isna(value) or value == '' or value is None:
            return None
        
        if isinstance(value, (int, float)):
            return float(value)
        
        if isinstance(value, str):
            # Remove common formatting: $, commas, spaces
            cleaned = re.sub(r'[$,\s]', '', value.strip())
            # Remove any remaining non-numeric characters except decimal points
            cleaned = re.sub(r'[^\d.-]', '', cleaned)
            
            try:
                return float(cleaned) if cleaned else None
            except ValueError:
                return None
        
        return None
    
    def clean_string_value(self, value: Any) -> Optional[str]:
        """Clean string values from CSV"""
        if pd.isna(value) or value == '' or value is None:
            return None
        return str(value).strip()
    
    def clean_integer_value(self, value: Any) -> Optional[int]:
        """Clean and convert integer values from CSV"""
        numeric = self.clean_numeric_value(value)
        if numeric is not None:
            return int(numeric)
        return None
    
    def parse_boolean(self, value: Any) -> Optional[bool]:
        """Parse boolean values from CSV"""
        if pd.isna(value) or value == '' or value is None:
            return None
        
        if isinstance(value, bool):
            return value
        
        if isinstance(value, str):
            value = value.lower().strip()
            if value in ['yes', 'true', '1', 'y', 'on']:
                return True
            elif value in ['no', 'false', '0', 'n', 'off']:
                return False
        
        return None
    
    def parse_date(self, value: Any) -> Optional[datetime]:
        """Parse date values from CSV"""
        if pd.isna(value) or value == '' or value is None:
            return None
        
        try:
            if isinstance(value, str):
                # Common date formats
                for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%m-%d-%Y', '%Y/%m/%d']:
                    try:
                        return datetime.strptime(value.strip(), fmt)
                    except ValueError:
                        continue
            return pd.to_datetime(value)
        except:
            return None
    
    def map_property_type(self, value: str) -> PropertyType:
        """Map CSV property type to enum"""
        if not value:
            return PropertyType.OTHER
        
        value = value.lower().strip()
        mapping = {
            'single family': PropertyType.SINGLE_FAMILY,
            'single-family': PropertyType.SINGLE_FAMILY,
            'house': PropertyType.SINGLE_FAMILY,
            'condo': PropertyType.CONDO,
            'condominium': PropertyType.CONDO,
            'townhouse': PropertyType.TOWNHOUSE,
            'townhome': PropertyType.TOWNHOUSE,
            'multi-family': PropertyType.MULTI_FAMILY,
            'multifamily': PropertyType.MULTI_FAMILY,
            'duplex': PropertyType.MULTI_FAMILY,
            'land': PropertyType.LAND,
            'lot': PropertyType.LAND,
            'commercial': PropertyType.COMMERCIAL,
        }
        
        for key, prop_type in mapping.items():
            if key in value:
                return prop_type
        
        return PropertyType.OTHER
    
    def map_listing_status(self, value: str) -> ListingStatus:
        """Map CSV listing status to enum"""
        if not value:
            return ListingStatus.ACTIVE
        
        value = value.lower().strip()
        mapping = {
            'active': ListingStatus.ACTIVE,
            'for sale': ListingStatus.ACTIVE,
            'pending': ListingStatus.PENDING,
            'under contract': ListingStatus.PENDING,
            'sold': ListingStatus.SOLD,
            'off market': ListingStatus.OFF_MARKET,
            'withdrawn': ListingStatus.OFF_MARKET,
            'expired': ListingStatus.EXPIRED,
        }
        
        for key, status in mapping.items():
            if key in value:
                return status
        
        return ListingStatus.ACTIVE
    
    def detect_column_mappings(self, df: pd.DataFrame) -> Dict[str, str]:
        """Automatically detect column mappings from CSV headers"""
        columns = [col.lower().strip() for col in df.columns]
        
        # Common column mapping patterns
        mapping = {}
        
        # Address fields
        for col in columns:
            if 'address' in col and 'property' not in col:
                mapping['address'] = df.columns[columns.index(col)]
            elif col in ['city']:
                mapping['city'] = df.columns[columns.index(col)]
            elif col in ['state', 'st']:
                mapping['state'] = df.columns[columns.index(col)]
            elif col in ['zip', 'zipcode', 'zip_code', 'postal_code']:
                mapping['zip_code'] = df.columns[columns.index(col)]
        
        # Property details
        for col in columns:
            if 'bed' in col or col in ['br', 'bedrooms']:
                mapping['bedrooms'] = df.columns[columns.index(col)]
            elif 'bath' in col or col in ['ba', 'bathrooms']:
                mapping['bathrooms'] = df.columns[columns.index(col)]
            elif 'sqft' in col or 'square' in col or col in ['size', 'sq_ft']:
                mapping['square_footage'] = df.columns[columns.index(col)]
            elif 'lot' in col and 'size' in col:
                mapping['lot_size'] = df.columns[columns.index(col)]
            elif 'year' in col and 'built' in col:
                mapping['year_built'] = df.columns[columns.index(col)]
        
        # Pricing
        for col in columns:
            if 'price' in col and 'per' not in col:
                mapping['listing_price'] = df.columns[columns.index(col)]
            elif 'price per' in col or 'psf' in col:
                mapping['price_per_sqft'] = df.columns[columns.index(col)]
        
        # Location
        for col in columns:
            if col in ['latitude', 'lat']:
                mapping['latitude'] = df.columns[columns.index(col)]
            elif col in ['longitude', 'lng', 'lon']:
                mapping['longitude'] = df.columns[columns.index(col)]
        
        # Other fields
        for col in columns:
            if 'mls' in col:
                mapping['mls_number'] = df.columns[columns.index(col)]
            elif 'property' in col and 'type' in col:
                mapping['property_type'] = df.columns[columns.index(col)]
            elif 'status' in col:
                mapping['status'] = df.columns[columns.index(col)]
            elif 'list' in col and 'date' in col:
                mapping['list_date'] = df.columns[columns.index(col)]
        
        return mapping
    
    def row_to_listing(self, row: pd.Series, column_mapping: Dict[str, str]) -> Optional[MarketListing]:
        """Convert CSV row to MarketListing object"""
        try:
            # Extract required fields
            address = self.clean_string_value(row.get(column_mapping.get('address', ''), ''))
            city = self.clean_string_value(row.get(column_mapping.get('city', ''), ''))
            state = self.clean_string_value(row.get(column_mapping.get('state', ''), ''))
            
            if not address or not city or not state:
                self.stats['errors'].append(f"Missing required fields - Address: {address}, City: {city}, State: {state}")
                return None
            
            # Create listing object
            listing = MarketListing(
                # Required fields
                address=address,
                city=city,
                state=state,
                
                # Optional fields with mapping
                zip_code=self.clean_string_value(row.get(column_mapping.get('zip_code', ''), None)),
                mls_number=self.clean_string_value(row.get(column_mapping.get('mls_number', ''), None)),
                
                # Property characteristics
                bedrooms=self.clean_integer_value(row.get(column_mapping.get('bedrooms', ''), None)),
                bathrooms=self.clean_numeric_value(row.get(column_mapping.get('bathrooms', ''), None)),
                square_footage=self.clean_integer_value(row.get(column_mapping.get('square_footage', ''), None)),
                lot_size=self.clean_numeric_value(row.get(column_mapping.get('lot_size', ''), None)),
                year_built=self.clean_integer_value(row.get(column_mapping.get('year_built', ''), None)),
                
                # Pricing
                listing_price=self.clean_numeric_value(row.get(column_mapping.get('listing_price', ''), None)),
                price_per_sqft=self.clean_numeric_value(row.get(column_mapping.get('price_per_sqft', ''), None)),
                
                # Location
                latitude=self.clean_numeric_value(row.get(column_mapping.get('latitude', ''), None)),
                longitude=self.clean_numeric_value(row.get(column_mapping.get('longitude', ''), None)),
                
                # Dates
                list_date=self.parse_date(row.get(column_mapping.get('list_date', ''), None)),
                
                # Store original row data
                raw_data=row.to_dict()
            )
            
            # Handle enums
            if column_mapping.get('property_type'):
                prop_type_str = self.clean_string_value(row.get(column_mapping['property_type'], ''))
                if prop_type_str:
                    listing.property_type = self.map_property_type(prop_type_str)
            
            if column_mapping.get('status'):
                status_str = self.clean_string_value(row.get(column_mapping['status'], ''))
                if status_str:
                    listing.status = self.map_listing_status(status_str)
            
            return listing
            
        except Exception as e:
            self.stats['errors'].append(f"Error processing row: {str(e)}")
            return None
    
    async def upload_csv(self, csv_path: str, custom_mapping: Optional[Dict[str, str]] = None):
        """Upload CSV file to MongoDB"""
        print(f"Starting CSV upload from: {csv_path}")
        
        try:
            # Read CSV file
            if not os.path.exists(csv_path):
                raise FileNotFoundError(f"CSV file not found: {csv_path}")
            
            df = pd.read_csv(csv_path)
            self.stats['total_rows'] = len(df)
            
            print(f"Loaded CSV with {len(df)} rows and {len(df.columns)} columns")
            print(f"Columns: {list(df.columns)}")
            
            # Detect or use custom column mappings
            if custom_mapping:
                column_mapping = custom_mapping
                print("Using custom column mapping")
            else:
                column_mapping = self.detect_column_mappings(df)
                print("Auto-detected column mapping:")
            
            for key, value in column_mapping.items():
                print(f"  {key} -> {value}")
            
            # Connect to MongoDB
            await connect_to_mongo()
            print("Connected to MongoDB")
            
            # Process rows in batches
            batch_size = 100
            batch = []
            
            for index, row in df.iterrows():
                listing = self.row_to_listing(row, column_mapping)
                
                if listing:
                    batch.append(listing)
                    
                    # Process batch when full
                    if len(batch) >= batch_size:
                        await self.save_batch(batch)
                        batch = []
                else:
                    self.stats['skipped_rows'] += 1
                
                # Progress update every 100 rows
                if (index + 1) % 100 == 0:
                    print(f"Processed {index + 1}/{len(df)} rows...")
            
            # Process remaining batch
            if batch:
                await self.save_batch(batch)
            
            print("Upload completed!")
            
        except Exception as e:
            print(f"Error during upload: {str(e)}")
            self.stats['errors'].append(str(e))
        
        finally:
            await close_mongo_connection()
            self.print_stats()
    
    async def save_batch(self, batch: list):
        """Save a batch of listings to MongoDB"""
        try:
            await MarketListing.insert_many(batch)
            self.stats['successful_uploads'] += len(batch)
            print(f"Saved batch of {len(batch)} listings")
        except Exception as e:
            self.stats['failed_uploads'] += len(batch)
            self.stats['errors'].append(f"Batch save error: {str(e)}")
            print(f"Failed to save batch: {str(e)}")
    
    def print_stats(self):
        """Print upload statistics"""
        print("\n" + "="*50)
        print("UPLOAD STATISTICS")
        print("="*50)
        print(f"Total rows processed: {self.stats['total_rows']}")
        print(f"Successful uploads: {self.stats['successful_uploads']}")
        print(f"Failed uploads: {self.stats['failed_uploads']}")
        print(f"Skipped rows: {self.stats['skipped_rows']}")
        print(f"Success rate: {(self.stats['successful_uploads'] / max(self.stats['total_rows'], 1)) * 100:.1f}%")
        
        if self.stats['errors']:
            print(f"\nErrors ({len(self.stats['errors'])}):")
            for error in self.stats['errors'][:10]:  # Show first 10 errors
                print(f"  - {error}")
            if len(self.stats['errors']) > 10:
                print(f"  ... and {len(self.stats['errors']) - 10} more errors")

async def main():
    """Main function to run CSV upload"""
    if len(sys.argv) < 2:
        print("Usage: python upload_listings_csv.py <path_to_csv> [custom_mapping_json]")
        print("\nExample:")
        print("  python upload_listings_csv.py data/listings.csv")
        print("  python upload_listings_csv.py data/listings.csv custom_mapping.json")
        return
    
    csv_path = sys.argv[1]
    custom_mapping = None
    
    # Load custom mapping if provided
    if len(sys.argv) > 2:
        try:
            with open(sys.argv[2], 'r') as f:
                custom_mapping = json.load(f)
            print(f"Loaded custom mapping from {sys.argv[2]}")
        except Exception as e:
            print(f"Error loading custom mapping: {e}")
            return
    
    uploader = CSVListingUploader()
    await uploader.upload_csv(csv_path, custom_mapping)

if __name__ == "__main__":
    asyncio.run(main())