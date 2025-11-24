#!/bin/bash

# Airbnb JMeter Load Testing Script
# This script runs load tests with different user counts and generates reports

set -e

echo "🚀 Airbnb JMeter Load Testing Suite"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if JMeter is installed
if ! command -v jmeter &> /dev/null; then
    echo "❌ JMeter not found. Please install Apache JMeter first."
    echo ""
    echo "Installation:"
    echo "  macOS: brew install jmeter"
    echo "  Linux: apt-get install jmeter or download from https://jmeter.apache.org"
    exit 1
fi

# Directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
JMETER_DIR="$(dirname "$SCRIPT_DIR")"
TEST_PLANS_DIR="$JMETER_DIR/test-plans"
RESULTS_DIR="$JMETER_DIR/results"
REPORTS_DIR="$JMETER_DIR/reports"

# Create directories
mkdir -p "$RESULTS_DIR"
mkdir -p "$REPORTS_DIR"

# User counts to test
USER_COUNTS=(100 200 300 400 500)

# Test plan
TEST_PLAN="${1:-$TEST_PLANS_DIR/04-complete-load-test.jmx}"

if [ ! -f "$TEST_PLAN" ]; then
    echo "❌ Test plan not found: $TEST_PLAN"
    exit 1
fi

echo ""
echo "📋 Test Plan: $(basename "$TEST_PLAN")"
echo "📊 User Counts: ${USER_COUNTS[@]}"
echo ""

# Check if server is running
echo "🔍 Checking if backend server is running..."
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "⚠️  Warning: Backend server not responding at http://localhost:5000"
    echo "    Please start the server before running tests"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Determine last user count for spacing logic
LAST_INDEX=$((${#USER_COUNTS[@]} - 1))

# Run tests for each user count
for INDEX in "${!USER_COUNTS[@]}"; do
    USERS=${USER_COUNTS[$INDEX]}
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Running test with ${USERS} concurrent users${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    TIMESTAMP=$(date +%Y-%m-%d-%H-%M-%S)
    RESULT_FILE="$RESULTS_DIR/results-${USERS}users-${TIMESTAMP}.jtl"
    REPORT_DIR="$REPORTS_DIR/report-${USERS}users-${TIMESTAMP}"
    
    # Run JMeter test
    jmeter -n \
        -t "$TEST_PLAN" \
        -Jusers=$USERS \
        -l "$RESULT_FILE" \
        -e -o "$REPORT_DIR"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Test completed successfully${NC}"
        echo "   Results: $RESULT_FILE"
        echo "   Report:  $REPORT_DIR/index.html"
    else
        echo "❌ Test failed"
    fi
    
    # Wait before next test
    if [ "$INDEX" -lt "$LAST_INDEX" ]; then
        echo ""
        echo "⏳ Waiting 30 seconds before next test..."
        sleep 30
    fi
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Results Summary:"
echo "   Results files: $RESULTS_DIR"
echo "   HTML reports:  $REPORTS_DIR"
echo ""
echo "📈 To view reports:"
echo "   open $REPORTS_DIR/report-*users-*/index.html"
echo ""
echo "🔍 To analyze results:"
echo "   python scripts/analyze-results.py"

