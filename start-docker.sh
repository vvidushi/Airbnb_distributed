#!/bin/bash

# Script to start Docker Desktop and verify it's running

echo "🐳 Starting Docker Desktop..."
echo ""

# Check if Docker Desktop is installed
if [ ! -d "/Applications/Docker.app" ]; then
    echo "❌ Docker Desktop is not installed!"
    echo ""
    echo "Please install Docker Desktop from:"
    echo "https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Start Docker Desktop
echo "📂 Opening Docker Desktop..."
open -a Docker

echo ""
echo "⏳ Waiting for Docker to start (this may take 30-60 seconds)..."
echo ""

# Wait for Docker daemon to be ready
max_attempts=60
attempt=0

while ! docker info >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -gt $max_attempts ]; then
        echo "❌ Docker failed to start after 60 seconds"
        echo "Please check:"
        echo "  1. Docker Desktop is installed"
        echo "  2. You see the whale icon in your menu bar"
        echo "  3. Try restarting your computer"
        exit 1
    fi
    
    # Show progress
    if [ $((attempt % 10)) -eq 0 ]; then
        echo "Still waiting... ($attempt seconds)"
    fi
    
    sleep 1
done

echo ""
echo "✅ Docker Desktop is running!"
echo ""

# Verify Docker is working
echo "🔍 Verifying Docker installation..."
docker version
echo ""
docker-compose version
echo ""

echo "=========================================="
echo "✅ Docker is ready!"
echo "=========================================="
echo ""
echo "You can now run:"
echo "  docker-compose up -d"
echo ""

