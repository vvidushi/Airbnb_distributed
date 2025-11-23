# Airbnb Lab 2 - Documentation Guide

This folder contains all technical documentation for Lab 2 implementation.

## 📚 Documentation Index

### Part 1: Docker & Kubernetes
- **[DOCKER_KUBERNETES.md](./DOCKER_KUBERNETES.md)** - Complete Docker containerization and Kubernetes orchestration guide
  - Dockerfiles for all services
  - Kubernetes manifests
  - Deployment instructions
  - Scaling guide
  - Troubleshooting

### Part 2: Kafka for Asynchronous Messaging
- **[KAFKA_SETUP.md](./KAFKA_SETUP.md)** - Kafka integration for event-driven architecture
  - Kafka architecture overview
  - Producer/Consumer services
  - Booking flow with Kafka
  - Topics configuration
  - Testing guide

### Part 3 & 4: MongoDB + Redux
- **[MONGODB_REDUX_SETUP.md](./MONGODB_REDUX_SETUP.md)** - MongoDB database and Redux state management
  - MongoDB setup and models
  - Session storage
  - Password encryption
  - Redux store configuration
  - Auth, Properties, Bookings slices
  - Component integration

### Part 5: JMeter Performance Testing
- **[JMETER_TESTING.md](./JMETER_TESTING.md)** - Complete performance testing guide
  - JMeter installation
  - Test plans for 100-500 concurrent users
  - Performance analysis and graphs
  - Bottleneck identification
  - Results reporting

### Lab Report & Submission
- **[LAB2_REPORT.md](./LAB2_REPORT.md)** - 📊 Complete Lab 2 submission report
  - Docker & Kubernetes integration explanation
  - Kafka architecture and event flow
  - MongoDB and Redux implementation
  - Performance testing results
  - Screenshots and evidence
- **[SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)** - ✅ Pre-submission checklist
  - All parts verification
  - File organization
  - Quality checks
  - Testing procedures
- **[SCREENSHOT_GUIDE.md](./SCREENSHOT_GUIDE.md)** - 📸 Screenshot capture guide
  - Required screenshots list
  - Capture instructions
  - Organization tips

### Verification
- **[PART2_VERIFICATION.md](./PART2_VERIFICATION.md)** - Part 2 implementation checklist
  - Requirements verification
  - File structure check
  - Testing procedures

## 🚀 Quick Links

### Deployment Scripts
- `../deploy.sh` - Deploy all services to Kubernetes
- `../deploy-kafka.sh` - Deploy Kafka infrastructure
- `../docker-compose.yml` - Local development with Docker Compose

### Source Code
- `../backend/src/kafka/` - Kafka producer/consumer services
- `../k8s/` - Kubernetes manifests
- `../frontend/` - React frontend
- `../ai-agent/` - Python AI service

## 📖 How to Use This Guide

1. **For Docker & Kubernetes Setup:**
   - Read [DOCKER_KUBERNETES.md](./DOCKER_KUBERNETES.md)
   - Follow deployment steps
   - Run `../deploy.sh`

2. **For Kafka Integration:**
   - Read [KAFKA_SETUP.md](./KAFKA_SETUP.md)
   - Understand the booking flow
   - Test with `docker-compose up -d`

3. **For Verification:**
   - Check [PART2_VERIFICATION.md](./PART2_VERIFICATION.md)
   - Run test commands
   - Collect screenshots for report

## 🎯 Lab 2 Parts

- [x] **Part 1:** Docker & Kubernetes Setup (15 points) ✅
- [x] **Part 2:** Kafka for Asynchronous Messaging (10 points) ✅
- [x] **Part 3:** MongoDB (5 points) ✅
- [x] **Part 4:** Redux Integration (5 points) ✅
- [x] **Part 5:** JMeter Performance Testing (5 points) ✅

---

**Note:** All future documentation will be created in this `Guide/` folder.

