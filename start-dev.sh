#!/bin/bash

# Script to start both frontend and backend servers
echo "Starting LocalForge development servers..."

# Start backend in background
echo "Starting backend server..."
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

# Start the backend server in background
uv run fastapi dev &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend server..."
cd ../frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the frontend server (this will stay in foreground)
echo "Frontend server starting on http://localhost:5173"
echo "Backend server running on http://localhost:8000"
npm run dev

# Clean up background process on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT