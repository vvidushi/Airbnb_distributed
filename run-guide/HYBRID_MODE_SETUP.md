# 🚀 Hybrid Mode - Quick Start Guide

## ✅ What You Have Now

**Hybrid AI Agent:**
- 🤖 **Ollama** (Local AI) - Free, offline reasoning
- 🔍 **Tavily** (Web Search) - Real-time local data

**Your Tavily API Key:** Already configured! ✅

## 📋 Quick Setup (4 Steps)

### Step 1: Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Download AI Model
```bash
ollama pull llama2
```
(~4GB download, one-time)

### Step 3: Start Ollama
```bash
ollama serve
```
**Keep this terminal open!**

### Step 4: Start AI Agent
```bash
# In a NEW terminal
cd <folder>/Airbnb/ai-agent

# Activate virtual environment
source venv/bin/activate

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start the service
python app/main.py
```

## ✅ Verify It's Working

Visit: http://localhost:8000/api/ai/test

Should show:
```json
{
  "status": "AI service is running",
  "mode": "Hybrid (Ollama + Tavily)",
  "ai_model": {
    "running": true
  },
  "web_search": {
    "configured": true
  }
}
```

## 🎯 How It Works

```
User asks: "What to do in Los Angeles?"
    ↓
Tavily → Searches web for:
    • Top attractions in LA
    • Best restaurants in LA  
    • Current weather in LA
    • Upcoming events in LA
    ↓
Ollama AI → Reads the data and creates:
    • Personalized recommendations
    • Day-by-day itinerary
    • Practical tips
    ↓
User gets real, current, helpful travel plan!
```

## 💡 Example Request

**From Frontend AI Chat:**

**User:** "I'm visiting New York for 3 days, vegetarian, what should I do?"

**AI Response:**
```
Based on current information:

Day 1:
- Visit Central Park (weather: sunny, 72°F)
- Lunch at Avant Garden (vegan restaurant, highly rated)
- Evening: Broadway show (current: Hamilton tickets available)

Day 2:
- Museum of Modern Art
- Vegetarian food tour in Greenwich Village
- Brooklyn Bridge walk

Day 3:
[continues with real, current data...]
```

## 💰 Cost

| Service | Cost | Limit |
|---------|------|-------|
| Ollama | **FREE** | Unlimited |
| Tavily | **FREE** | 1000 searches/month |
| **Total** | **$0** | More than enough |

## 🎓 Assignment Requirements Met

✅ Uses Tavily for web searches (as required)  
✅ Gets live local data (weather, POIs, events)  
✅ Provides day-by-day plans  
✅ Activity recommendations with real places  
✅ Restaurant suggestions (filtered by diet)  
✅ Natural language understanding  
✅ No expensive API costs (Ollama is free)  

## 🐛 Common Issues

**"Ollama is not running"**
```bash
# Start it in a terminal (keep open)
ollama serve
```

**"Model not found"**
```bash
# Download it first
ollama pull llama2
```

**Slow first response**
- Normal! Model loads into memory (5-10 seconds)
- After that, responses are fast

**Want faster responses?**
```bash
# Use smaller model
ollama pull phi

# Update .env
OLLAMA_MODEL=phi
```

## 📊 Models Comparison

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| llama2 | 4GB | Medium | Good ⭐ |
| phi | 1.6GB | Fast | Okay |
| mistral | 4GB | Fast | Good |

**Recommendation:** Start with `llama2`

## 🎉 You're All Set!

Your AI agent:
- ✅ Costs nothing (free AI + free web search)
- ✅ Gets real local data (Tavily)
- ✅ Follows all requirements
- ✅ Works great for demos

Just make sure:
1. Ollama is running (`ollama serve`)
2. AI agent is running (`python app/main.py`)
3. Then use the frontend chatbot!

---

**Need Help?**
- See: `AI_MODEL_INFO.md` for details
- See: `ai-agent/OLLAMA_SETUP.md` for Ollama guide
- Check: http://localhost:8000/docs for API docs

