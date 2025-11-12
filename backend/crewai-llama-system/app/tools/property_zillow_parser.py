"""
Property Address Parser for Zillow Integration

This script extracts property addresses from a website and opens them on Zillow.
"""

import re
import urllib.parse
import webbrowser
from typing import List, Optional
import requests
from bs4 import BeautifulSoup


class PropertyZillowParser:
    """Parser to extract property addresses and load them on Zillow."""
    
    def __init__(self, website_url: Optional[str] = None):
        """
        Initialize the parser.
        
        Args:
            website_url: Optional URL of the website to scrape property addresses from
        """
        self.website_url = website_url
        self.addresses = []
    
    def extract_addresses_from_html(self, html_content: str) -> List[str]:
        """
        Extract property addresses from HTML content.
        
        This method looks for common address patterns in the HTML.
        You can customize this based on your website's structure.
        
        Args:
            html_content: HTML content as string
            
        Returns:
            List of extracted addresses
        """
        addresses = []
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Common patterns for addresses
        # Pattern 1: Look for elements with address-like classes/ids
        address_selectors = [
            {'class': 'address'},
            {'class': 'property-address'},
            {'class': 'listing-address'},
            {'id': 'address'},
            {'data-address': True},
        ]
        
        for selector in address_selectors:
            elements = soup.find_all(attrs=selector)
            for elem in elements:
                address_text = elem.get_text(strip=True)
                if self._is_valid_address(address_text):
                    addresses.append(address_text)
        
        # Pattern 2: Look for structured address data (street, city, state, zip)
        # This pattern matches: "123 Main St, City, State 12345"
        address_pattern = r'\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Way|Circle|Cir)[,\s]+[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}'
        
        text_content = soup.get_text()
        matches = re.findall(address_pattern, text_content, re.IGNORECASE)
        addresses.extend(matches)
        
        # Pattern 3: Look for JSON-LD structured data (if your site uses it)
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                import json
                data = json.loads(script.string)
                if isinstance(data, dict) and 'address' in data:
                    addr = data['address']
                    if isinstance(addr, dict):
                        address_str = self._format_address_from_dict(addr)
                        if address_str:
                            addresses.append(address_str)
            except:
                pass
        
        # Remove duplicates while preserving order
        seen = set()
        unique_addresses = []
        for addr in addresses:
            if addr.lower() not in seen:
                seen.add(addr.lower())
                unique_addresses.append(addr)
        
        return unique_addresses
    
    def _is_valid_address(self, text: str) -> bool:
        """Check if text looks like a valid address."""
        # Basic validation: should contain a number and street indicator
        has_number = bool(re.search(r'\d+', text))
        has_street = bool(re.search(r'\b(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Way|Circle|Cir)\b', text, re.IGNORECASE))
        return has_number and (has_street or len(text) > 20)  # Allow longer addresses without street type
    
    def _format_address_from_dict(self, addr_dict: dict) -> Optional[str]:
        """Format address from dictionary structure."""
        parts = []
        if 'streetAddress' in addr_dict:
            parts.append(addr_dict['streetAddress'])
        if 'addressLocality' in addr_dict:
            parts.append(addr_dict['addressLocality'])
        if 'addressRegion' in addr_dict:
            parts.append(addr_dict['addressRegion'])
        if 'postalCode' in addr_dict:
            parts.append(addr_dict['postalCode'])
        return ', '.join(parts) if parts else None
    
    def fetch_from_url(self, url: Optional[str] = None) -> List[str]:
        """
        Fetch HTML from URL and extract addresses.
        
        Args:
            url: URL to fetch from (uses self.website_url if not provided)
            
        Returns:
            List of extracted addresses
        """
        target_url = url or self.website_url
        if not target_url:
            raise ValueError("No URL provided. Set website_url or pass url parameter.")
        
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(target_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            self.addresses = self.extract_addresses_from_html(response.text)
            return self.addresses
        except requests.RequestException as e:
            print(f"Error fetching URL: {e}")
            return []
    
    def extract_from_file(self, file_path: str) -> List[str]:
        """
        Extract addresses from a local HTML file.
        
        Args:
            file_path: Path to HTML file
            
        Returns:
            List of extracted addresses
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            self.addresses = self.extract_addresses_from_html(html_content)
            return self.addresses
        except FileNotFoundError:
            print(f"File not found: {file_path}")
            return []
        except Exception as e:
            print(f"Error reading file: {e}")
            return []
    
    def construct_zillow_url(self, address: str) -> str:
        """
        Construct a Zillow search URL for the given address.
        
        Args:
            address: Property address string
            
        Returns:
            Zillow search URL
        """
        # URL encode the address
        encoded_address = urllib.parse.quote_plus(address)
        # Zillow search URL format
        zillow_url = f"https://www.zillow.com/homes/{encoded_address}_rb/"
        return zillow_url
    
    def open_on_zillow(self, address: str, open_browser: bool = True) -> str:
        """
        Construct Zillow URL and optionally open it in browser.
        
        Args:
            address: Property address string
            open_browser: Whether to open the URL in default browser
            
        Returns:
            Zillow URL
        """
        zillow_url = self.construct_zillow_url(address)
        
        if open_browser:
            webbrowser.open(zillow_url)
            print(f"Opening Zillow for: {address}")
        
        return zillow_url
    
    def process_all_addresses(self, open_browser: bool = True) -> List[str]:
        """
        Process all extracted addresses and open them on Zillow.
        
        Args:
            open_browser: Whether to open URLs in browser
            
        Returns:
            List of Zillow URLs
        """
        if not self.addresses:
            print("No addresses found. Please fetch or extract addresses first.")
            return []
        
        zillow_urls = []
        for address in self.addresses:
            url = self.open_on_zillow(address, open_browser=open_browser)
            zillow_urls.append(url)
        
        return zillow_urls


def main():
    """Example usage of the PropertyZillowParser."""
    import sys
    
    # Example 1: Extract from URL
    if len(sys.argv) > 1:
        website_url = sys.argv[1]
        parser = PropertyZillowParser(website_url=website_url)
        
        print(f"Fetching addresses from: {website_url}")
        addresses = parser.fetch_from_url()
        
        if addresses:
            print(f"\nFound {len(addresses)} address(es):")
            for i, addr in enumerate(addresses, 1):
                print(f"{i}. {addr}")
            
            # Ask user which address to open
            if len(addresses) == 1:
                parser.open_on_zillow(addresses[0])
            else:
                print("\nEnter the number of the address to open on Zillow (or 'all' for all):")
                choice = input().strip()
                if choice.lower() == 'all':
                    parser.process_all_addresses()
                else:
                    try:
                        idx = int(choice) - 1
                        if 0 <= idx < len(addresses):
                            parser.open_on_zillow(addresses[idx])
                    except ValueError:
                        print("Invalid choice")
        else:
            print("No addresses found.")
    else:
        # Example 2: Manual address
        print("Usage examples:")
        print("1. From URL: python property_zillow_parser.py <website_url>")
        print("2. Manual address:")
        
        parser = PropertyZillowParser()
        address = input("Enter property address: ").strip()
        if address:
            parser.open_on_zillow(address)
            print(f"Zillow URL: {parser.construct_zillow_url(address)}")


if __name__ == "__main__":
    main()
