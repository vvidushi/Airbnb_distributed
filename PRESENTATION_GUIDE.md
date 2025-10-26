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
mysql -u root -p -e "SELECT 1;" 2>/dev/null && echo "✅ Database connected" || echo "❌ Database not accessible"

# Check Backend
curl -s http://localhost:5001/health && echo "✅ Backend running" || echo "❌ Backend not running"

# Check AI Agent
curl -s http://localhost:8000/health && echo "✅ AI Agent running" || echo "❌ AI Agent not running"
```

### **2. Start Services (if needed)**

#### **Start MySQL Server:**
```bash
# Start MySQL server (required before starting the application)
brew services start mysql

# Verify MySQL is running
mysql -u root -p123 -e "SELECT 1;" && echo "✅ MySQL Ready"
```

#### **Start Backend:**
```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/backend
npm run dev
```

#### **Start Frontend:**
```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/frontend
npm start
```

#### **Start AI Agent:**
```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/ai-agent
source venv/bin/activate
python simple_main.py
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
```

---

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
mysql -u root -p -e "SELECT 1;"

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
- **AI Agent:** Python + FastAPI
- **Authentication:** Session-based
- **File Upload:** Multer

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
mysql -u root -p -e "DROP DATABASE IF EXISTS airbnb_db; CREATE DATABASE airbnb_db;"
mysql -u root -p airbnb_db < database/schema.sql
mysql -u root -p airbnb_db < database/seed.sql
```

---

**Good luck with your presentation! 🎉**
