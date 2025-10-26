# ⚡ START HERE - Airbnb App

## 🚀 To Start the App (Just One Command!)

```bash
cd <folder>/Airbnb
./start-all.sh
```

This will automatically open **4 Terminal tabs** running:
- ✅ Backend (Node.js)
- ✅ Frontend (React)
- ✅ Ollama (AI Server)
- ✅ AI Agent (Python)

---

## 📱 Access the App

Once all services start (wait ~30 seconds):

### **Open in Browser:**
**http://localhost:3000**

### **Login:**
- **Traveler:** `traveler@test.com` / `password123`
- **Owner:** `owner@test.com` / `password123`

---

## 🎮 What to Try

### As Traveler:
1. Search for "Los Angeles"
2. Click on a property
3. Click **AI button** (robot icon, bottom right)
4. Ask: "What should I do in Los Angeles?"
5. Create a booking
6. Add properties to favorites ❤️

### As Owner:
1. Logout and login with owner account
2. Add a new property
3. View and accept booking requests

---

## 🛑 To Stop

Press `Ctrl + C` in each Terminal tab

Or close all Terminal windows

---

## 📚 API Documentation

- **Backend API:** http://localhost:5000/api-docs
- **AI Agent API:** http://localhost:8000/docs

---

## ✅ Everything You Need to Know

| Service | Port | Status Check |
|---------|------|--------------|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 5000 | http://localhost:5000/health |
| Ollama | 11434 | Running in background |
| AI Agent | 8000 | http://localhost:8000/api/ai/test |

---

## 🎯 Quick Reference

**Test Accounts:**
- Traveler: `traveler@test.com` / `password123`
- Owner: `owner@test.com` / `password123`

**What Works:**
- ✅ User authentication (signup/login)
- ✅ Property search & booking
- ✅ Favorites system
- ✅ Profile management with photos
- ✅ AI travel assistant (free, offline!)
- ✅ Booking management (Accept/Cancel)
- ✅ Owner property management

**Tech Stack:**
- React + TailwindCSS (Frontend)
- Node.js + Express + MySQL (Backend)
- Ollama + Tavily (AI - Hybrid mode!)

---

## 🐛 If Something Goes Wrong

**Port already in use?**
```bash
# Kill and restart
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
./start-all.sh
```

**Services not starting?**
- Make sure MySQL is running: `brew services start mysql`
- Check `QUICK_START.md` for manual start instructions

---

## 🎉 You're All Set!

Just run:
```bash
./start-all.sh
```

Then visit **http://localhost:3000** and start exploring!

---

**Need help?** See `QUICK_START.md` for detailed instructions.

