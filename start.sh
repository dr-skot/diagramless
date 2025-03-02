#!/bin/bash

# Set environment variables for local development
export REACT_APP_BACKEND_HOST="http://localhost:5001"
export ALLOWED_DOMAINS="*"
export FLASK_ENV="development"

# Start the API server
echo "Starting API server on port 5001..."
cd backend
source venv/bin/activate
python3 xwordinfo_api.py &
API_PID=$!

# Start the frontend server
echo "Starting frontend server on port 8080..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Function to handle script termination
function cleanup {
  echo "Shutting down servers..."
  kill $API_PID
  kill $FRONTEND_PID
  exit
}

# Register the cleanup function for when the script is terminated
trap cleanup SIGINT SIGTERM

# Wait for user to terminate
echo "Servers are running. Press Ctrl+C to stop."
wait
