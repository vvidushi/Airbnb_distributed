#!/bin/bash

# Fix Login Timeout by Redeploying with Correct Environment Variables
# This creates a proper .env file and redeploys

EC2_IP="54.81.110.183"
DEPLOY_DIR="./deployment-fixed"

echo "🔧 Creating deployment package with correct environment..."

# Create deployment directory
mkdir -p $DEPLOY_DIR

# Copy docker-compose file
cp docker-compose.ec2.yml $DEPLOY_DIR/

# Create .env.production file with correct values
cat > $DEPLOY_DIR/.env << EOF
# Production Environment
NODE_ENV=production
PORT=5000

# MongoDB
MONGO_PASSWORD=airbnb_mongo_2024

# Session & Security  
SESSION_SECRET=$(openssl rand -base64 32)
INTERNAL_API_KEY=$(openssl rand -base64 32)

# Kafka
KAFKA_BROKER=kafka:9092

# Frontend/Backend URLs - CRITICAL FOR LOGIN TO WORK!
FRONTEND_URL=http://${EC2_IP}:3000
REACT_APP_API_URL=http://${EC2_IP}:5001
REACT_APP_AI_URL=http://${EC2_IP}:8000

# AI Agent (Optional)
OPENAI_API_KEY=
TAVILY_API_KEY=
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=2000
EOF

echo "✅ Created .env file with correct EC2 IP: $EC2_IP"
echo ""
echo "📦 Deployment package ready in: $DEPLOY_DIR"
echo ""
echo "Next steps:"
echo "1. Copy $DEPLOY_DIR to your EC2 instance"
echo "2. Or use AWS Console EC2 Instance Connect to run the fix commands"
echo ""
echo "Manual fix command (run in EC2 via AWS Console):"
echo "-----------------------------------------------"
cat << 'MANUAL_FIX'
cd /home/ubuntu/deployment
docker-compose -f docker-compose.ec2.yml build \
  --build-arg REACT_APP_API_URL=http://54.81.110.183:5001 \
  --build-arg REACT_APP_AI_URL=http://54.81.110.183:8000 \
  frontend
docker-compose -f docker-compose.ec2.yml up -d frontend
MANUAL_FIX

echo ""
echo "✅ After running these commands, clear browser cache and login should work!"

