#!/bin/bash

# Script to start the frontend server
echo "Starting LocalForge frontend server..."
cd apps/frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the frontend server
echo "Starting frontend server on http://localhost:5173"
exec npm run dev