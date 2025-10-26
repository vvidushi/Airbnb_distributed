# 🚀 Quick Start Guide

## ⚡ Automatic Start (Recommended)

Just run this one command:

```bash
cd <folder>/Airbnb
./start-all.sh
```

This will automatically open **4 Terminal tabs** with all services running!

---

## 📱 Manual Start (Alternative)

If the automatic script doesn't work, open 4 separate terminals:

### Terminal 1: Backend
```bash
cd <folder>/Airbnb/backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd <folder>/Airbnb/frontend
npm start
```

### Terminal 3: Ollama
```bash
ollama serve
```

### Terminal 4: AI Agent
```bash
cd <folder>/Airbnb/ai-agent
source venv/bin/activate
python app/main.py
```

---

## ✅ Access the App

Once all services are running:

**Frontend:** http://localhost:3000

**Login:**
- Traveler: `traveler@test.com` / `password123`
- Owner: `owner@test.com` / `password123`

**API Docs:**
- Backend: http://localhost:5000/api-docs
- AI Agent: http://localhost:8000/docs

---

## 🎮 What to Try

### As Traveler:
1. ✅ Search for properties (try "Los Angeles")
2. ✅ Click a property to view details
3. ✅ Create a booking
4. ✅ Add to favorites (heart icon)
5. ✅ Click AI button (bottom right) and ask: "What should I do in Los Angeles?"
6. ✅ Go to Profile and update info

### As Owner:
1. ✅ Login with owner account
2. ✅ Add a new property
3. ✅ View booking requests
4. ✅ Accept or decline bookings

---

## 🛑 Stopping Services

Press `Ctrl + C` in each Terminal tab to stop the services.

Or close all Terminal tabs.

---

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 8000 (AI agent)
lsof -ti:8000 | xargs kill -9
```

**Ollama not installed:**
```bash
brew install ollama
ollama pull llama2
```

**AI Agent errors:**
```bash
cd ai-agent
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📊 Service Status Check

Visit these URLs to check if services are running:

- ✅ Backend: http://localhost:5000/health
- ✅ Frontend: http://localhost:3000
- ✅ AI Agent: http://localhost:8000/api/ai/test

---

## 🔄 Next Time You Start

Just run:
```bash
./start-all.sh
```

Everything is already set up! 🎉

