# Market Listings CSV Upload

This system allows you to upload your scraped market listings CSV file to MongoDB with comprehensive data validation and mapping.

## 🎯 Quick Start

1. **Place your CSV file** in the `crewai-llama-system` directory
2. **Run the upload script**:
   ```bash
   python upload_listings_csv.py your_listings.csv
   ```

## 📋 CSV Format Requirements

### Required Columns (must have address, city, state):
- **Address**: Street address
- **City**: Property city
- **State**: Property state

### Optional Columns (auto-detected):
- **ZIP Code**: Postal code
- **Bedrooms**: Number of bedrooms
- **Bathrooms**: Number of bathrooms  
- **Sq Ft**: Square footage
- **List Price**: Listing price
- **Property Type**: Single Family, Condo, Townhouse, etc.
- **Status**: Active, Pending, Sold, etc.
- **MLS#**: MLS number
- **List Date**: Date listed
- **Lot Size**: Lot size
- **Year Built**: Year property was built
- **Latitude/Longitude**: GPS coordinates

## 🗂️ MongoDB Schema

Your data will be stored in the `market_listings` collection with this structure:

```json
{
  "_id": "ObjectId",
  "address": "123 Main St",
  "city": "Austin", 
  "state": "TX",
  "zip_code": "78701",
  "bedrooms": 3,
  "bathrooms": 2.5,
  "square_footage": 2000,
  "listing_price": 450000.0,
  "property_type": "single_family",
  "status": "active",
  "mls_number": "MLS001",
  "import_date": "2025-11-09T12:14:10.794Z",
  "data_source": "csv_import",
  "raw_data": { /* original CSV row */ }
}
```

## 🔧 Custom Column Mapping

If your CSV has different column names, create a mapping file:

**mapping.json**:
```json
{
  "address": "Property Address",
  "city": "Property City", 
  "state": "Property State",
  "zip_code": "Zip",
  "bedrooms": "BR",
  "bathrooms": "BA",
  "square_footage": "Living Area",
  "listing_price": "Current Price",
  "property_type": "Type",
  "status": "Listing Status"
}
```

Then run:
```bash
python upload_listings_csv.py your_listings.csv mapping.json
```

## 🚀 Advanced Features

### Auto-Detection
The script automatically detects common column patterns:
- `address`, `street address`, `property address` → address
- `bed`, `beds`, `bedrooms`, `br` → bedrooms  
- `bath`, `baths`, `bathrooms`, `ba` → bathrooms
- `sqft`, `sq ft`, `square feet`, `living area` → square_footage
- `price`, `list price`, `current price` → listing_price

### Data Cleaning
- **Numeric fields**: Removes $, commas, spaces
- **Boolean fields**: Converts yes/no, true/false, 1/0
- **Dates**: Handles multiple date formats
- **Property types**: Maps to standard enums
- **Status**: Maps to standard listing statuses

### Validation
- Requires address, city, and state
- Validates numeric ranges
- Handles missing/empty values gracefully
- Stores original data for reference

## 📊 Upload Statistics

After upload, you'll see comprehensive statistics:
```
==================================================
UPLOAD STATISTICS  
==================================================
Total rows processed: 1000
Successful uploads: 995
Failed uploads: 5
Skipped rows: 0
Success rate: 99.5%

Errors (5):
  - Missing required fields - Address: , City: Austin, State: TX
  - Invalid price value: "Call for Price"
  ...
```

## 🗃️ Database Integration

The uploaded listings integrate with your real estate agents system:

1. **Property Insights Agent** can query listings for comps analysis
2. **Report Generation Agent** can reference local market data
3. **API endpoints** can serve listing data to frontend
4. **Analytics** can track market trends over time

## 🔍 Sample Data

A sample CSV (`sample_listings.csv`) is created during testing with this structure:

| Street Address | City | State | ZIP Code | Beds | Baths | Sq Ft | List Price | Property Type | Status |
|---|---|---|---|---|---|---|---|---|---|
| 123 Main St | Austin | TX | 78701 | 3 | 2.5 | 2000 | 450000 | Single Family | Active |

## 🛠️ Troubleshooting

### Common Issues:

**Missing required fields**:
- Ensure CSV has address, city, and state columns
- Check for empty rows or missing data

**Column not detected**:
- Use custom mapping file
- Check column name spelling/spacing

**Date parsing errors**:
- Use standard date formats: YYYY-MM-DD, MM/DD/YYYY
- Ensure dates are in Date columns, not mixed with text

**Price formatting**:
- Remove currency symbols in spreadsheet before export
- Or let the script handle common formats ($500,000)

### Getting Help:

1. **Test first**: Run `python test_csv_upload_simple.py` 
2. **Check logs**: Script shows detailed error messages
3. **Validate CSV**: Open in spreadsheet software first
4. **Small batch**: Test with 10-20 rows first

## 📈 Next Steps

After uploading your listings:

1. **Start the API server**: `python start_server.py`
2. **Test property insights**: Query specific properties
3. **Generate reports**: Use the report generation agent
4. **Frontend integration**: Listings available via API
5. **Analytics**: Track market trends and patterns

Your market listings are now ready to power intelligent real estate analysis! 🏠📊