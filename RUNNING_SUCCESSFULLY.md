# ✅ Lab 2 Setup Complete - Running Successfully!

## 🎉 **All Services Are Running!**

Your Airbnb distributed system is now fully operational with Docker Compose.

---

## 📊 **Service Status**

| Service | Port | Status | Purpose |
|---------|------|--------|---------|
| **Frontend** | 3000 | ✅ Running | React UI served by Nginx |
| **Backend** | 5001 | ✅ Running | Node.js/Express API |
| **AI Agent** | 8000 | ✅ Running | Python FastAPI with OpenAI & Tavily |
| **MySQL** | 3306 | ✅ Healthy | Legacy database |
| **MongoDB** | 27017 | ✅ Healthy | Primary database + Sessions (Lab 2 Part 3) |
| **Kafka** | 9092 | ✅ Healthy | Message broker (Lab 2 Part 2) |
| **Zookeeper** | 2181 | ✅ Healthy | Kafka coordinator |
| **Kafka Producer** | 5002 | ✅ Running | Frontend service (produces events) |
| **Kafka Consumer** | - | ✅ Running | Backend service (consumes events) |

---

## 🌐 **Access Your Application**

### **Frontend (User Interface)**
```
http://localhost:3000
```

### **Backend API**
```
http://localhost:5001/api
```

### **AI Agent API**
```
http://localhost:8000
```

### **API Documentation**
- Backend Swagger: `http://localhost:5001/api-docs`
- AI Agent Docs: `http://localhost:8000/docs`

---

## 🔑 **Test Accounts**

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Traveler | traveler@test.com  | password123 |
| Owner    | owner@test.com     | password123 |

---

## ✅ **Lab 2 Requirements Completed**

### **Part 1: Docker & Kubernetes (15 points)** ✅
- [x] All services Dockerized
- [x] Docker Compose configuration
- [x] Multiple replicas ready for Kubernetes
- [x] Service-to-service communication configured

### **Part 2: Kafka for Asynchronous Messaging (10 points)** ✅
- [x] Kafka & Zookeeper running
- [x] Kafka Producer service (Frontend service)
- [x] Kafka Consumer service (Backend service)
- [x] Booking flow via Kafka events
  - Traveler creates booking → Kafka event
  - Owner service consumes event
  - Status updates published back

### **Part 3: MongoDB (5 points)** ✅
- [x] MongoDB running and connected
- [x] Sessions stored in MongoDB
- [x] Passwords encrypted (bcrypt)

### **Part 4: Redux Integration (5 points)** ✅
- [x] Redux Toolkit integrated
- [x] User authentication state management
- [x] Property data management
- [x] Booking state management

### **Part 5: JMeter Performance Testing (5 points)** 📝
- [ ] Test plans ready in `jmeter/test-plans/`
- [ ] Run tests: `cd jmeter/scripts && ./run-jmeter-tests.sh`

---

## 🔧 **Useful Docker Commands**

### **View Service Status**
```bash
docker-compose ps
```

### **View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f kafka-consumer
docker-compose logs -f ai-agent
```

### **Restart a Service**
```bash
docker-compose restart <service-name>
# Example: docker-compose restart backend
```

### **Stop All Services**
```bash
docker-compose down
```

### **Stop and Remove Everything (including volumes)**
```bash
docker-compose down -v
```

### **Rebuild a Service**
```bash
docker-compose build <service-name>
docker-compose up -d
```

---

## 🚀 **Next Steps for Kubernetes Deployment**

Once you're ready to deploy to Kubernetes:

```bash
# Deploy to Kubernetes cluster
./deploy.sh

# Or deploy to specific services
./deploy-kafka.sh
```

---

## 📊 **API Keys Configured**

✅ **OpenAI API Key**: Configured (gpt-3.5-turbo)
✅ **Tavily API Key**: Configured
✅ **Session Secret**: `distributed_key`

---

## 🧪 **Testing the Application**

### **1. Test Frontend**
```bash
curl http://localhost:3000
```

### **2. Test Backend Health**
```bash
curl http://localhost:5001/api/health
```

### **3. Test AI Agent**
```bash
curl http://localhost:8000/health
```

### **4. Test Kafka**
```bash
# Check Kafka topics
docker exec airbnb-kafka kafka-topics --list --bootstrap-server localhost:9092
```

### **5. Full User Flow Test**
1. Open http://localhost:3000 in your browser
2. Login as Traveler (traveler@test.com / password123)
3. Search for a property
4. Create a booking (triggers Kafka event)
5. Logout and login as Owner (owner@test.com / password123)
6. Check "My Bookings" to see the request
7. Accept/Decline the booking (triggers Kafka event back)
8. Check MongoDB for session data
9. Test AI Agent by clicking the AI button

---

## 📝 **Important Notes**

1. **Port 5001 instead of 5000**: Due to macOS ControlCenter using port 5000, we configured the backend to use port 5001
2. **Frontend URLs updated**: All API calls now go to `http://localhost:5001`
3. **Nginx configuration**: Updated to proxy to correct service names (`backend` and `ai-agent`)
4. **Dependencies added**: Added `kafkajs`, `mongoose`, and `connect-mongo` to backend package.json

---

## 🎯 **For Lab 2 Submission**

### **Screenshots Needed:**
1. ✅ `docker-compose ps` showing all services running
2. ✅ Browser showing application at http://localhost:3000
3. ✅ AI Agent health check showing OpenAI and Tavily configured
4. ✅ Kafka consumer logs showing successful connection
5. ✅ MongoDB connection successful
6. 📸 JMeter test results (100, 200, 300, 400, 500 users)

### **Code to Submit:**
- ✅ `docker-compose.yml`
- ✅ All Dockerfiles (backend, frontend, ai-agent)
- ✅ Kubernetes manifests in `k8s/` folder
- ✅ Kafka integration code
- ✅ Redux implementation
- ✅ JMeter test plans

---

## 🛑 **Troubleshooting**

### **If Docker stops:**
```bash
open -a Docker
sleep 15
docker-compose up -d
```

### **If ports are in use:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
lsof -ti:8000 | xargs kill -9
docker-compose up -d
```

### **If services are restarting:**
```bash
docker-compose logs <service-name>
```

---

## 🎉 **Success! Your Lab 2 is Ready!**

You now have a fully functional distributed Airbnb system with:
- ✅ Docker containerization
- ✅ Kafka message queue
- ✅ MongoDB database + sessions
- ✅ Redux state management
- ✅ AI integration (OpenAI + Tavily)

**Just run JMeter tests and you're ready to submit!**

---

**Created:** November 22, 2025
**Status:** ✅ All Systems Operational

