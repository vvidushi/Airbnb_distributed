# Airbnb Prototype - Complete Setup Guide

This guide will help you set up and run the complete Airbnb prototype application.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://python.org/)
- **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Start

### Step 1: Database Setup

1. **Start MySQL Server**
   ```bash
   # macOS (if using Homebrew)
   brew services start mysql
   
   # Or manually
   mysql.server start
   ```

2. **Create Database**
   ```bash
   mysql -u root -p
   ```
   
   Then in MySQL prompt:
   ```sql
   CREATE DATABASE airbnb_db;
   USE airbnb_db;
   SOURCE database/schema.sql;
   SOURCE database/seed.sql;
   EXIT;
   ```

### Step 2: Backend Setup (Node.js)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your MySQL credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=airbnb_db
   DB_PORT=3306
   
   SESSION_SECRET=my_super_secret_key_12345
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:5000`
   
   ✅ **Test it:** Visit `http://localhost:5000/health`

### Step 3: Frontend Setup (React)

1. **Open a new terminal and navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (optional)
   ```bash
   cp env.example .env
   ```

4. **Start the frontend**
   ```bash
   npm start
   ```
   
   Frontend will run on `http://localhost:3000`
   
   ✅ **Test it:** Visit `http://localhost:3000`

### Step 4: AI Agent Setup (Python FastAPI + Ollama)

1. **Install Ollama (Local AI Model)**
   
   **macOS:**
   ```bash
   # Visit https://ollama.com/download and install
   # Or use Homebrew:
   brew install ollama
   ```
   
   **Linux:**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
   
   **Windows:**
   Download from https://ollama.com/download

2. **Download AI Model**
   ```bash
   # Download Llama 2 (recommended, ~4GB)
   ollama pull llama2
   
   # Or use a smaller model:
   # ollama pull phi  (1.6GB, faster)
   ```

3. **Start Ollama Server**
   ```bash
   ollama serve
   ```
   
   Keep this running in a separate terminal!

4. **Setup AI Agent**
   
   Open a new terminal:
   ```bash
   cd ai-agent
   ```

5. **Create virtual environment**
   ```bash
   python3 -m venv venv
   
   # Activate it
   # macOS/Linux:
   source venv/bin/activate
   
   # Windows:
   venv\Scripts\activate
   ```

6. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

7. **Configure environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=airbnb_db
   DB_PORT=3306
   
   API_HOST=0.0.0.0
   API_PORT=8000
   
   # Ollama Configuration (Local Model)
   OLLAMA_MODEL=llama2
   OLLAMA_BASE_URL=http://localhost:11434
   ```

8. **Start the AI service**
   ```bash
   python app/main.py
   ```
   
   Or using uvicorn:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   
   AI Agent will run on `http://localhost:8000`
   
   ✅ **Test it:** Visit `http://localhost:8000/docs` for Swagger UI

## 🤖 About Ollama (Local AI)

**Benefits:**
- ✅ **Completely FREE** - No API costs
- ✅ **Works OFFLINE** - No internet needed
- ✅ **Private** - Data stays on your machine
- ✅ **No API Keys** - Just install and run!

**Requirements:**
- 8GB+ RAM recommended
- 4-5GB disk space for model
- First response is slower (model loads), then fast

See `ai-agent/OLLAMA_SETUP.md` for detailed instructions

## 📱 Using the Application

### Test Accounts

After running the seed script, you can login with:

**Traveler Account:**
- Email: `traveler@test.com`
- Password: `password123`

**Owner Account:**
- Email: `owner@test.com`
- Password: `password123`

### Traveler Features
1. **Search Properties** - Search by location, dates, and number of guests
2. **View Property Details** - See full property information
3. **Book Properties** - Create booking requests
4. **Manage Favorites** - Save favorite properties
5. **View Bookings** - Track your trips (Pending/Accepted/Cancelled)
6. **Update Profile** - Edit your profile and upload photo
7. **AI Assistant** - Click the floating AI button to get travel recommendations

### Owner Features
1. **Dashboard** - Overview of properties and bookings
2. **Manage Properties** - Add, edit, delete properties
3. **Booking Requests** - Accept or decline booking requests
4. **Update Profile** - Manage your owner profile

## 🧪 Testing the API

### Using Swagger UI
- Backend API: `http://localhost:5000/api-docs`
- AI Agent API: `http://localhost:8000/docs`

### Using Postman
Import the API endpoints and test them individually.

Example endpoints:
- `POST /api/auth/login` - Login
- `GET /api/properties/search` - Search properties
- `POST /api/bookings` - Create booking
- `POST /api/ai/plan` - Get AI travel recommendations

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure port 5000 is not in use

### Frontend won't start
- Delete `node_modules` and run `npm install` again
- Clear npm cache: `npm cache clean --force`
- Ensure port 3000 is not in use

### AI Agent errors
- Verify OpenAI API key is valid
- Check if you have API credits
- Ensure Python virtual environment is activated
- Verify MySQL connection

### Database errors
- Ensure MySQL server is running
- Check credentials in `.env` files
- Verify database `airbnb_db` exists
- Re-run schema.sql if tables are missing

## 📊 Database Schema

### Tables
- **users** - Stores traveler and owner accounts
- **properties** - Property listings
- **bookings** - Booking requests and history

### Key Features
- JSON field for favorite properties (in users table)
- Session management with MySQL session store
- Booking status flow: pending → accepted/cancelled

## 🔒 Security Features

- Password hashing with bcrypt
- Session-based authentication
- CORS protection
- Input validation
- SQL injection prevention with prepared statements

## 🎨 Tech Stack Summary

**Frontend:**
- React 18
- React Router v6
- TailwindCSS
- Axios
- React DatePicker
- React Icons

**Backend:**
- Node.js + Express
- MySQL2
- Express Session
- bcryptjs
- Swagger (API docs)
- Multer (file uploads)

**AI Agent:**
- Python FastAPI
- Langchain
- OpenAI GPT-3.5-turbo
- Tavily (web search)
- MySQL connector

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Langchain Documentation](https://python.langchain.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## 🤝 Support

If you encounter issues:
1. Check this guide thoroughly
2. Review error logs in terminal
3. Verify all services are running
4. Check API keys are configured

## 📝 Notes

- The AI agent uses GPT-3.5-turbo to keep costs low
- Image uploads are stored in `backend/uploads/`
- Session data is stored in MySQL
- All three services must be running for full functionality

Happy coding! 🚀

