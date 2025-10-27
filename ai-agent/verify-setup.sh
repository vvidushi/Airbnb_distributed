#!/bin/bash

echo "🔍 Verifying AI Agent Setup..."
echo ""

# Check dependencies
echo "📦 Dependencies:"
pip list | grep -E "(tavily|ollama|fastapi|langchain)" | sort

echo ""
echo "🔧 Configuration check:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    grep -q "TAVILY_API_KEY" .env && echo "✅ TAVILY_API_KEY configured" || echo "⚠️ TAVILY_API_KEY not set"
    grep -q "OLLAMA_MODEL" .env && echo "✅ Ollama model configured" || echo "⚠️ Ollama model not set"
else
    echo "⚠️ .env file not found (create from env.example)"
fi

echo ""
echo "🚀 Status:"
python -c "import fastapi" 2>/dev/null && echo "✅ FastAPI installed" || echo "❌ FastAPI missing"
python -c "import langchain_ollama" 2>/dev/null && echo "✅ Langchain Ollama installed" || echo "❌ Langchain Ollama missing"
python -c "from tavily import TavilyClient" 2>/dev/null && echo "✅ Tavily installed" || echo "❌ Tavily missing"

echo ""
echo "📝 Next steps:"
echo "1. Get Tavily API key from https://tavily.com/"
echo "2. Add it to .env: TAVILY_API_KEY=your_key_here"
echo "3. Start Ollama: ollama serve &"
echo "4. Run agent: python simple_main.py"

