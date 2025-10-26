#!/bin/bash

# Airbnb Prototype Start Script
# This script starts all three services

echo "🚀 Starting Airbnb Prototype..."
echo ""

# Function to kill all background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start Backend
echo "Starting Backend (http://localhost:5000)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend (http://localhost:3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Start AI Agent
echo "Starting AI Agent (http://localhost:8000)..."
cd ai-agent
source venv/bin/activate
python app/main.py &
AI_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📱 Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000/api-docs"
echo "   AI Agent:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait

