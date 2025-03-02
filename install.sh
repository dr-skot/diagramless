#!/bin/bash

echo "Setting up Diagramless application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed. Please install Node.js and try again."
    exit 1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Set up backend virtual environment
echo "Setting up backend virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
deactivate
cd ..

echo "Installation complete!"
echo "To start the application, run: ./start.sh"