#!/bin/bash

# Script to start the backend server
echo "Starting LocalForge backend server..."
cd apps/backend

# Check if virtual environment exists, if not create it
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies if not already installed
if [ ! -f "uv.lock" ]; then
    echo "Installing dependencies..."
    uv sync --group dev
fi

# Start the backend server
echo "Starting backend server on http://localhost:8000"
exec uv run fastapi dev