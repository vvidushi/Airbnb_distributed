# Airbnb App - Quick Run Guide

## Prerequisites
- Node.js, Python 3.9+, MySQL installed
- OpenAI API key: https://platform.openai.com/api-keys
- Tavily API key: https://tavily.com/

---

## 1. Database Setup

```bash
mysql -u root -p
CREATE DATABASE airbnb_db;
exit;

mysql -u root -p airbnb_db < database/schema.sql
mysql -u root -p airbnb_db < database/seed.sql
```

---

## 2. Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your MySQL credentials
npm run dev
```

**Runs on:** http://localhost:5000

---

## 3. Frontend Setup

```bash
cd frontend
npm install
cp env.example .env
npm start
```

**Runs on:** http://localhost:3000

---

## 4. AI Agent Setup

```bash
cd ai-agent
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
```

**Edit `ai-agent/.env` with:**
```env
OPENAI_API_KEY=sk-your-key-here
TAVILY_API_KEY=your-tavily-key-here
DB_PASSWORD=your-mysql-password
```

**Run:**
```bash
python app/main.py
```

**Runs on:** http://localhost:8000

---

## Auto Start (macOS)

```bash
cd run-guide
./start-all.sh
```

---

## Test Accounts

| Role     | Email              | Password   | Status      |
|----------|--------------------|-----------|-------------|
| Traveler | `traveler@test.com` | `password123` | ✅ Working |
| Traveler | `mike@test.com`     | `password123` | ✅ Working |
| Owner    | `owner@test.com`    | `password123` | ✅ Working |
| Owner    | `emma@test.com`     | `password123` | ✅ Working |

---

## API Docs

- Backend: http://localhost:5000/api-docs
- AI Agent: http://localhost:8000/docs

