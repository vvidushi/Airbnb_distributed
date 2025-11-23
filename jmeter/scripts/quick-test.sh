#!/bin/bash

# Quick JMeter Test - Run a single test quickly for verification

set -e

echo "🚀 Quick JMeter Test"
echo "===================="
echo ""

# Check if JMeter is installed
if ! command -v jmeter &> /dev/null; then
    echo "❌ JMeter not found. Please install Apache JMeter first."
    echo ""
    echo "Installation:"
    echo "  macOS: brew install jmeter"
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

# Default values
USERS=${1:-100}
TEST_PLAN="${2:-$TEST_PLANS_DIR/04-complete-load-test.jmx}"

echo "📋 Test Configuration:"
echo "   Users: $USERS"
echo "   Test Plan: $(basename "$TEST_PLAN")"
echo ""

# Check if server is running
echo "🔍 Checking if backend server is running..."
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "❌ Backend server not responding at http://localhost:5000"
    echo "   Please start the server first:"
    echo "   cd backend && npm start"
    exit 1
fi

echo "✅ Backend server is running"
echo ""

# Generate filenames
TIMESTAMP=$(date +%Y-%m-%d-%H-%M-%S)
RESULT_FILE="$RESULTS_DIR/quick-test-${USERS}users-${TIMESTAMP}.jtl"
REPORT_DIR="$REPORTS_DIR/quick-test-${USERS}users-${TIMESTAMP}"

echo "🏃 Running JMeter test..."
echo ""

# Run JMeter test
jmeter -n \
    -t "$TEST_PLAN" \
    -Jusers=$USERS \
    -l "$RESULT_FILE" \
    -e -o "$REPORT_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test completed successfully!"
    echo ""
    echo "📊 Results:"
    echo "   Result file: $RESULT_FILE"
    echo "   HTML report: $REPORT_DIR/index.html"
    echo ""
    echo "📈 View report:"
    echo "   open $REPORT_DIR/index.html"
    echo ""
    echo "📊 Analyze results:"
    echo "   python scripts/analyze-results.py"
else
    echo ""
    echo "❌ Test failed"
    exit 1
fi

