#!/bin/bash

# Frontend Diagnostic Script - Run locally
# Replace YOUR_KEY_PATH with your actual SSH key location

EC2_IP="54.81.110.183"
KEY_PATH="${1:-$HOME/Downloads/airbnb-app-key.pem}"  # Pass key path as argument

if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Key file not found: $KEY_PATH"
    echo "Usage: ./check-frontend.sh /path/to/your/key.pem"
    exit 1
fi

echo "🔍 Checking EC2 Instance: $EC2_IP"
echo "Using key: $KEY_PATH"
echo ""

echo "1️⃣ Checking Docker containers..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ubuntu@$EC2_IP "docker ps -a"

echo ""
echo "2️⃣ Checking frontend logs..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ubuntu@$EC2_IP "docker logs airbnb-frontend 2>&1 | tail -50"

echo ""
echo "3️⃣ Checking memory..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ubuntu@$EC2_IP "free -h"

echo ""
echo "4️⃣ Checking port 3000..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ubuntu@$EC2_IP "sudo netstat -tlnp | grep 3000 || echo 'Port 3000 not listening'"

echo ""
echo "5️⃣ Attempting to restart frontend..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ubuntu@$EC2_IP "cd deployment && docker-compose -f docker-compose.ec2.yml restart frontend"

echo ""
echo "✅ Done! Check the output above for errors."

