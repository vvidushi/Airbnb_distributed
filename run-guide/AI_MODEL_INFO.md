# AI Model - Hybrid Mode (Ollama + Tavily)

## ✅ Best of Both Worlds!

The AI agent now uses a **hybrid approach**:

1. **Ollama** (Local AI) - For reasoning and generating responses
2. **Tavily** (Web Search) - For real-time local data

## 🎯 Why Hybrid?

**Ollama (Local AI):**
- ✅ **100% FREE** - No AI API costs
- ✅ **Runs OFFLINE** - No internet needed for AI
- ✅ **Simple & Fast** - Not overly complex
- ✅ **Private** - AI reasoning happens locally

**Tavily (Web Search):**
- ✅ **Real local data** - Current weather, events, POIs
- ✅ **Live information** - Up-to-date recommendations
- ✅ **Follows requirements** - Assignment specifically asks for it
- ✅ **Free tier available** - Generous limits

## 🔄 How It Works

```
User Query
    ↓
Tavily searches web → Gets real data (weather, events, restaurants)
    ↓
Ollama AI reads data → Generates personalized response
    ↓
User gets smart answer with real local information!
```

**Example:**
- User asks: "What to do in Los Angeles?"
- Tavily fetches: Current events, top attractions, weather
- Ollama AI: Combines data into helpful recommendations
- Result: Real, current, useful travel plan!

## 🚀 Setup

### 1. Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from: https://ollama.com/download
```

### 2. Download AI Model
```bash
ollama pull llama2
```

### 3. Start Ollama Server
```bash
ollama serve
```
Keep this running!

### 4. Configure AI Agent

Your `.env` is already configured with:
```env
# Ollama (Free, Local AI)
OLLAMA_MODEL=llama2
OLLAMA_BASE_URL=http://localhost:11434

# Tavily (Real Web Data)
TAVILY_API_KEY=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
```

### 5. Install Dependencies
```bash
cd ai-agent
source venv/bin/activate
pip install -r requirements.txt
```

### 6. Start AI Agent
```bash
python app/main.py
```

## ✅ Test It

Visit: http://localhost:8000/api/ai/test

Should show:
```json
{
  "status": "AI service is running",
  "mode": "Hybrid (Ollama + Tavily)",
  "ai_model": {
    "type": "Ollama (Local/Offline)",
    "running": true
  },
  "web_search": {
    "type": "Tavily",
    "configured": true,
    "status": "Provides live local data"
  }
}
```

## 💰 Cost Breakdown

| Component | Cost | Usage |
|-----------|------|-------|
| **Ollama** | $0 | Unlimited |
| **Tavily** | Free tier | 1000 searches/month |
| **Total** | **FREE** | For normal usage |

**vs OpenAI GPT-3.5:**
- Would cost ~$0.002 per request
- 1000 requests = ~$2
- **Hybrid saves you money!**

## 📊 What You Get

**Live Data from Tavily:**
- ✅ Current weather forecasts
- ✅ Upcoming local events
- ✅ Popular attractions & POIs
- ✅ Restaurant recommendations
- ✅ Real-time information

**Smart Responses from Ollama:**
- ✅ Personalized travel plans
- ✅ Day-by-day itineraries
- ✅ Packing suggestions
- ✅ Practical travel tips
- ✅ Dietary considerations

## 🎓 Meets Assignment Requirements

✅ **"Use Tavily for web searches"** - Using Tavily API  
✅ **Live local context** - Weather, POIs, events  
✅ **Day-by-day plans** - AI generates these  
✅ **Activity cards** - Real places from web  
✅ **Restaurant recs** - Live data + filtering  
✅ **NLU support** - Ollama understands queries  

## 💡 Example Usage

**User:** "I'm going to San Francisco next week, what should I pack?"

**Behind the scenes:**
1. Tavily searches: "weather forecast San Francisco"
2. Gets: "Sunny, 65°F, slight breeze"
3. Ollama AI combines with query
4. Returns: Personalized packing list with weather-appropriate items

## 🐛 Troubleshooting

**"Ollama is not running"**
```bash
ollama serve
```

**"Web search not working"**
- Check Tavily API key in `.env`
- Verify internet connection
- Check Tavily dashboard for quota

**Slow responses**
- First query loads model (slower)
- Subsequent queries are fast
- Use smaller model: `ollama pull phi`

## 🎯 Perfect Setup!

- ✅ **No expensive AI API costs** (Ollama is free)
- ✅ **Real local data** (Tavily provides live info)
- ✅ **Follows assignment** (Uses Tavily as required)
- ✅ **Simple AI** (Llama 2, not "too smart")
- ✅ **Best of both worlds**

## 📚 Resources

- Ollama: https://ollama.com/
- Tavily: https://tavily.com/
- See: `ai-agent/OLLAMA_SETUP.md`

---

**🎉 Ready to use!**

Your AI agent now combines:
- Free local AI (Ollama)
- Real web data (Tavily)
- Meets all requirements
- Costs nothing for normal usage

Perfect for your lab assignment! 🚀
