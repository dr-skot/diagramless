# XWordInfo Puzzle Fetcher

This directory contains scripts for fetching puzzles from XWordInfo.

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Command-line Script

To fetch a puzzle for a specific date:

```bash
python fetch_xwordinfo.py MM/DD/YYYY [output_file.json]
```

Example:
```bash
python fetch_xwordinfo.py 03/05/1984
```

This will save the puzzle to a file named `xwordinfo_YYYY-MM-DD.json` in the current directory.

### API Server

To run the API server:

```bash
python xwordinfo_api.py
```

The server will start on http://localhost:5000 and provide the following endpoints:

- `GET /api/puzzle/{date}` - Fetch a puzzle for the given date (MM/DD/YYYY format)
- `GET /api/puzzles` - List all cached puzzles
- `GET /api/puzzle/file/{filename}` - Get a puzzle by filename

## Notes

- XWordInfo may require authentication to access their API. If you're a subscriber, you might need to log in through their website first and then run these scripts in the same browser session.
- The scripts decode HTML entities in the clues to ensure they display correctly in the application.
