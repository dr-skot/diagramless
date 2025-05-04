#!/usr/bin/env python3
"""
XWordInfo API Server

This script provides a simple Flask API for fetching puzzles from XWordInfo.
"""

import os
import json
from flask import Flask, request, jsonify, send_from_directory, redirect, url_for
from flask_cors import CORS
from fetch_xwordinfo import fetch_puzzle

app = Flask(__name__)

# Enable CORS
allowed_origins = os.environ.get('ALLOWED_DOMAINS', '*')
if allowed_origins != '*':
    allowed_origins = allowed_origins.split(',')
CORS(app, origins=allowed_origins)

# Directory to store cached puzzles
CACHE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/api/puzzle', methods=['GET'])
def get_puzzle():
    """
    Fetch a puzzle for the given date.

    Query parameters:
        date: Date in MM/DD/YYYY format

    Returns:
        JSON response with the puzzle data
    """
    try:
        date = request.args.get('date')
        if not date:
            return jsonify({"error": "Missing date parameter"}), 400

        print(f"Received request for puzzle date: {date}")

        # Check if we already have this puzzle cached
        date_parts = date.split('/')
        if len(date_parts) == 3:
            month, day, year = date_parts
            cache_filename = f"xwordinfo_{year}-{month}-{day}.json"
            cache_path = os.path.join(CACHE_DIR, cache_filename)

            print(f"Looking for cached file: {cache_path}")

            # If the puzzle is already cached, return it
            if os.path.exists(cache_path):
                print(f"Found cached puzzle: {cache_path}")
                with open(cache_path, 'r') as f:
                    puzzle_data = json.load(f)
                    puzzle_data['date'] = date
                return jsonify(puzzle_data)

            # Otherwise, fetch it from XWordInfo
            print(f"Fetching puzzle from XWordInfo for date: {date}")
            try:
                output_file = fetch_puzzle(date, cache_path)

                # Read the saved file and return its contents
                with open(output_file, 'r') as f:
                    puzzle_data = json.load(f)
                    puzzle_data['date'] = date
                return jsonify(puzzle_data)
            except Exception as e:
                print(f"Error fetching puzzle from XWordInfo: {str(e)}")
                return jsonify({"error": f"Failed to fetch puzzle from XWordInfo: {str(e)}"}), 404
        else:
            print(f"Invalid date format: {date}")
            return jsonify({"error": f"Invalid date format: {date}. Please use MM/DD/YYYY format."}), 400
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    host = "0.0.0.0"  # Listen on all interfaces
    debug = os.environ.get("FLASK_ENV") == "development"  # Enable debug mode in development
    app.run(debug=debug, host=host, port=port)
