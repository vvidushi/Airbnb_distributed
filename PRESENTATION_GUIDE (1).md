# 🎯 Airbnb Application - Presentation Guide

## 📋 **Pre-Presentation Setup Checklist**

### ✅ **Required Services Status**
- [ ] Database (MySQL) - Running
- [ ] Backend (Node.js) - Running on port 5001
- [ ] Frontend (React) - Running on port 3000
- [x] AI Agent (Python) - Running on port 8000 ✅
- [ ] Ollama (AI Model) - Not running (optional for demo)

---

## 🚀 **Step-by-Step Demo Commands**

### **1. Check All Services Status**

```bash
# Check Database
mysql -u root -p123 -e "SELECT 1;" 2>/dev/null && echo "✅ Database connected" || echo "❌ Database not accessible"

# Check Backend
curl -s http://localhost:5001/health && echo "✅ Backend running" || echo "❌ Backend not running"

curl -s http://localhost:3000/health && echo "✅ Backend running" || echo "❌ frontend not running"

# Check AI Agent
curl -s http://localhost:8000/health && echo "✅ AI Agent running" || echo "❌ AI Agent not running"

# Check Ollama (optional, for advanced AI)
curl -s http://localhost:11434/api/tags && echo "✅ Ollama running" || echo "❌ Ollama not running"
```

### **2. Start Services (if needed)**

#### **Start MySQL Server:**
```bash
# Start MySQL server (required before starting the application)
brew services start mysql

# Verify MySQL is running (will prompt for password)
mysql -u root -p -e "SELECT 1;" && echo "✅ MySQL Ready"
```

#### **Start Backend:**
```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/backend
npm run dev
```

#### **Start AI Agent (with Ollama support):**
```bash
# 1. Start Ollama service (in background)
ollama serve > /dev/null 2>&1 &

# 2. Start AI Agent (uses Ollama when available)
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/ai-agent
source venv/bin/activate
python simple_main.py


```

#### **Start Frontend:**
```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/frontend
npm start
```


#### **Kill Conflicting Processes (if needed):**
```bash
# Kill processes on ports 5000, 5001, 3000
lsof -ti:5000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
lsof -ti:8000 | xargs kill -9
lsof -ti:11434 | xargs kill -9
```

---


Summary: Test Queries for Presentation
Quick test queries:
For presentation (top 5)
"plan my trip to Bali" — day-by-day itinerary
"vegetarian restaurants in Paris for family" — dietary filtering
"what activities in Tokyo for kids" — child-friendly activities
"packing list for Delhi in winter" — weather-aware checklist
"current events in Los Angeles" — live local context (Tavily)
For full demo (all requirements)
"we are in Santa Monica, vegan, no long hikes, two kids" — NLU and multiple filters
"wheelchair accessible attractions in Rome" — accessibility filtering
"budget-friendly activities in Mumbai during monsoon" — budget + weather awareness
"show my trips" — booking context integration
"how many cancelled trips?" — database queries
All test queries are saved in ai-agent/test-queries.txt.
Lab requirements are covered and ready to demo.

## 🎭 **Demo Flow & Test Credentials**

### **Test User Accounts:**

#### **Owner Account:**
- **Email:** `owner@test.com`
- **Password:** `password123`

#### **Traveler Account:**
- **Email:** `traveler@test.com`
- **Password:** `password123`

#### **Alternative Owner:**
- **Email:** `emma@test.com`
- **Password:** `password123`

---

## 📱 **Demo Scenarios**

### **Scenario 1: Property Owner Workflow**

1. **Login as Owner**
   - Go to: `http://localhost:3000/login`
   - Use: `owner@test.com` / `password123`

2. **Create New Property**
   - Navigate to Owner Dashboard
   - Click "Add New Property"
   - Fill form with sample data:
     - Property Name: "Beach House"
     - Type: "Apartment"
     - Address: "200 Santa Monica Pier, Santa Monica, CA"
     - City: "Santa Monica"
     - Country: "United States"
     - Bedrooms: 3, Bathrooms: 3, Max Guests: 6
   - Upload images (this should work after login)
   - Click "Create Property"

3. **View Owner Properties**
   - Check "My Properties" section
   - Verify property appears in list

### **Scenario 2: Traveler Workflow**

1. **Login as Traveler**
   - Go to: `http://localhost:3000/login`
   - Use: `traveler@test.com` / `password123`

2. **Search Properties**
   - Use search bar to find properties
   - Filter by location, dates, guests

3. **View Property Details**
   - Click on any property
   - View images, amenities, description

4. **Make Booking**
   - Select dates and number of guests
   - Click "Book Now"
   - Confirm booking

### **Scenario 3: AI Travel Assistant**

1. **Open AI Chat Widget**
   - Click the AI robot icon (bottom-right corner)
   - Chat widget should open

2. **Test AI Responses**
   - Type: "hey" → Should get friendly greeting
   - Type: "suggest best location" → Should get destination categories
   - Type: "Paris travel plan" → Should get detailed Paris itinerary
   - Type: "recommend restaurants in Tokyo" → Should get Tokyo recommendations

3. **Show AI Capabilities**
   - Demonstrate different query types
   - Show contextual responses
   - Highlight travel planning features

### **Scenario 4: Owner Managing Bookings**

1. **Login as Owner** (`owner@test.com` / `password123`)
2. **Check Bookings**
   - Go to Owner Dashboard
   - View "Booking Requests"
3. **Accept/Decline Booking**
   - Click on pending booking
   - Accept or decline the request

---

## 🔧 **Troubleshooting Commands**

### **If Services Won't Start:**

```bash
# Check what's using ports
lsof -i :3000
lsof -i :5001
lsof -i :5000

# Kill specific processes
pkill -f "react-scripts start"
pkill -f "nodemon"
pkill -f "node.*server.js"

# Restart services
cd backend && npm run dev &
cd frontend && npm start &
```

### **If Database Connection Fails:**

```bash
# Test database connection
mysql -u root -p123 -e "SELECT 1;"

# Check if MySQL is running
brew services list | grep mysql

# Start MySQL if needed
brew services start mysql
```

### **If Upload Fails:**

```bash
# Check uploads directory permissions
ls -la backend/uploads/

# Test upload endpoint
curl -X POST http://localhost:5001/api/properties/upload-images \
  -F "propertyImages=@backend/uploads/propertyImages-1760843957311-884141826.png"
```

---

## 📊 **Key Features to Highlight**

### **✅ Working Features:**
- User Authentication (Login/Signup)
- Property Creation & Management
- Property Search & Filtering
- Booking System
- Image Upload (after login)
- Role-based Access (Owner/Traveler)
- AI Travel Assistant (Chat Widget)
- Responsive Design

### **🔧 Technical Stack:**
- **Frontend:** React + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** MySQL
- **AI Agent:** Python + FastAPI + Ollama (llama2) + Tavily (web search)
- **Authentication:** Session-based (express-session)
- **File Upload:** Multer
- **API Communication:** REST APIs with internal API key authentication
- **Live/Local Context:** Tavily for weather, POIs, events

### **🏗️ Architecture:**
- RESTful API Design
- Three-tier Architecture
- Session Management
- Role-based Authorization

---

## 🎯 **Presentation Tips**

### **Before Starting:**
1. Open all required terminals
2. Verify all services are running
3. Have test credentials ready
4. Test upload functionality beforehand

### **During Demo:**
1. Start with service status check
2. Show login functionality
3. Demonstrate owner workflow first
4. Show traveler workflow
5. Highlight booking management
6. Mention scalability and architecture

### **Backup Plan:**
- If live demo fails, have screenshots ready
- Explain the architecture and features
- Show code structure and implementation

---

## 📝 **Quick Reference**

### **Service URLs:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **AI Agent:** http://localhost:8000
- **API Docs:** http://localhost:5001/api-docs
- **Health Check:** http://localhost:5001/health

### **Key Directories:**
- **Frontend:** `/frontend/`
- **Backend:** `/backend/`
- **Database:** `/database/`
- **Documentation:** `/run-guide/`

### **Important Files:**
- **Frontend Config:** `frontend/package.json`
- **Backend Config:** `backend/.env`
- **Database Schema:** `database/schema.sql`
- **Test Data:** `database/seed.sql`

---

## 🤖 **Ollama AI Setup (Advanced)**

### **About Ollama:**
- **Purpose:** Enables dynamic AI responses using LLM models
- **Current Setup:** Using `simple_main.py` which automatically detects and uses Ollama
- **How It Works:** Checks if Ollama is running, uses it for general queries if available, otherwise falls back to rule-based responses

### **When to Use Ollama:**
- ✅ You want dynamic, AI-generated responses
- ✅ Need more intelligent and contextual answers
- ✅ Want to demonstrate real AI capabilities

### **Setup Ollama + Tavily:**

```bash
# 1. Install Ollama (if not installed)
# Visit: https://ollama.com/ and download for macOS

# 2. Start Ollama service
ollama serve > /dev/null 2>&1 &

# 3. Pull the AI model (first time only - downloads ~3.8GB)
ollama pull llama2

# 4. Setup Tavily (for live local context - REQUIRED for lab)
# Get free API key from: https://tavily.com/
# Add to ai-agent/.env: TAVILY_API_KEY=your_key_here

# 5. Install Tavily library
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/ai-agent
source venv/bin/activate
pip install tavily-python==0.3.0

# 6. Verify Ollama is running
curl -s http://localhost:11434/api/tags && echo "✅ Ollama Ready"
```

### **Using Ollama (Built-in):**

```bash
# The agent automatically detects Ollama when it's running
# Just make sure Ollama service is running:

# Start Ollama
ollama serve > /dev/null 2>&1 &

# Start agent (it will use Ollama automatically)
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/ai-agent
source venv/bin/activate
python simple_main.py

# You'll see: "✅ Ollama initialized (llama2)" if working correctly
```

### **Benefits of Ollama:**
- 🧠 **Dynamic Responses:** AI generates answers, not pre-written
- 🌐 **Web Search:** Can search for real-time information via Tavily
- 🎯 **Contextual:** Understands context better than keyword matching
- 💡 **Intelligent:** More nuanced and helpful responses

### **How It Works:**

| Query Type | Response Source | Example |
|------------|----------------|---------|
| **Booking queries** | Rule-based (database) | "how many trips?" → Counts from database |
| **General queries** | Ollama + Tavily (if running) | "restaurants in Paris" → AI response with live data |
| **Travel recommendations** | Ollama + Tavily web search | "what to do in LA" → Live POIs, events, weather |
| **Greetings** | Rule-based | "hi" → Friendly greeting |
| **Fallback** | Rule-based message | When Ollama/Tavily unavailable |

---

## 🚨 **Emergency Commands**

### **Complete Restart:**
```bash
# Kill all services
pkill -f "node"
pkill -f "react-scripts"

# Start fresh
cd backend && npm run dev &
cd frontend && npm start &
```

### **Reset Database:**
```bash
mysql -u root -p123 -e "DROP DATABASE IF EXISTS airbnb_db; CREATE DATABASE airbnb_db;"
mysql -u root -p123 airbnb_db < database/schema.sql
mysql -u root -p123 airbnb_db < database/seed.sql
```

---

**Good luck with your presentation! 🎉**
