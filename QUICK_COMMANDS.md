# 🚀 Compact Lab 2 Run Guide

## **Option A: Single Terminal (Recommended)**
*Run everything in the background using one terminal window.*

1.  **Start Docker**
    ```bash
    open -a Docker
    # Wait ~30s for the whale icon
    ```

2.  **Start All Services**
    ```bash
    cd /Users/vidushi/PycharmProjects/Airbnb_distributed
    docker-compose up -d
    ```

3.  **Verify & Open**
    ```bash
    docker-compose ps
    open http://localhost:3000
    ```

4.  **Stop Everything**
    ```bash
    docker-compose down
    ```

---

## **Option B: Multiple Terminals (For Monitoring)**
*Open separate terminal tabs to see live logs for each component.*

**Terminal 1: Core Infra**
```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed
docker-compose up -d zookeeper kafka mysql mongodb
```

**Terminal 2: Backend Logs**
```bash
docker-compose up -d backend kafka-consumer kafka-producer
docker-compose logs -f backend
```

**Terminal 3: AI Agent Logs**
```bash
docker-compose up -d ai-agent
docker-compose logs -f ai-agent
```

**Terminal 4: Frontend Logs**
```bash
docker-compose up -d frontend
docker-compose logs -f frontend
```

---

## **⚡ Quick Fixes**

**Kill Port Conflicts:**
```bash
lsof -ti:3000,5001,8000,9092 | xargs kill -9
```

**Hard Reset (Wipe Data):**
```bash
docker-compose down -v && docker-compose up -d
```

---

## **Option C: Lab 2 Health & Demo Checks**
*Use these after services are up to prove everything works end‑to‑end.*

```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed

# 1) Show running containers
docker-compose ps

# 2) Backend health
curl http://localhost:5001/health

# 3) AI Agent health
curl http://localhost:8000/health

# 4) List Kafka topics
docker exec airbnb-kafka kafka-topics --list --bootstrap-server localhost:9092

# 5) Quick DB sanity check (MySQL-in-Docker)
docker exec airbnb-mysql mysql -u admin -padmin123 airbnb_db -e "
  SHOW TABLES;
  SELECT 'users' AS table_name, COUNT(*) AS count FROM users
  UNION ALL
  SELECT 'properties', COUNT(*) FROM properties
  UNION ALL
  SELECT 'bookings', COUNT(*) FROM bookings;
"
```


