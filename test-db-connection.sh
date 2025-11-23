#!/bin/bash

echo "🔌 Testing Database Connections for DBeaver..."
echo ""

# 1. Test MySQL Connection
echo "🐬 Testing MySQL (Port 3306)..."
if docker exec airbnb-mysql mysql -u root -e "SELECT '✅ MySQL Connection Successful!';" 2>/dev/null; then
    echo "   -> Credentials: root / (empty password)"
else
    echo "❌ MySQL Connection Failed"
fi
echo ""

# 2. Test MongoDB Connection
echo "🍃 Testing MongoDB (Port 27017)..."
if docker exec airbnb-mongodb mongosh -u admin -p airbnb_mongo_2024 --eval "print('✅ MongoDB Connection Successful!')" --quiet 2>/dev/null; then
    echo "   -> Credentials: admin / airbnb_mongo_2024"
    echo "   -> Auth Database: admin"
else
    echo "❌ MongoDB Connection Failed"
fi

echo ""
echo "📋 Use these settings in DBeaver:"
echo "================================="
echo "MySQL:"
echo "  Host: localhost"
echo "  Port: 3306"
echo "  User: root"
echo "  Pass: (empty)"
echo ""
echo "MongoDB:"
echo "  Host: localhost"
echo "  Port: 27017"
echo "  User: admin"
echo "  Pass: airbnb_mongo_2024"
echo "  Auth DB: admin"
echo "================================="

