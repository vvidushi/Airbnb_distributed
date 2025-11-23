# 📊 Part 5: JMeter Performance Testing Guide

Complete guide for JMeter performance testing of the Airbnb application.

---

## 📋 Overview

This guide covers:
- JMeter installation and setup
- Running performance tests for 100, 200, 300, 400, and 500 concurrent users
- Analyzing test results and generating performance graphs
- Identifying bottlenecks and optimization opportunities

---

## 🎯 Test Objectives

### Lab Requirements

✅ Test critical APIs:
- User authentication (login/signup)
- Property data fetching (search, filters)
- Booking processing (create, view, manage)

✅ Simulate concurrent users:
- 70% Travelers (browsing, booking)
- 30% Owners (managing properties)

✅ Load levels:
- 100, 200, 300, 400, and 500 concurrent users

✅ Metrics to measure:
- Response times (average, 95th percentile)
- Throughput (requests/second)
- Error rates

---

## 🛠️ Installation

### 1. Install Apache JMeter

**macOS:**
```bash
brew install jmeter
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install jmeter
```

**Manual Installation:**
1. Download from https://jmeter.apache.org/download_jmeter.cgi
2. Extract the archive
3. Add `bin/` directory to your PATH

**Verify installation:**
```bash
jmeter --version
# Should output: Apache JMeter version X.X
```

### 2. Install Python Analysis Dependencies

```bash
cd jmeter/scripts
pip install -r requirements.txt
```

This installs:
- `matplotlib` - for generating performance graphs
- `numpy` - for statistical analysis

---

## 🚀 Running Tests

### Preparation

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Verify server is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Ensure database has test data:**
   ```bash
   cd database
   mysql -u root -p airbnb_db < seed.sql
   ```

### Automated Testing (Recommended)

Run all tests automatically:

```bash
cd jmeter
./scripts/run-load-tests.sh
```

This script will:
- ✅ Check if backend is running
- ✅ Run tests for 100, 200, 300, 400, 500 users
- ✅ Generate .jtl result files
- ✅ Create HTML reports
- ✅ Wait 30 seconds between tests

**Output:**
```
🚀 Airbnb JMeter Load Testing Suite
====================================

📋 Test Plan: 04-complete-load-test.jmx
📊 User Counts: 100 200 300 400 500

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Running test with 100 concurrent users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Test completed successfully
   Results: results/results-100users-2025-11-23-12-00-00.jtl
   Report:  reports/report-100users-2025-11-23-12-00-00/index.html
```

### Manual Testing

Run individual tests with specific user counts:

```bash
# Authentication test
jmeter -n \
  -t test-plans/01-authentication-test.jmx \
  -Jusers=100 \
  -l results/auth-100users.jtl \
  -e -o reports/auth-100users

# Property search test
jmeter -n \
  -t test-plans/02-property-search-test.jmx \
  -Jusers=200 \
  -l results/search-200users.jtl \
  -e -o reports/search-200users

# Booking test
jmeter -n \
  -t test-plans/03-booking-test.jmx \
  -Jusers=300 \
  -l results/booking-300users.jtl \
  -e -o reports/booking-300users

# Complete load test (recommended)
jmeter -n \
  -t test-plans/04-complete-load-test.jmx \
  -Jusers=500 \
  -l results/complete-500users.jtl \
  -e -o reports/complete-500users
```

**JMeter CLI Parameters:**
- `-n` - Non-GUI mode (required for load tests)
- `-t` - Test plan file (.jmx)
- `-Jusers=X` - Number of concurrent users
- `-l` - Output results file (.jtl)
- `-e` - Generate dashboard report
- `-o` - Output directory for dashboard

---

## 📊 Test Plans

### 1. Authentication Test

**File:** `test-plans/01-authentication-test.jmx`

**Endpoints Tested:**
- `POST /api/auth/login`

**What it tests:**
- User login performance under load
- Session creation efficiency
- Authentication throughput

**Configuration:**
- Users: Configurable (default 100)
- Ramp-up: 60 seconds
- Iterations: 1 per user

### 2. Property Search Test

**File:** `test-plans/02-property-search-test.jmx`

**Endpoints Tested:**
- `GET /api/properties/search?location=X&minPrice=Y&maxPrice=Z`

**What it tests:**
- Search query performance
- Database query efficiency
- Filter handling under load

**Configuration:**
- Users: Configurable (default 100)
- Ramp-up: 60 seconds
- Iterations: 3 per user (multiple searches)

### 3. Booking Test

**File:** `test-plans/03-booking-test.jmx`

**Flow:**
1. Login
2. Search properties
3. Create booking
4. View my bookings

**Endpoints Tested:**
- `POST /api/auth/login`
- `GET /api/properties/search`
- `POST /api/bookings`
- `GET /api/bookings/traveler`

**What it tests:**
- Complete booking workflow
- Multi-step transaction handling
- Session persistence

### 4. Complete Load Test ⭐ (Primary Test)

**File:** `test-plans/04-complete-load-test.jmx`

**User Simulation:**
- **70% Travelers** (browsing and booking)
- **30% Owners** (managing properties)

**Traveler Flow:**
1. Login as traveler
2. Search properties (random locations)
3. Create booking (random property)
4. View my bookings
5. Repeat 2 times

**Owner Flow:**
1. Login as owner
2. Get my properties
3. View bookings for my properties
4. Repeat 2 times

**Think Times:** Randomized delays (500ms-2000ms) to simulate human behavior

**Configuration:**
- Total Users: Configurable (e.g., 500 total = 350 travelers + 150 owners)
- Ramp-up: 60 seconds
- Iterations: 2 per user type

---

## 📈 Analyzing Results

### Automated Analysis

After running tests, analyze all results:

```bash
cd jmeter
python scripts/analyze-results.py
```

**Output:**
```
🔬 JMeter Results Analyzer
================================================================

📊 Found 5 result files
   Analyzing: results-100users-2025-11-23-12-00-00.jtl
   Analyzing: results-200users-2025-11-23-12-15-00.jtl
   ...

================================================================
PERFORMANCE ANALYSIS REPORT
================================================================

📊 100 Concurrent Users:
   Average Response Time: 125.50 ms
   95th Percentile:       245.30 ms
   Error Rate:            0.25%
   Throughput:            65.30 req/s
   Total Requests:        1250

[... more results ...]

================================================================
PERFORMANCE INSIGHTS
================================================================

📈 Response Time Degradation:
   From 100 to 500 users: 285% increase
   
⚠️  Bottleneck Detected:
   Highest error rate at 500 users: 6.75%
   Recommendation: Optimize for loads > 500 users

📈 Graph saved: reports/performance-analysis-20251123-120000.png
```

**The script generates:**
- Summary table with all metrics
- Performance graphs (4 subplots)
- Bottleneck identification
- Recommendations

### View HTML Reports

Open generated HTML reports in browser:

```bash
# View all reports
open jmeter/reports/report-*users-*/index.html

# View specific report
open jmeter/reports/report-500users-2025-11-23-12-00-00/index.html
```

**HTML Report Contents:**
- Dashboard overview
- Response time graphs
- Throughput over time
- Error statistics
- Top 5 slowest requests

### Manual Analysis

View raw results:

```bash
# View .jtl file
head -20 jmeter/results/results-100users-*.jtl

# Count total requests
wc -l jmeter/results/results-100users-*.jtl

# Filter errors
grep 'false' jmeter/results/results-100users-*.jtl
```

---

## 📊 Performance Metrics Explained

### Response Time

- **Average:** Mean response time across all requests
- **Median (50th percentile):** Middle value
- **90th Percentile:** 90% of requests faster than this
- **95th Percentile:** 95% of requests faster than this (important metric!)
- **99th Percentile:** 99% of requests faster than this

**Why P95 matters:**
- Represents "typical worst-case" user experience
- More reliable than max (which can be outliers)
- Industry standard for SLAs

### Throughput

- **Requests/second:** How many requests the server handles per second
- Higher is better
- Should increase linearly with users (up to a point)
- Plateau indicates bottleneck

### Error Rate

- **Percentage of failed requests**
- Lower is better (target: < 1%)
- Types of errors:
  - 4xx: Client errors (bad requests)
  - 5xx: Server errors (crashes, timeouts)
  - Connection errors: Network issues

### Latency

- **Network latency:** Time for data to travel
- **Server processing time:** Time to execute request
- **Total response time:** Latency + Processing

---

## 🎯 Expected Results & Targets

### Baseline (100 Users)

| Metric | Target | Acceptable |
|--------|--------|------------|
| Avg Response Time | < 100ms | < 150ms |
| P95 Response Time | < 200ms | < 300ms |
| Error Rate | < 0.5% | < 1% |
| Throughput | > 50 req/s | > 40 req/s |

### Scaling Targets

| Users | Avg Response | P95 Response | Error Rate | Throughput |
|-------|--------------|--------------|------------|------------|
| 100   | < 150ms      | < 300ms      | < 1%       | > 50 req/s |
| 200   | < 250ms      | < 500ms      | < 2%       | > 90 req/s |
| 300   | < 400ms      | < 700ms      | < 3%       | > 120 req/s|
| 400   | < 600ms      | < 900ms      | < 5%       | > 150 req/s|
| 500   | < 800ms      | < 1000ms     | < 8%       | > 180 req/s|

**Performance Goals:**
- ✅ Linear scaling up to 300 users
- ✅ Graceful degradation 300-500 users
- ✅ Error rates stay below 10% at peak load

---

## 🔍 Bottleneck Analysis

### Common Bottlenecks

#### 1. Database Connection Pool

**Symptoms:**
- Response time increases sharply at specific user count
- Errors like "Too many connections"
- Database CPU usage < 50%

**Diagnosis:**
```javascript
// Check pool settings in backend
DB_CONNECTION_LIMIT=10  // Too low!
```

**Solution:**
```javascript
// Increase pool size
DB_CONNECTION_LIMIT=50
DB_QUEUE_LIMIT=0
```

#### 2. Session Storage

**Symptoms:**
- High latency on authenticated requests
- Memory usage increasing
- Slower over time

**Diagnosis:**
- Using in-memory sessions without MongoDB
- Session lookup inefficient

**Solution:**
- Use MongoDB session store (already implemented)
- Add session indexes
- Implement session cleanup

#### 3. Unoptimized Queries

**Symptoms:**
- Specific endpoints very slow
- Database CPU high
- Slow query logs

**Diagnosis:**
```sql
-- Check slow queries
SELECT * FROM mysql.slow_log;
```

**Solution:**
```sql
-- Add indexes
CREATE INDEX idx_location ON properties(location);
CREATE INDEX idx_dates ON bookings(check_in, check_out);
CREATE INDEX idx_status ON bookings(status);
```

#### 4. CPU/Memory Limits

**Symptoms:**
- Performance degrades over time
- Node process using 100% CPU
- Out of memory errors

**Diagnosis:**
```bash
# Monitor during test
top
htop
node --max-old-space-size=4096 server.js
```

**Solution:**
- Optimize code (remove console.logs)
- Increase Node memory limit
- Scale horizontally (multiple instances)

#### 5. Network Bandwidth

**Symptoms:**
- Response size large
- Bandwidth saturated
- Slow even on fast servers

**Diagnosis:**
```bash
# Check response sizes
curl -w "%{size_download}\n" http://localhost:5000/api/properties
```

**Solution:**
- Enable gzip compression
- Paginate large result sets
- Remove unnecessary fields from responses

---

## 📝 Creating Your Report

Use the template: `jmeter/RESULTS_TEMPLATE.md`

### Steps

1. **Run all tests**
   ```bash
   cd jmeter
   ./scripts/run-load-tests.sh
   ```

2. **Analyze results**
   ```bash
   python scripts/analyze-results.py
   ```

3. **Take screenshots**
   - JMeter HTML reports (dashboard)
   - Python analysis graphs
   - Key metrics tables

4. **Fill in template**
   - Copy `RESULTS_TEMPLATE.md` to `MY_RESULTS.md`
   - Fill in all sections with your data
   - Include screenshots
   - Add analysis and findings

5. **Key sections to complete:**
   - ✅ Summary table with all metrics
   - ✅ Performance graphs
   - ✅ Bottleneck analysis
   - ✅ Why/Why not/How analysis
   - ✅ Recommendations

---

## 🎓 Lab Submission Checklist

### Required Files

- [ ] All 4 JMeter test plans (.jmx files)
- [ ] Test results (.jtl files for each user count)
- [ ] HTML reports (at least for 100, 300, 500 users)
- [ ] Performance analysis graph (PNG)
- [ ] Completed results report (PDF/MD)

### Required Screenshots

- [ ] JMeter Summary Report (500 users)
- [ ] JMeter Aggregate Report
- [ ] Python analysis graph (4 subplots)
- [ ] HTML dashboard overview
- [ ] Response time over time graph

### Required Analysis

- [ ] Summary table (100-500 users)
- [ ] Performance trend analysis
- [ ] At least 2 bottlenecks identified
- [ ] Root cause analysis for each bottleneck
- [ ] "Why, Why not, How" analysis
- [ ] Optimization recommendations

---

## 🛠️ Troubleshooting

### Backend not responding

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Check backend logs
cd backend
npm start

# Check if port is in use
lsof -i :5000
```

### JMeter errors during test

```bash
# Check JMeter logs
tail -f jmeter/jmeter.log

# Increase JMeter heap size
export HEAP="-Xms1g -Xmx2g"
jmeter -n -t test-plan.jmx ...
```

### Connection timeouts

```bash
# Increase connection limits (macOS)
ulimit -n 10000

# Increase database connections
# Edit backend/.env
DB_CONNECTION_LIMIT=100
```

### Analysis script fails

```bash
# Install dependencies
cd jmeter/scripts
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.7+

# Run with verbose errors
python -v scripts/analyze-results.py
```

### No graphs generated

```bash
# Install matplotlib dependencies (macOS)
brew install python-tk

# Install matplotlib properly
pip uninstall matplotlib
pip install matplotlib --upgrade
```

---

## 📚 Additional Resources

### JMeter Documentation
- [Official User Manual](https://jmeter.apache.org/usermanual/index.html)
- [Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Function Reference](https://jmeter.apache.org/usermanual/functions.html)

### Performance Testing
- [Google SRE Book - Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Martin Fowler - Performance Testing](https://martinfowler.com/bliki/PerformanceTest.html)

### Lab Resources
- Main README: `../README.md`
- JMeter Directory: `../jmeter/README.md`
- Results Template: `../jmeter/RESULTS_TEMPLATE.md`

---

## 🎯 Quick Commands Reference

```bash
# Install JMeter
brew install jmeter  # macOS

# Install Python deps
pip install matplotlib numpy

# Run all tests
cd jmeter && ./scripts/run-load-tests.sh

# Run single test
jmeter -n -t test-plans/04-complete-load-test.jmx -Jusers=100 -l results/test.jtl -e -o reports/test

# Analyze results
python scripts/analyze-results.py

# View report
open reports/report-*users-*/index.html
```

---

**Good luck with your performance testing!** 🚀

