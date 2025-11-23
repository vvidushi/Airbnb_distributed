#!/bin/bash

echo "🔍 Verifying AI Agent Setup..."
echo ""

# Check dependencies
echo "📦 Dependencies:"
pip list | grep -E "(openai|tavily|fastapi|langchain)" | sort

echo ""
echo "🔧 Configuration check:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    grep -q "OPENAI_API_KEY" .env && echo "✅ OPENAI_API_KEY configured" || echo "⚠️ OPENAI_API_KEY not set"
    grep -q "TAVILY_API_KEY" .env && echo "✅ TAVILY_API_KEY configured" || echo "⚠️ TAVILY_API_KEY not set"
else
    echo "⚠️ .env file not found (create from env.example)"
fi

echo ""
echo "🚀 Status:"
python -c "import fastapi" 2>/dev/null && echo "✅ FastAPI installed" || echo "❌ FastAPI missing"
python -c "import openai" 2>/dev/null && echo "✅ OpenAI installed" || echo "❌ OpenAI missing"
python -c "from tavily import TavilyClient" 2>/dev/null && echo "✅ Tavily installed" || echo "❌ Tavily missing"
python -c "import langchain" 2>/dev/null && echo "✅ Langchain installed" || echo "❌ Langchain missing"

echo ""
echo "📝 Next steps:"
echo "1. Get OpenAI API key from https://platform.openai.com/api-keys"
echo "2. Get Tavily API key from https://tavily.com/"
echo "3. Add them to .env file"
echo "4. Run agent: python simple_main.py"
