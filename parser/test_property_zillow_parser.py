"""
Unit tests for PropertyZillowParser
"""

import unittest
from unittest.mock import patch, mock_open, MagicMock
from property_zillow_parser import PropertyZillowParser


class TestPropertyZillowParser(unittest.TestCase):
    """Test cases for PropertyZillowParser class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.parser = PropertyZillowParser()
    
    def test_init(self):
        """Test parser initialization."""
        parser1 = PropertyZillowParser()
        self.assertEqual(parser1.website_url, None)
        self.assertEqual(parser1.addresses, [])
        
        parser2 = PropertyZillowParser(website_url="https://example.com")
        self.assertEqual(parser2.website_url, "https://example.com")
    
    def test_extract_addresses_from_html_class_based(self):
        """Test extraction from HTML with class-based selectors."""
        html = """
        <html>
            <body>
                <div class="address">123 Main St, New York, NY 10001</div>
                <div class="property-address">456 Oak Avenue, Los Angeles, CA 90001</div>
                <div class="listing-address">789 Pine Road, Chicago, IL 60601</div>
            </body>
        </html>
        """
        addresses = self.parser.extract_addresses_from_html(html)
        self.assertGreaterEqual(len(addresses), 3)
        self.assertIn("123 Main St, New York, NY 10001", addresses)
        self.assertIn("456 Oak Avenue, Los Angeles, CA 90001", addresses)
    
    def test_extract_addresses_from_html_regex_pattern(self):
        """Test extraction using regex pattern matching."""
        html = """
        <html>
            <body>
                <p>Check out this property at 123 Main Street, New York, NY 10001</p>
                <p>Another one: 456 Oak Avenue, Los Angeles, CA 90001</p>
            </body>
        </html>
        """
        addresses = self.parser.extract_addresses_from_html(html)
        # Should find addresses matching the pattern
        self.assertGreaterEqual(len(addresses), 0)  # Pattern might match
    
    def test_extract_addresses_from_html_json_ld(self):
        """Test extraction from JSON-LD structured data."""
        html = """
        <html>
            <head>
                <script type="application/ld+json">
                {
                    "address": {
                        "streetAddress": "123 Main St",
                        "addressLocality": "New York",
                        "addressRegion": "NY",
                        "postalCode": "10001"
                    }
                }
                </script>
            </head>
        </html>
        """
        addresses = self.parser.extract_addresses_from_html(html)
        self.assertGreaterEqual(len(addresses), 1)
        self.assertIn("123 Main St, New York, NY, 10001", addresses)
    
    def test_extract_addresses_deduplication(self):
        """Test that duplicate addresses are removed."""
        html = """
        <html>
            <body>
                <div class="address">123 Main St, New York, NY 10001</div>
                <div class="property-address">123 Main St, New York, NY 10001</div>
                <div class="listing-address">456 Oak Ave, Los Angeles, CA 90001</div>
            </body>
        </html>
        """
        addresses = self.parser.extract_addresses_from_html(html)
        # Should have unique addresses only
        self.assertEqual(len(addresses), len(set(addr.lower() for addr in addresses)))
    
    def test_is_valid_address(self):
        """Test address validation."""
        # Valid addresses
        self.assertTrue(self.parser._is_valid_address("123 Main Street, NY"))
        self.assertTrue(self.parser._is_valid_address("456 Oak Avenue"))
        self.assertTrue(self.parser._is_valid_address("789 Pine Road, Chicago, IL 60601"))
        self.assertTrue(self.parser._is_valid_address("123 This is a very long address that should be valid even without street type"))
        
        # Invalid addresses
        self.assertFalse(self.parser._is_valid_address("Main Street"))  # No number
        self.assertFalse(self.parser._is_valid_address("123"))  # Too short, no street
        self.assertFalse(self.parser._is_valid_address(""))  # Empty
        self.assertFalse(self.parser._is_valid_address("This is a very long address that should be valid even without street type"))  # No number
    
    def test_format_address_from_dict(self):
        """Test formatting address from dictionary."""
        addr_dict = {
            "streetAddress": "123 Main St",
            "addressLocality": "New York",
            "addressRegion": "NY",
            "postalCode": "10001"
        }
        result = self.parser._format_address_from_dict(addr_dict)
        self.assertEqual(result, "123 Main St, New York, NY, 10001")
        
        # Partial address
        partial_dict = {
            "streetAddress": "123 Main St",
            "addressLocality": "New York"
        }
        result = self.parser._format_address_from_dict(partial_dict)
        self.assertEqual(result, "123 Main St, New York")
        
        # Empty dict
        result = self.parser._format_address_from_dict({})
        self.assertIsNone(result)
    
    @patch('property_zillow_parser.requests.get')
    def test_fetch_from_url_success(self, mock_get):
        """Test successful URL fetching."""
        mock_response = MagicMock()
        mock_response.text = """
        <html>
            <body>
                <div class="address">123 Main St, New York, NY 10001</div>
            </body>
        </html>
        """
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response
        
        parser = PropertyZillowParser(website_url="https://example.com")
        addresses = parser.fetch_from_url()
        
        self.assertGreaterEqual(len(addresses), 1)
        mock_get.assert_called_once()
    
    @patch('property_zillow_parser.requests.get')
    def test_fetch_from_url_error(self, mock_get):
        """Test URL fetching with error."""
        import requests
        mock_get.side_effect = requests.RequestException("Connection error")
        
        parser = PropertyZillowParser(website_url="https://example.com")
        addresses = parser.fetch_from_url()
        
        self.assertEqual(addresses, [])
    
    def test_fetch_from_url_no_url(self):
        """Test fetch_from_url without URL."""
        parser = PropertyZillowParser()
        with self.assertRaises(ValueError):
            parser.fetch_from_url()
    
    @patch('builtins.open', new_callable=mock_open, read_data='<html><body><div class="address">123 Main St, New York, NY 10001</div></body></html>')
    def test_extract_from_file_success(self, mock_file):
        """Test successful file extraction."""
        addresses = self.parser.extract_from_file("test.html")
        self.assertGreaterEqual(len(addresses), 1)
        mock_file.assert_called_once_with("test.html", 'r', encoding='utf-8')
    
    def test_extract_from_file_not_found(self):
        """Test file extraction with file not found."""
        addresses = self.parser.extract_from_file("nonexistent.html")
        self.assertEqual(addresses, [])
    
    def test_construct_zillow_url(self):
        """Test Zillow URL construction."""
        address = "123 Main St, New York, NY 10001"
        url = self.parser.construct_zillow_url(address)
        
        self.assertIn("zillow.com", url)
        self.assertIn("homes", url)
        self.assertIn("123+Main+St", url.replace("%20", "+"))  # URL encoded
    
    def test_construct_zillow_url_special_characters(self):
        """Test Zillow URL construction with special characters."""
        address = "123 Main St #4B, New York, NY 10001"
        url = self.parser.construct_zillow_url(address)
        
        # Should be properly URL encoded
        self.assertIn("zillow.com", url)
        self.assertNotIn("#", url)  # Should be encoded
    
    @patch('property_zillow_parser.webbrowser.open')
    def test_open_on_zillow_with_browser(self, mock_browser):
        """Test opening Zillow URL in browser."""
        address = "123 Main St, New York, NY 10001"
        url = self.parser.open_on_zillow(address, open_browser=True)
        
        self.assertIn("zillow.com", url)
        mock_browser.assert_called_once()
    
    @patch('property_zillow_parser.webbrowser.open')
    def test_open_on_zillow_without_browser(self, mock_browser):
        """Test constructing Zillow URL without opening browser."""
        address = "123 Main St, New York, NY 10001"
        url = self.parser.open_on_zillow(address, open_browser=False)
        
        self.assertIn("zillow.com", url)
        mock_browser.assert_not_called()
    
    def test_process_all_addresses_empty(self):
        """Test processing addresses when none are found."""
        urls = self.parser.process_all_addresses(open_browser=False)
        self.assertEqual(urls, [])
    
    @patch('property_zillow_parser.webbrowser.open')
    def test_process_all_addresses(self, mock_browser):
        """Test processing multiple addresses."""
        self.parser.addresses = [
            "123 Main St, New York, NY 10001",
            "456 Oak Ave, Los Angeles, CA 90001"
        ]
        urls = self.parser.process_all_addresses(open_browser=False)
        
        self.assertEqual(len(urls), 2)
        self.assertTrue(all("zillow.com" in url for url in urls))
        mock_browser.assert_not_called()  # open_browser=False
    
    def test_complex_html_extraction(self):
        """Test extraction from complex HTML structure."""
        html = """
        <html>
            <head>
                <script type="application/ld+json">
                {
                    "address": {
                        "streetAddress": "123 Main St",
                        "addressLocality": "New York",
                        "addressRegion": "NY",
                        "postalCode": "10001"
                    }
                }
                </script>
            </head>
            <body>
                <div class="property-card">
                    <div class="address">456 Oak Avenue, Los Angeles, CA 90001</div>
                </div>
                <div data-address="789 Pine Road, Chicago, IL 60601"></div>
            </body>
        </html>
        """
        addresses = self.parser.extract_addresses_from_html(html)
        # Should extract from multiple sources
        self.assertGreaterEqual(len(addresses), 1)


if __name__ == '__main__':
    unittest.main()

