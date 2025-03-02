#!/usr/bin/env python3
"""
XWordInfo Puzzle Fetcher

This script fetches puzzle data from XWordInfo for a given date and saves it as a JSON file.
Usage: python fetch_xwordinfo.py MM/DD/YYYY [output_file.json]
"""

import sys
import os
import json
import argparse
import requests
from datetime import datetime

def fetch_puzzle(date_str, output_file=None):
    """
    Fetch a puzzle from XWordInfo for the given date and save it to a file.
    
    Args:
        date_str: Date in MM/DD/YYYY format
        output_file: Optional output file path. If not provided, will use date_str.json
    
    Returns:
        Path to the saved JSON file
    """
    # Format the date for the URL
    try:
        print(f"Parsing date: {date_str}")
        date_obj = datetime.strptime(date_str, "%m/%d/%Y")
        formatted_date = date_str  # XWordInfo uses MM/DD/YYYY format
    except ValueError as e:
        print(f"Error parsing date: {e}")
        raise ValueError(f"Invalid date format: {date_str}. Please use MM/DD/YYYY format.")
    
    # Set up the URL and headers to mimic a browser request
    url = f"https://www.xwordinfo.com/JSON/Data.ashx?date={formatted_date}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://www.xwordinfo.com/",
    }
    
    print(f"Fetching puzzle for {date_str} from URL: {url}")
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Response status code: {response.status_code}")
        
        # Check if the response is valid
        if response.status_code != 200:
            print(f"Error response: {response.text}")
            raise ValueError(f"Failed to fetch puzzle: HTTP {response.status_code} - {response.reason}")
            
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        
        # Try to parse the response as JSON
        try:
            puzzle_data = response.json()
            
            # Check if the response contains an error message
            if 'error' in puzzle_data:
                print(f"XWordInfo API error: {puzzle_data['error']}")
                raise ValueError(f"XWordInfo API error: {puzzle_data['error']}")
            
            # We no longer need to decode HTML entities in clues
            # The browser will handle this with dangerouslySetInnerHTML
            
        except json.JSONDecodeError:
            print(f"Error: Received non-JSON response from XWordInfo.")
            print("This might indicate that authentication is required or the puzzle is not available.")
            print("Response content:")
            print(response.text[:500] + "..." if len(response.text) > 500 else response.text)
            sys.exit(1)
        
        # Determine output file name if not provided
        if not output_file:
            date_filename = date_obj.strftime("%Y-%m-%d")
            output_file = f"xwordinfo_{date_filename}.json"
        
        # Save the puzzle data to a file
        with open(output_file, 'w') as f:
            json.dump(puzzle_data, f, indent=2)
        
        print(f"Successfully saved puzzle data to {output_file}")
        return output_file
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching puzzle: {e}")
        print("\nNote: XWordInfo may require authentication to access their API.")
        print("If you're a subscriber, you might need to log in through their website first")
        print("and then run this script in the same browser session.")
        sys.exit(1)

def decode_clue(clue):
    """
    This function is kept for backward compatibility but no longer decodes HTML entities.
    The browser will now handle HTML entities with dangerouslySetInnerHTML.
    
    Args:
        clue: Clue string possibly containing HTML entities
    
    Returns:
        The original clue string unchanged
    """
    # No longer decode HTML entities
    return clue

def main():
    parser = argparse.ArgumentParser(description="Fetch puzzle data from XWordInfo for a given date")
    parser.add_argument("date", help="Date in MM/DD/YYYY format")
    parser.add_argument("-o", "--output", help="Output JSON file path")
    
    args = parser.parse_args()
    
    fetch_puzzle(args.date, args.output)

if __name__ == "__main__":
    main()
