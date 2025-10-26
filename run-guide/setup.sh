#!/bin/bash

# Airbnb Prototype Setup Script
# This script helps set up the development environment

echo "🚀 Setting up Airbnb Prototype..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi
echo "✅ Python3 found: $(python3 --version)"

# Check for MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found. Make sure MySQL is installed."
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend setup
echo "Setting up Backend..."
cd backend
if [ ! -f .env ]; then
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your MySQL credentials"
fi
npm install
cd ..
echo "✅ Backend setup complete"
echo ""

# Frontend setup
echo "Setting up Frontend..."
cd frontend
if [ ! -f .env ]; then
    cp env.example .env
fi
npm install
cd ..
echo "✅ Frontend setup complete"
echo ""

# AI Agent setup
echo "Setting up AI Agent..."
cd ai-agent
if [ ! -d venv ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

source venv/bin/activate
pip install -r requirements.txt

if [ ! -f .env ]; then
    cp env.example .env
    echo "⚠️  Please edit ai-agent/.env with your API keys"
fi
deactivate
cd ..
echo "✅ AI Agent setup complete"
echo ""

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your MySQL credentials"
echo "2. Edit ai-agent/.env with your OpenAI and Tavily API keys"
echo "3. Set up the database:"
echo "   mysql -u root -p airbnb_db < database/schema.sql"
echo "   mysql -u root -p airbnb_db < database/seed.sql"
echo "4. Run the start script: ./start.sh"
echo ""

