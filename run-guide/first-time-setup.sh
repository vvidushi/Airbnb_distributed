#!/bin/bash

echo "🔧 First Time Setup for Airbnb App"
echo "=================================="
echo ""

PROJECT_DIR="/Users/gouravdhama/Desktop/Airbnb"
cd "$PROJECT_DIR"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "📦 Installing Ollama..."
    brew install ollama
else
    echo "✅ Ollama already installed"
fi

# Check if llama2 model is downloaded
if ! ollama list | grep -q llama2; then
    echo "📥 Downloading llama2 model (this may take a few minutes)..."
    ollama pull llama2
else
    echo "✅ llama2 model already downloaded"
fi

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
echo "🚀 To start the application, run:"
echo "   ./start-all.sh"
echo ""

