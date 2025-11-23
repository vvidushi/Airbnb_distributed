# 📊 JMeter Performance Testing

Apache JMeter load testing suite for the Airbnb application. Tests critical APIs including authentication, property search, and booking processing under various load conditions.

## 📁 Directory Structure

```
jmeter/
├── test-plans/              # JMeter test plan files (.jmx)
│   ├── 01-authentication-test.jmx
│   ├── 02-property-search-test.jmx
│   ├── 03-booking-test.jmx
│   └── 04-complete-load-test.jmx
├── results/                 # Test results (.jtl files)
├── reports/                 # HTML reports and graphs
└── scripts/                 # Automation scripts
    ├── run-load-tests.sh   # Run all tests
    └── analyze-results.py  # Analyze and graph results
```

## 🚀 Quick Start

### Prerequisites

1. **Install Apache JMeter**
   ```bash
   # macOS
   brew install jmeter
   
   # Linux (Debian/Ubuntu)
   sudo apt-get install jmeter
   
   # Manual download
   # https://jmeter.apache.org/download_jmeter.cgi
   ```

2. **Install Python dependencies** (for analysis script)
   ```bash
   pip install matplotlib numpy
   ```

3. **Start the Airbnb backend**
   ```bash
   cd backend
   npm start
   # Server should be running on http://localhost:5000
   ```

### Running Tests

#### Option 1: Automated Test Suite (Recommended)

Run all tests for 100, 200, 300, 400, and 500 concurrent users:

```bash
cd jmeter
./scripts/run-load-tests.sh
```

This will:
- Run tests with 100, 200, 300, 400, and 500 concurrent users
- Generate .jtl result files
- Create HTML reports for each test
- Wait 30 seconds between tests to let the system stabilize

#### Option 2: Run Individual Tests

**Authentication Test:**
```bash
jmeter -n -t test-plans/01-authentication-test.jmx \
  -Jusers=100 \
  -l results/auth-100users.jtl \
  -e -o reports/auth-100users
```

**Property Search Test:**
```bash
jmeter -n -t test-plans/02-property-search-test.jmx \
  -Jusers=200 \
  -l results/search-200users.jtl \
  -e -o reports/search-200users
```

**Booking Test:**
```bash
jmeter -n -t test-plans/03-booking-test.jmx \
  -Jusers=300 \
  -l results/booking-300users.jtl \
  -e -o reports/booking-300users
```

**Complete Load Test (Travelers + Owners):**
```bash
jmeter -n -t test-plans/04-complete-load-test.jmx \
  -Jusers=500 \
  -l results/complete-500users.jtl \
  -e -o reports/complete-500users
```

#### Option 3: Run with JMeter GUI (for test development)

```bash
jmeter -t test-plans/04-complete-load-test.jmx
```

**Note:** Don't run load tests from the GUI - use CLI for actual testing.

## 📈 Analyzing Results

### Automated Analysis

After running tests, analyze all results and generate graphs:

```bash
cd jmeter
python scripts/analyze-results.py
```

This will:
- Parse all .jtl result files
- Calculate performance metrics
- Generate performance graphs
- Provide bottleneck analysis
- Create a summary report

### Manual Analysis

View HTML reports:
```bash
open reports/report-*users-*/index.html
```

View raw results:
```bash
cat results/*.jtl
```

## 📊 Test Plans

### 1. Authentication Test (`01-authentication-test.jmx`)

**Purpose:** Test user login endpoint under load

**Endpoints:**
- `POST /api/auth/login`

**Metrics:**
- Response time
- Success rate
- Authentication throughput

### 2. Property Search Test (`02-property-search-test.jmx`)

**Purpose:** Test property search and filtering

**Endpoints:**
- `GET /api/properties/search`

**Metrics:**
- Search response time
- Query performance
- Concurrent search handling

### 3. Booking Test (`03-booking-test.jmx`)

**Purpose:** Test complete booking flow

**Flow:**
1. User login
2. Search properties
3. Create booking
4. Get my bookings

**Endpoints:**
- `POST /api/auth/login`
- `GET /api/properties/search`
- `POST /api/bookings`
- `GET /api/bookings/traveler`

### 4. Complete Load Test (`04-complete-load-test.jmx`)

**Purpose:** Simulate realistic concurrent usage

**User Distribution:**
- 70% Travelers (browsing, booking)
- 30% Owners (managing properties, bookings)

**Traveler Flow:**
1. Login
2. Search properties (random locations)
3. Create booking (random property)
4. View bookings

**Owner Flow:**
1. Login
2. Get my properties
3. Get bookings for my properties

**Think Times:** Randomized delays to simulate human behavior

## 📋 Performance Metrics

The tests measure:

1. **Response Time**
   - Average response time
   - 90th percentile
   - 95th percentile
   - 99th percentile

2. **Throughput**
   - Requests per second
   - Concurrent request handling

3. **Error Rate**
   - HTTP error codes
   - Failed requests
   - Success percentage

4. **Latency**
   - Network latency
   - Server processing time

## 🎯 Test Configuration

### User Counts

Tests are run with: **100, 200, 300, 400, 500** concurrent users

### Ramp-Up Time

- **60 seconds** - gradual increase to target user count

### Think Time

- Travelers: 500ms - 2000ms between requests
- Owners: 500ms - 1000ms between requests

### Loop Count

- Travelers: 2 iterations
- Owners: 2 iterations

## 📊 Expected Results

### Baseline Performance (100 users)

- Authentication: < 100ms average
- Property Search: < 200ms average
- Booking Creation: < 150ms average
- Error Rate: < 0.5%

### Scalability Targets

| Users | Avg Response Time | Error Rate | Throughput |
|-------|-------------------|------------|------------|
| 100   | < 150ms          | < 1%       | > 50 req/s |
| 200   | < 250ms          | < 2%       | > 90 req/s |
| 300   | < 400ms          | < 3%       | > 120 req/s|
| 400   | < 600ms          | < 5%       | > 150 req/s|
| 500   | < 800ms          | < 8%       | > 180 req/s|

## 🔍 Bottleneck Analysis

### Common Bottlenecks

1. **Database Connections**
   - Symptom: High response time, connection errors
   - Solution: Increase connection pool size

2. **Session Management**
   - Symptom: High latency on authenticated requests
   - Solution: Optimize session storage (MongoDB)

3. **Network Bandwidth**
   - Symptom: Increasing response times under load
   - Solution: Scale horizontally, use CDN

4. **CPU/Memory**
   - Symptom: Degraded performance over time
   - Solution: Optimize code, scale vertically

## 📝 Report Template

### Performance Test Summary

**Test Date:** [DATE]

**System Under Test:**
- Backend: Node.js + Express
- Database: MySQL / MongoDB
- Frontend: React

**Test Results:**

| Users | Avg Response (ms) | P95 (ms) | Error % | Throughput (req/s) |
|-------|-------------------|----------|---------|-------------------|
| 100   |                   |          |         |                   |
| 200   |                   |          |         |                   |
| 300   |                   |          |         |                   |
| 400   |                   |          |         |                   |
| 500   |                   |          |         |                   |

**Key Findings:**
- [Finding 1]
- [Finding 2]
- [Finding 3]

**Bottlenecks Identified:**
- [Bottleneck 1]
- [Bottleneck 2]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]

## 🛠️ Troubleshooting

### Server not responding

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Start backend
cd backend && npm start
```

### JMeter not found

```bash
# Install JMeter
brew install jmeter  # macOS

# Or download from: https://jmeter.apache.org
```

### Python analysis script fails

```bash
# Install dependencies
pip install matplotlib numpy

# Run analysis
python scripts/analyze-results.py
```

### No results files

```bash
# Run tests first
./scripts/run-load-tests.sh

# Check results directory
ls -la results/
```

## 📚 Resources

- [Apache JMeter Documentation](https://jmeter.apache.org/usermanual/index.html)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Performance Testing Guide](https://github.com/apache/jmeter/blob/trunk/xdocs/usermanual/best-practices.xml)

## 🎓 Lab Assignment Checklist

- [x] Create JMeter test plans for authentication, property search, and booking
- [x] Implement concurrent traveler and owner simulation
- [x] Test with 100, 200, 300, 400, and 500 concurrent users
- [ ] Run all tests and collect results
- [ ] Generate performance graphs
- [ ] Analyze bottlenecks
- [ ] Document findings in report
- [ ] Include screenshots of JMeter results
- [ ] Submit .jmx files and analysis

## 📧 Support

For issues or questions:
- Check the troubleshooting section
- Review JMeter logs in `jmeter.log`
- Consult the official JMeter documentation

