# ✅ Lab 2 Submission Checklist

Use this checklist to ensure you have everything ready for submission.

---

## 📋 Part 1: Docker & Kubernetes (15 points)

### Code & Configuration
- [ ] `backend/Dockerfile` - Backend containerization
- [ ] `frontend/Dockerfile` - Frontend containerization
- [ ] `frontend/nginx.conf` - Nginx configuration
- [ ] `ai-agent/Dockerfile` - AI agent containerization
- [ ] All Dockerfiles build successfully
- [ ] `docker-compose.yml` - Local testing setup

### Kubernetes Manifests (`k8s/` directory)
- [ ] `namespace.yaml` - airbnb-lab namespace
- [ ] `mysql-secret.yaml` - Database credentials
- [ ] `mysql-pvc.yaml` - MySQL persistent volume
- [ ] `mysql-deployment.yaml` - MySQL database
- [ ] `mongodb-deployment.yaml` - MongoDB database
- [ ] `backend-configmap.yaml` - Backend environment
- [ ] `backend-deployment.yaml` - Backend service
- [ ] `ai-agent-configmap.yaml` - AI agent config
- [ ] `ai-agent-secret.yaml` - API keys
- [ ] `ai-agent-deployment.yaml` - AI agent service
- [ ] `frontend-deployment.yaml` - Frontend service

### Deployment Scripts
- [ ] `deploy.sh` - Automated Kubernetes deployment
- [ ] Script runs without errors
- [ ] All pods reach "Running" state

### Documentation
- [ ] **[Guide/DOCKER_KUBERNETES.md](./DOCKER_KUBERNETES.md)** - Complete guide
- [ ] Includes architecture diagram
- [ ] Includes deployment instructions
- [ ] Includes troubleshooting section

### Screenshots
- [ ] Docker images list
- [ ] Running containers
- [ ] Kubernetes pods (kubectl get pods)
- [ ] Kubernetes services (kubectl get svc)
- [ ] Application running in browser

---

## 📋 Part 2: Kafka (10 points)

### Kafka Infrastructure
- [ ] `k8s/zookeeper-deployment.yaml` - Zookeeper
- [ ] `k8s/kafka-deployment.yaml` - Kafka broker
- [ ] `k8s/kafka-producer-deployment.yaml` - Producer service
- [ ] `k8s/kafka-consumer-deployment.yaml` - Consumer service

### Producer Service
- [ ] `backend/src/kafka/kafkaClient.js` - Kafka client
- [ ] `backend/src/kafka/producer-service.js` - Producer implementation
- [ ] Handles booking creation
- [ ] Publishes to `booking-requests` topic

### Consumer Service
- [ ] `backend/src/kafka/consumer-service.js` - Consumer implementation
- [ ] Subscribes to topics
- [ ] Processes booking events
- [ ] Updates database
- [ ] Publishes status updates

### Deployment
- [ ] `deploy-kafka.sh` - Kafka deployment script
- [ ] `docker-compose.yml` updated with Kafka services
- [ ] Kafka topics created automatically

### Documentation
- [ ] **[Guide/KAFKA_SETUP.md](./KAFKA_SETUP.md)** - Complete guide
- [ ] Includes event flow diagram
- [ ] Includes testing instructions
- [ ] Includes verification commands

### Screenshots
- [ ] Kafka topics list
- [ ] Producer publishing event (logs)
- [ ] Consumer processing event (logs)
- [ ] Event flow diagram
- [ ] Kafka broker status

---

## 📋 Part 3: MongoDB (5 points)

### MongoDB Setup
- [ ] `k8s/mongodb-deployment.yaml` - MongoDB deployment
- [ ] `backend/src/config/mongodb.js` - Connection config
- [ ] MongoDB connection successful

### Mongoose Models
- [ ] `backend/src/models/User.js` - User schema
- [ ] `backend/src/models/Property.js` - Property schema
- [ ] `backend/src/models/Booking.js` - Booking schema

### Session Storage
- [ ] `backend/src/config/session-mongo.js` - Session config
- [ ] Sessions stored in MongoDB
- [ ] Session TTL configured

### Password Encryption
- [ ] bcrypt installed (`package.json`)
- [ ] Passwords hashed on signup
- [ ] Password verification on login
- [ ] No plain text passwords in database

### Documentation
- [ ] **[Guide/MONGODB_REDUX_SETUP.md](./MONGODB_REDUX_SETUP.md)** - MongoDB section
- [ ] Includes schema definitions
- [ ] Includes migration guide

### Screenshots
- [ ] MongoDB collections (show dbs, show collections)
- [ ] Session document in MongoDB
- [ ] User document with encrypted password

---

## 📋 Part 4: Redux (5 points)

### Redux Setup
- [ ] Redux Toolkit installed (`package.json`)
- [ ] `frontend/src/redux/store.js` - Store configuration
- [ ] Store integrated in `index.js`

### Redux Slices
- [ ] `frontend/src/redux/slices/authSlice.js` - Authentication
- [ ] `frontend/src/redux/slices/propertiesSlice.js` - Properties
- [ ] `frontend/src/redux/slices/bookingsSlice.js` - Bookings

### Auth State Management
- [ ] Login action (async thunk)
- [ ] Logout action
- [ ] Check auth action
- [ ] User stored in Redux state
- [ ] JWT token handling

### Property State Management
- [ ] Search properties action
- [ ] Fetch property details action
- [ ] Property list in Redux state
- [ ] Search filters in Redux state

### Booking State Management
- [ ] Create booking action
- [ ] Fetch my bookings action
- [ ] Add to favorites action
- [ ] Bookings array in Redux state
- [ ] Favorites array in Redux state

### Component Integration
- [ ] At least 3 components use Redux (useSelector, useDispatch)
- [ ] Example: Login, Dashboard, Bookings

### Documentation
- [ ] **[Guide/MONGODB_REDUX_SETUP.md](./MONGODB_REDUX_SETUP.md)** - Redux section
- [ ] Includes state flow diagram
- [ ] Includes component examples

### Screenshots
- [ ] Redux DevTools - Store overview
- [ ] Redux DevTools - Auth state
- [ ] Redux DevTools - Properties state
- [ ] Redux DevTools - Bookings state
- [ ] Redux DevTools - Action history

---

## 📋 Part 5: JMeter (5 points)

### Test Plans
- [ ] `jmeter/test-plans/01-authentication-test.jmx`
- [ ] `jmeter/test-plans/02-property-search-test.jmx`
- [ ] `jmeter/test-plans/03-booking-test.jmx`
- [ ] `jmeter/test-plans/04-complete-load-test.jmx`

### Test Execution
- [ ] Tests run for 100 users
- [ ] Tests run for 200 users
- [ ] Tests run for 300 users
- [ ] Tests run for 400 users
- [ ] Tests run for 500 users

### Results
- [ ] `.jtl` result files for each test
- [ ] HTML reports generated
- [ ] Python analysis script run
- [ ] Performance graphs generated

### Analysis
- [ ] Summary table with all metrics
- [ ] Response time analysis
- [ ] Throughput analysis
- [ ] Error rate analysis
- [ ] Bottleneck identification
- [ ] "Why, why not, how" analysis

### Documentation
- [ ] **[Guide/JMETER_TESTING.md](./JMETER_TESTING.md)** - Complete guide
- [ ] `jmeter/README.md` - Quick reference
- [ ] `jmeter/RESULTS_TEMPLATE.md` - Report template filled

### Screenshots
- [ ] JMeter Summary Report (100 users)
- [ ] JMeter Summary Report (500 users)
- [ ] Response time graph
- [ ] Throughput graph
- [ ] Python analysis output
- [ ] Test execution terminal

---

## 📋 Final Report

### Main Report Document
- [ ] **[Guide/LAB2_REPORT.md](./LAB2_REPORT.md)** completed
- [ ] Executive summary
- [ ] Part 1: Docker & Kubernetes section
- [ ] Part 2: Kafka section
- [ ] Part 3: MongoDB section
- [ ] Part 4: Redux section
- [ ] Part 5: JMeter section
- [ ] Architecture overview
- [ ] All screenshots included
- [ ] Challenges & solutions
- [ ] Conclusion

### Report Content Requirements
- [ ] Describes Docker integration
- [ ] Describes Kubernetes orchestration
- [ ] Describes Kafka event flow
- [ ] Explains Redux state management benefits
- [ ] Includes performance test results
- [ ] Includes graphs (response time, throughput)
- [ ] Includes bottleneck analysis
- [ ] Includes optimization recommendations

### Screenshots (23 total)
- [ ] All 23 screenshots captured
- [ ] Screenshots organized in `screenshots/` folder
- [ ] Screenshots embedded in report
- [ ] Screenshots have captions

---

## 📋 GitHub Repository

### Code Organization
- [ ] All code committed to Git
- [ ] Meaningful commit messages
- [ ] No sensitive data (API keys, passwords)
- [ ] `.gitignore` properly configured

### README.md
- [ ] Updated with Lab 2 information
- [ ] Links to all documentation
- [ ] Installation instructions
- [ ] Running instructions

### Directory Structure
```
✓ backend/
  ✓ src/kafka/          # Kafka producer/consumer
  ✓ src/models/         # Mongoose models
  ✓ Dockerfile
✓ frontend/
  ✓ src/redux/          # Redux store and slices
  ✓ Dockerfile
  ✓ nginx.conf
✓ ai-agent/
  ✓ Dockerfile
✓ k8s/                  # All Kubernetes manifests
✓ jmeter/               # JMeter test plans and results
✓ Guide/                # All documentation
  ✓ LAB2_REPORT.md     # Main report
  ✓ DOCKER_KUBERNETES.md
  ✓ KAFKA_SETUP.md
  ✓ MONGODB_REDUX_SETUP.md
  ✓ JMETER_TESTING.md
✓ deploy.sh
✓ deploy-kafka.sh
✓ docker-compose.yml
```

### Documentation Files
- [ ] All `.md` files in `Guide/` folder
- [ ] Links updated in main README
- [ ] No broken links

---

## 📋 Submission Files

### Required Files to Submit

**Code:**
- [ ] Entire GitHub repository (or ZIP)

**Dockerfiles:**
- [ ] `backend/Dockerfile`
- [ ] `frontend/Dockerfile`
- [ ] `ai-agent/Dockerfile`

**Kubernetes Manifests:**
- [ ] All files in `k8s/` directory (12+ files)

**Kafka Code:**
- [ ] `backend/src/kafka/kafkaClient.js`
- [ ] `backend/src/kafka/producer-service.js`
- [ ] `backend/src/kafka/consumer-service.js`

**MongoDB Code:**
- [ ] `backend/src/config/mongodb.js`
- [ ] `backend/src/models/*.js` (3 files)

**Redux Code:**
- [ ] `frontend/src/redux/store.js`
- [ ] `frontend/src/redux/slices/*.js` (3 files)

**JMeter:**
- [ ] All `.jmx` files (4 files)
- [ ] Summary of results (PDF or Markdown)

**Documentation:**
- [ ] `Guide/LAB2_REPORT.md` (Main report)
- [ ] All supporting documentation

**Screenshots:**
- [ ] All 23 screenshots
- [ ] Organized folder

---

## 📋 Pre-Submission Testing

### Deployment Test
```bash
# Clean environment
kubectl delete namespace airbnb-lab

# Deploy from scratch
./deploy.sh

# Verify all pods running
kubectl get pods -n airbnb-lab

# All should be "Running"
```

### Functional Test
```bash
# Frontend accessible
curl http://localhost:3000

# Backend health check
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@test.com","password":"password123"}'
```

### Kafka Test
```bash
# Create a booking (should publish to Kafka)
# Check producer logs
kubectl logs deployment/kafka-producer -n airbnb-lab

# Check consumer logs
kubectl logs deployment/kafka-consumer -n airbnb-lab

# Should see event flow
```

### JMeter Test
```bash
cd jmeter
./scripts/quick-test.sh 100

# Should complete without errors
```

---

## 📋 Quality Checks

### Code Quality
- [ ] No console.log in production code
- [ ] No hardcoded credentials
- [ ] Consistent code formatting
- [ ] No unused imports
- [ ] No commented-out code blocks

### Documentation Quality
- [ ] No spelling errors
- [ ] Clear and concise explanations
- [ ] Code examples properly formatted
- [ ] All commands tested
- [ ] All links work

### Screenshot Quality
- [ ] High resolution (at least 1920x1080)
- [ ] Clear and readable text
- [ ] Relevant content visible
- [ ] Properly cropped
- [ ] Consistent styling

---

## 📋 Final Checks Before Submission

- [ ] All tests pass
- [ ] All pods running
- [ ] All screenshots captured
- [ ] All documentation complete
- [ ] Report reviewed for errors
- [ ] GitHub repository up to date
- [ ] No sensitive data exposed
- [ ] File names follow naming convention
- [ ] README updated
- [ ] Submission files organized

---

## 🎯 Point Distribution

| Part | Points | Status |
|------|--------|--------|
| Part 1: Docker & Kubernetes | 15 | [ ] |
| Part 2: Kafka | 10 | [ ] |
| Part 3: MongoDB | 5 | [ ] |
| Part 4: Redux | 5 | [ ] |
| Part 5: JMeter | 5 | [ ] |
| **Total** | **40** | [ ] |

---

## 📧 Submission Method

Follow your instructor's submission guidelines:
- [ ] GitHub repository link
- [ ] ZIP file upload
- [ ] Canvas submission
- [ ] Email submission
- [ ] Other: _______________

---

**Good luck with your submission! 🚀**

**Date:** _______________  
**Submitted By:** _______________  
**Partner:** _______________  

