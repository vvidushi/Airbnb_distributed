#!/bin/bash
# JMeter Testing Startup Script
# This script starts all required services for JMeter testing

set -e

echo "🚀 Starting JMeter Testing Environment"
echo "======================================"
echo ""

# Step 1: Check Docker
echo "📦 Step 1: Checking Docker..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "   Please start Docker Desktop and run this script again."
    echo ""
    echo "   You can start Docker with: open -a Docker"
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Step 2: Start Databases
echo "🗄️  Step 2: Starting MySQL and MongoDB..."
cd /Users/vidushi/PycharmProjects/Airbnb_distributed
docker-compose up -d mysql mongodb

echo "⏳ Waiting for databases to be ready..."
sleep 10
echo "✅ Databases started"
echo ""

# Step 3: Restart Backend
echo "🔧 Step 3: Restarting backend server..."
pkill -f "node.*server.js" 2>/dev/null || true
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/backend

# Start backend in background
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

sleep 5

# Check if backend is running
if ! lsof -ti:3001 >/dev/null 2>&1; then
    echo "❌ Backend failed to start. Check /tmp/backend.log"
    exit 1
fi
echo "✅ Backend running on port 3001 (PID: $BACKEND_PID)"
echo ""

# Step 4: Test API
echo "🔍 Step 4: Testing API..."
if curl -s http://localhost:3001/ >/dev/null; then
    echo "✅ API is responding"
else
    echo "❌ API is not responding"
    exit 1
fi
echo ""

# Step 5: Ready for JMeter
echo "✅ All services ready!"
echo ""
echo "📊 Now you can run JMeter tests:"
echo ""
echo "Quick test (50 users):"
echo "  cd /Users/vidushi/PycharmProjects/Airbnb_distributed/jmeter"
echo "  ./scripts/quick-test.sh 50"
echo ""
echo "Full test suite (100-500 users):"
echo "  cd /Users/vidushi/PycharmProjects/Airbnb_distributed/jmeter"
echo "  ./scripts/run-load-tests.sh"
echo ""
echo "Backend logs: tail -f /tmp/backend.log"
echo ""

