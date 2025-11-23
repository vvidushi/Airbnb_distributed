# Kafka Integration for Asynchronous Messaging - Lab 2 Part 2

This document explains the Kafka setup and asynchronous message handling for the Airbnb booking flow.

## 📋 Architecture Overview

The application uses **Kafka** as a message broker to enable asynchronous, event-driven communication between services.

```
┌─────────────────────────────────────────────────────────────────┐
│                    KAFKA ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────┘

  Frontend (React)
       │
       ├──→ HTTP POST /api/bookings
       │
       ▼
┌──────────────────┐
│  PRODUCER        │  📤 Publishes Events
│  SERVICE         │
│  (Port 5001)     │  Topics:
│                  │  - booking-requests
│  - Creates       │  - booking-status-updates
│    booking in DB │
│  - Publishes to  │
│    Kafka         │
│  - Returns       │
│    immediately   │
└────────┬─────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │         KAFKA BROKER            │
    │      (Port 9092)                │
    │                                 │
    │  Topics:                        │
    │  ┌───────────────────────────┐  │
    │  │ booking-requests          │  │
    │  │ (Partition 1,2,3)         │  │
    │  └───────────────────────────┘  │
    │  ┌───────────────────────────┐  │
    │  │ booking-status-updates    │  │
    │  │ (Partition 1,2,3)         │  │
    │  └───────────────────────────┘  │
    │  ┌───────────────────────────┐  │
    │  │ property-updates          │  │
    │  └───────────────────────────┘  │
    └──────────────┬──────────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  CONSUMER        │  📥 Consumes Events
         │  SERVICE         │
         │                  │  Processes:
         │  - Listens to    │  - Send notifications
         │    Kafka topics  │  - Update analytics
         │  - Processes     │  - Email alerts
         │    events async  │  - Business logic
         │  - Sends         │
         │    notifications │
         └──────────────────┘
                   │
                   ▼
              MongoDB / MySQL
```

## 🔄 Booking Flow with Kafka

### 1. Traveler Creates Booking

```javascript
// Frontend sends POST request
POST /api/bookings
{
  "property_id": 1,
  "start_date": "2025-12-01",
  "end_date": "2025-12-05",
  "guests": 2,
  "total_price": 500
}
```

**Producer Service** (Port 5001):
1. Receives request
2. Creates booking in database (status: `pending`)
3. **Publishes event to Kafka** topic: `booking-requests`
4. **Returns response immediately** to frontend (doesn't wait for processing)

```javascript
Event Published to Kafka:
{
  "eventType": "BOOKING_REQUEST_CREATED",
  "bookingId": 123,
  "propertyId": 1,
  "travelerId": 5,
  "ownerId": 10,
  "startDate": "2025-12-01",
  "endDate": "2025-12-05",
  "guests": 2,
  "totalPrice": 500,
  "status": "pending",
  "timestamp": "2025-11-23T10:30:00Z"
}
```

**Consumer Service** (Background):
1. **Consumes event asynchronously**
2. Sends email notification to property owner
3. Updates analytics
4. Logs event for audit trail
5. Performs any additional business logic

### 2. Owner Accepts/Cancels Booking

```javascript
// Frontend sends PUT request
PUT /api/bookings/123/status
{
  "status": "accepted"
}
```

**Producer Service**:
1. Updates booking status in database
2. **Publishes status update event to Kafka** topic: `booking-status-updates`
3. Returns response to frontend

```javascript
Event Published to Kafka:
{
  "eventType": "BOOKING_STATUS_UPDATED",
  "bookingId": 123,
  "previousStatus": "pending",
  "newStatus": "accepted",
  "travelerId": 5,
  "travelerEmail": "traveler@test.com",
  "propertyName": "Luxury Beach House",
  "timestamp": "2025-11-23T11:00:00Z"
}
```

**Consumer Service**:
1. **Consumes status update event**
2. Sends confirmation email to traveler
3. Updates property availability calendar
4. Processes payment (if applicable)
5. Sends mobile push notification

## 🚀 Services

### Producer Service (Port 5001)

**File:** `backend/src/kafka/producer-service.js`

**Responsibilities:**
- Acts as "Frontend Service" in the architecture
- Receives HTTP requests from React frontend
- Publishes events to Kafka topics
- Returns immediate response (doesn't wait for processing)

**Endpoints:**
- `POST /api/bookings` - Create booking request
- `PUT /api/bookings/:id/status` - Update booking status

### Consumer Service (Background Process)

**File:** `backend/src/kafka/consumer-service.js`

**Responsibilities:**
- Acts as "Backend Service" in the architecture
- Consumes events from Kafka topics
- Processes events asynchronously
- Sends notifications, updates analytics, etc.

**Topics Consumed:**
- `booking-requests` - New booking requests
- `booking-status-updates` - Booking status changes
- `property-updates` - Property modifications

## 📦 Kafka Topics

| Topic | Purpose | Producers | Consumers |
|-------|---------|-----------|-----------|
| `booking-requests` | New booking creation | Producer Service | Consumer Service |
| `booking-status-updates` | Booking status changes | Producer Service | Consumer Service |
| `property-updates` | Property modifications | Backend Service | Consumer Service |

## 🛠️ Setup Instructions

### Option 1: Docker Compose (Local Testing)

```bash
# Start all services including Kafka
docker-compose up -d

# View Kafka producer logs
docker-compose logs -f kafka-producer

# View Kafka consumer logs
docker-compose logs -f kafka-consumer

# View Kafka broker logs
docker-compose logs -f kafka
```

**Services Started:**
- Zookeeper (Port 2181)
- Kafka Broker (Port 9092)
- MySQL Database (Port 3306)
- Backend Service (Port 5000)
- Kafka Producer (Port 5001)
- Kafka Consumer (Background)
- Frontend (Port 3000)
- AI Agent (Port 8000)

### Option 2: Kubernetes Deployment

```bash
# Deploy Zookeeper
kubectl apply -f k8s/zookeeper-deployment.yaml

# Deploy Kafka
kubectl apply -f k8s/kafka-deployment.yaml

# Wait for Kafka to be ready
kubectl wait --for=condition=ready pod -l app=kafka -n airbnb-lab --timeout=180s

# Deploy Kafka Producer Service
kubectl apply -f k8s/kafka-producer-deployment.yaml

# Deploy Kafka Consumer Service
kubectl apply -f k8s/kafka-consumer-deployment.yaml

# Check status
kubectl get pods -n airbnb-lab | grep kafka
```

### Option 3: Manual Local Development

```bash
# Terminal 1: Start Zookeeper
docker run -p 2181:2181 confluentinc/cp-zookeeper:7.5.0

# Terminal 2: Start Kafka
docker run -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=localhost:2181 \
  confluentinc/cp-kafka:7.5.0

# Terminal 3: Start Producer Service
cd backend
npm install kafkajs
KAFKA_BROKER=localhost:9092 node src/kafka/producer-service.js

# Terminal 4: Start Consumer Service
cd backend
KAFKA_BROKER=localhost:9092 node src/kafka/consumer-service.js
```

## 🧪 Testing the Kafka Flow

### Test 1: Create Booking (Producer → Kafka → Consumer)

```bash
# Create a booking
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -d '{
    "property_id": 1,
    "start_date": "2025-12-01",
    "end_date": "2025-12-05",
    "guests": 2,
    "total_price": 500
  }'

# Expected Response (Immediate):
{
  "message": "Booking request created successfully",
  "bookingId": 123,
  "status": "pending",
  "note": "Your booking request has been submitted and is being processed"
}

# Check Consumer logs (should show event processing):
docker-compose logs -f kafka-consumer
```

### Test 2: Update Booking Status

```bash
# Accept booking
curl -X PUT http://localhost:5001/api/bookings/123/status \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=OWNER_SESSION_ID" \
  -d '{
    "status": "accepted"
  }'

# Expected Response:
{
  "message": "Booking accepted successfully",
  "bookingId": 123,
  "status": "accepted"
}

# Check Consumer logs (should show notification being sent):
docker-compose logs -f kafka-consumer
```

### Test 3: View Kafka Topics

```bash
# List topics
docker exec airbnb-kafka kafka-topics --list \
  --bootstrap-server localhost:9092

# Expected output:
# booking-requests
# booking-status-updates
# property-updates

# View messages in topic
docker exec airbnb-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic booking-requests \
  --from-beginning
```

## 🔍 Monitoring & Debugging

### View Producer Logs

```bash
# Docker Compose
docker-compose logs -f kafka-producer

# Kubernetes
kubectl logs -f -n airbnb-lab -l app=kafka-producer
```

### View Consumer Logs

```bash
# Docker Compose
docker-compose logs -f kafka-consumer

# Kubernetes
kubectl logs -f -n airbnb-lab -l app=kafka-consumer
```

### View Kafka Broker Logs

```bash
# Docker Compose
docker-compose logs -f kafka

# Kubernetes
kubectl logs -f -n airbnb-lab -l app=kafka
```

### Check Consumer Group

```bash
# View consumer group details
docker exec airbnb-kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe --group airbnb-backend-group
```

## 📊 Benefits of Kafka Integration

### 1. **Asynchronous Processing**
- Frontend gets immediate response
- Heavy processing happens in background
- Better user experience

### 2. **Decoupling**
- Producer and Consumer are independent
- Can scale separately
- Failures in one don't affect the other

### 3. **Scalability**
- Multiple consumers can process events in parallel
- Multiple producers can publish events
- Kafka handles load balancing

### 4. **Reliability**
- Events are persisted in Kafka
- Guaranteed delivery
- Can replay events if needed

### 5. **Event Sourcing**
- Complete audit trail of all events
- Can reconstruct state from events
- Easy to add new consumers for analytics

## 🎯 Key Differences from Synchronous Flow

### Before (Synchronous):

```
Frontend → Backend → Database → Email → Response (5+ seconds)
```
User waits for everything to complete.

### After (Asynchronous with Kafka):

```
Frontend → Producer → Database → Kafka → Response (< 100ms)
                                   ↓
                                Consumer → Email (background)
```
User gets immediate response, processing happens in background.

## 📸 Screenshots for Report

1. **Kafka Topics List**: `docker exec airbnb-kafka kafka-topics --list`
2. **Producer Service Running**: `docker-compose logs kafka-producer`
3. **Consumer Processing Events**: `docker-compose logs kafka-consumer`
4. **Event in Kafka Topic**: `kafka-console-consumer` output
5. **All Services Running**: `docker-compose ps`
6. **Kubernetes Pods**: `kubectl get pods -n airbnb-lab`

## ✅ Lab 2 Part 2 Completion Checklist

- [x] Kafka and Zookeeper added to Kubernetes
- [x] Producer service implemented (publishes booking events)
- [x] Consumer service implemented (processes events)
- [x] Booking request flow with Kafka
- [x] Status update flow with Kafka
- [x] Docker Compose configuration with Kafka
- [x] Kubernetes manifests for Kafka, Producer, Consumer
- [x] Event-driven architecture documented
- [x] Asynchronous message handling working

## 🔗 Related Files

- `backend/src/kafka/kafkaClient.js` - Kafka connection and utilities
- `backend/src/kafka/producer-service.js` - Producer endpoints
- `backend/src/kafka/consumer-service.js` - Event processor
- `k8s/kafka-deployment.yaml` - Kafka Kubernetes deployment
- `k8s/zookeeper-deployment.yaml` - Zookeeper deployment
- `k8s/kafka-producer-deployment.yaml` - Producer deployment
- `k8s/kafka-consumer-deployment.yaml` - Consumer deployment
- `docker-compose.yml` - Local development with Kafka

