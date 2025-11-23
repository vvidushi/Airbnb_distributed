#!/bin/bash

echo "🔧 First Time Setup for Airbnb App"
echo "=================================="
echo ""

PROJECT_DIR="<folder>/Airbnb"
cd "$PROJECT_DIR"

# Setup AI agent virtual environment
if [ ! -d "ai-agent/venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    cd ai-agent
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    deactivate
    cd ..
else
    echo "✅ Python virtual environment already exists"
fi

echo ""
echo "✅ First time setup complete!"
echo ""
echo "⚠️  Important: Make sure to configure your API keys in ai-agent/.env:"
echo "   - OPENAI_API_KEY (from https://platform.openai.com/api-keys)"
echo "   - TAVILY_API_KEY (from https://tavily.com/)"
echo ""
echo "🚀 To start the application, run:"
echo "   ./start-all.sh"
echo ""

