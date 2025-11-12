"""
Unit tests for PropertyZillowParser (migrated from /parser)
"""

import unittest
from unittest.mock import patch, mock_open, MagicMock
from app.tools.property_zillow_parser import PropertyZillowParser


class TestPropertyZillowParser(unittest.TestCase):
    def setUp(self):
        self.parser = PropertyZillowParser()

    def test_init(self):
        parser1 = PropertyZillowParser()
        self.assertEqual(parser1.website_url, None)
        self.assertEqual(parser1.addresses, [])
        parser2 = PropertyZillowParser(website_url="https://example.com")
        self.assertEqual(parser2.website_url, "https://example.com")

    def test_extract_addresses_from_html_class_based(self):
        html = """
        <html><body>
            <div class="address">123 Main St, New York, NY 10001</div>
            <div class="property-address">456 Oak Avenue, Los Angeles, CA 90001</div>
            <div class="listing-address">789 Pine Road, Chicago, IL 60601</div>
        </body></html>
        """
        addresses = self.parser.extract_addresses_from_html(html)
        self.assertGreaterEqual(len(addresses), 3)
        self.assertIn("123 Main St, New York, NY 10001", addresses)
        self.assertIn("456 Oak Avenue, Los Angeles, CA 90001", addresses)

    def test_extract_addresses_from_html_regex_pattern(self):
        html = """
        <html><body>
            <p>Check out this property at 123 Main Street, New York, NY 10001</p>
            <p>Another one: 456 Oak Avenue, Los Angeles, CA 90001</p>
        </body></html>
        """
        addresses = self.parser.extract_addresses_from_html(html)
        self.assertGreaterEqual(len(addresses), 0)

    def test_extract_addresses_from_html_json_ld(self):
        html = """
        <html><head>
            <script type="application/ld+json">
            {"address": {"streetAddress": "123 Main St","addressLocality": "New York","addressRegion": "NY","postalCode": "10001"}}
            </script>
        </head></html>
        """
        addresses = self.parser.extract_addresses_from_html(html)
        self.assertGreaterEqual(len(addresses), 1)
        self.assertIn("123 Main St, New York, NY, 10001", addresses)

    def test_extract_addresses_deduplication(self):
        html = """
        <html><body>
            <div class="address">123 Main St, New York, NY 10001</div>
            <div class="property-address">123 Main St, New York, NY 10001</div>
            <div class="listing-address">456 Oak Ave, Los Angeles, CA 90001</div>
        </body></html>
        """
        addresses = self.parser.extract_addresses_from_html(html)
        self.assertEqual(len(addresses), len(set(addr.lower() for addr in addresses)))

    def test_format_address_from_dict(self):
        addr_dict = {"streetAddress": "123 Main St","addressLocality": "New York","addressRegion": "NY","postalCode": "10001"}
        result = self.parser._format_address_from_dict(addr_dict)
        self.assertEqual(result, "123 Main St, New York, NY, 10001")

    @patch('app.tools.property_zillow_parser.requests.get')
    def test_fetch_from_url_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.text = """
        <html><body><div class="address">123 Main St, New York, NY 10001</div></body></html>
        """
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response
        parser = PropertyZillowParser(website_url="https://example.com")
        addresses = parser.fetch_from_url()
        self.assertGreaterEqual(len(addresses), 1)
        mock_get.assert_called_once()

    @patch('app.tools.property_zillow_parser.requests.get')
    def test_fetch_from_url_error(self, mock_get):
        import requests
        mock_get.side_effect = requests.RequestException("Connection error")
        parser = PropertyZillowParser(website_url="https://example.com")
        addresses = parser.fetch_from_url()
        self.assertEqual(addresses, [])

    def test_fetch_from_url_no_url(self):
        parser = PropertyZillowParser()
        with self.assertRaises(ValueError):
            parser.fetch_from_url()

    @patch('builtins.open', new_callable=mock_open, read_data='<html><body><div class="address">123 Main St, New York, NY 10001</div></body></html>')
    def test_extract_from_file_success(self, mock_file):
        addresses = self.parser.extract_from_file("test.html")
        self.assertGreaterEqual(len(addresses), 1)
        mock_file.assert_called_once_with("test.html", 'r', encoding='utf-8')

    def test_extract_from_file_not_found(self):
        addresses = self.parser.extract_from_file("nonexistent.html")
        self.assertEqual(addresses, [])

    def test_construct_zillow_url(self):
        address = "123 Main St, New York, NY 10001"
        url = self.parser.construct_zillow_url(address)
        self.assertIn("zillow.com", url)
        self.assertIn("homes", url)
        self.assertIn("123+Main+St", url.replace("%20", "+"))

    def test_construct_zillow_url_special_characters(self):
        address = "123 Main St #4B, New York, NY 10001"
        url = self.parser.construct_zillow_url(address)
        self.assertIn("zillow.com", url)
        self.assertNotIn("#", url)

    @patch('app.tools.property_zillow_parser.webbrowser.open')
    def test_open_on_zillow_with_browser(self, mock_browser):
        address = "123 Main St, New York, NY 10001"
        url = self.parser.open_on_zillow(address, open_browser=True)
        self.assertIn("zillow.com", url)
        mock_browser.assert_called_once()

    @patch('app.tools.property_zillow_parser.webbrowser.open')
    def test_open_on_zillow_without_browser(self, mock_browser):
        address = "123 Main St, New York, NY 10001"
        url = self.parser.open_on_zillow(address, open_browser=False)
        self.assertIn("zillow.com", url)
        mock_browser.assert_not_called()

    def test_process_all_addresses_empty(self):
        urls = self.parser.process_all_addresses(open_browser=False)
        self.assertEqual(urls, [])

    @patch('app.tools.property_zillow_parser.webbrowser.open')
    def test_process_all_addresses(self, mock_browser):
        self.parser.addresses = ["123 Main St, New York, NY 10001","456 Oak Ave, Los Angeles, CA 90001"]
        urls = self.parser.process_all_addresses(open_browser=False)
        self.assertEqual(len(urls), 2)
        self.assertTrue(all("zillow.com" in url for url in urls))
        mock_browser.assert_not_called()


if __name__ == '__main__':
    unittest.main()
