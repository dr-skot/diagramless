# XWordInfo Puzzle Fetcher

This script fetches puzzle data from XWordInfo for a given date and saves it as a JSON file. It's designed to work around the CORS limitations when trying to fetch puzzles directly from the browser.

## Requirements

- Python 3.6 or higher
- `requests` library (install with `pip install requests`)

## Usage

```bash
# Basic usage (outputs to xwordinfo_YYYY-MM-DD.json)
python fetch_xwordinfo.py MM/DD/YYYY

# Specify an output file
python fetch_xwordinfo.py MM/DD/YYYY -o output_file.json
```

## Example

```bash
# Fetch puzzle for March 1, 2025
python fetch_xwordinfo.py 03/01/2025

# Fetch puzzle for January 15, 2024 and save to a specific file
python fetch_xwordinfo.py 01/15/2024 -o nyt_puzzle_jan15.json
```

## Notes

- XWordInfo may require authentication to access their API. This script attempts to mimic a browser request, but it may not work if XWordInfo requires you to be logged in.
- If you're a subscriber to XWordInfo, you might need to log in through their website first and then run this script in the same browser session.
- The fetched JSON file can be imported into the Diagramless app using the "Import from XWordInfo" feature.
