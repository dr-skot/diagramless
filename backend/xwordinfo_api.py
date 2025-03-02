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
CORS(app)  # Enable CORS for all routes

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
                return jsonify(puzzle_data)
            
            # Otherwise, fetch it from XWordInfo
            print(f"Fetching puzzle from XWordInfo for date: {date}")
            try:
                output_file = fetch_puzzle(date, cache_path)
                
                # Read the saved file and return its contents
                with open(output_file, 'r') as f:
                    puzzle_data = json.load(f)
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

# Keep the old route for backward compatibility, but redirect to the new one
@app.route('/api/puzzle/<path:date>', methods=['GET'])
def get_puzzle_legacy(date):
    """Legacy route that redirects to the new query parameter based route"""
    return redirect(url_for('get_puzzle', date=date))

@app.route('/api/puzzles', methods=['GET'])
def list_puzzles():
    """
    List all cached puzzles.
    
    Returns:
        JSON response with a list of available puzzles
    """
    try:
        puzzles = []
        for filename in os.listdir(CACHE_DIR):
            if filename.startswith('xwordinfo_') and filename.endswith('.json'):
                date_str = filename[10:-5]  # Extract date from filename
                year, month, day = date_str.split('-')
                puzzles.append({
                    "date": f"{month}/{day}/{year}",
                    "filename": filename
                })
        return jsonify({"puzzles": puzzles})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/puzzle/file', methods=['GET'])
def get_puzzle_by_filename():
    """
    Fetch a puzzle by filename.
    
    Query parameters:
        filename: Name of the puzzle file
    
    Returns:
        JSON response with the puzzle data
    """
    try:
        filename = request.args.get('filename')
        if not filename:
            return jsonify({"error": "Missing filename parameter"}), 400
            
        print(f"Received request for puzzle file: {filename}")
        
        # Check if the file exists
        file_path = os.path.join(CACHE_DIR, filename)
        if os.path.exists(file_path):
            print(f"Found puzzle file: {file_path}")
            with open(file_path, 'r') as f:
                puzzle_data = json.load(f)
            return jsonify(puzzle_data)
        else:
            print(f"Puzzle file not found: {file_path}")
            return jsonify({"error": f"Puzzle file not found: {filename}"}), 404
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Keep the old route for backward compatibility, but redirect to the new one
@app.route('/api/puzzle/file/<path:filename>', methods=['GET'])
def get_puzzle_by_filename_legacy(filename):
    """Legacy route that redirects to the new query parameter based route"""
    return redirect(url_for('get_puzzle_by_filename', filename=filename))

if __name__ == '__main__':
    app.run(debug=True, port=5001)
