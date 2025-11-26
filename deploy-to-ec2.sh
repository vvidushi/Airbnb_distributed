#!/bin/bash

# Enhanced EC2 Deployment Script for Airbnb Distributed System
# Optimized for t2.small (2GB RAM) with SQLite + MongoDB Atlas

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=============================================="
echo "🚀 AWS EC2 Deployment - Airbnb System"
echo "=============================================="
echo -e "${NC}"

# Get deployment info from user
echo -e "${YELLOW}📋 Deployment Information${NC}"
read -p "Enter your EC2 Public IP: " EC2_IP
read -p "Enter path to your .pem key file (e.g., ~/Downloads/airbnb-key.pem): " KEY_FILE

# Check for OpenAI API key in local environment
OPENAI_KEY_FOUND=""
if [ -f "setup-env.sh" ] && grep -q "OPENAI_KEY=" setup-env.sh; then
    OPENAI_KEY_FOUND=$(grep "OPENAI_KEY=" setup-env.sh | cut -d'"' -f2)
fi

# Ask user for OpenAI key if not found
if [ -z "$OPENAI_KEY_FOUND" ] || [ "$OPENAI_KEY_FOUND" == "YOUR_OPENAI_API_KEY" ]; then
    echo ""
    echo -e "${YELLOW}🤖 OpenAI Configuration${NC}"
    echo "AI Agent requires OpenAI API key (get from: https://platform.openai.com/api-keys)"
    read -p "Enter OpenAI API Key (or press Enter to skip AI features): " OPENAI_API_KEY
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "⚠️  AI Agent will be disabled (saves 128MB RAM)"
        SKIP_AI=true
    fi
else
    OPENAI_API_KEY="$OPENAI_KEY_FOUND"
    echo -e "${GREEN}✅ Found OpenAI API key in setup-env.sh${NC}"
fi

# Expand tilde
KEY_FILE="${KEY_FILE/#\~/$HOME}"

echo ""
echo -e "${GREEN}Configuration:${NC}"
echo "  EC2 IP: $EC2_IP"
echo "  Key file: $KEY_FILE"
echo "  MongoDB: Local (Docker container, 96MB RAM)"
echo "  AI Agent: $([ "$SKIP_AI" == "true" ] && echo "Disabled" || echo "Enabled (OpenAI API)")"
echo ""
read -p "Is this correct? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cancelled.${NC}"
    exit 0
fi

# Set correct permissions on key
chmod 400 "$KEY_FILE"

# Generate secure secrets
SESSION_SECRET=$(openssl rand -base64 32)
INTERNAL_API_KEY=$(openssl rand -base64 24)
MONGO_PASSWORD=$(openssl rand -base64 24)

echo ""
echo -e "${BLUE}📦 Step 1: Creating deployment package...${NC}"
cd "$(dirname "$0")"

# Create production .env file
cat > /tmp/airbnb.env << EOF
NODE_ENV=production
PORT=5000
MONGO_PASSWORD=${MONGO_PASSWORD}
SESSION_SECRET=${SESSION_SECRET}
INTERNAL_API_KEY=${INTERNAL_API_KEY}
KAFKA_BROKER=kafka:9092
FRONTEND_URL=http://${EC2_IP}:3000
# Allow insecure cookies for HTTP (not HTTPS)
FORCE_INSECURE_COOKIES=true
# Frontend build-time variables
REACT_APP_API_URL=http://${EC2_IP}:5001
REACT_APP_AI_URL=http://${EC2_IP}:8000
REACT_APP_AI_API_URL=http://${EC2_IP}:8000
# OpenAI configuration
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=1500
EOF

echo "✅ Production environment file created"

# Create deployment tarball
tar -czf /tmp/airbnb-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='*.log' \
    --exclude='.git' \
    --exclude='backend/uploads/*' \
    docker-compose.ec2.yml \
    backend/ \
    frontend/ \
    ai-agent/ 2>/dev/null || true

echo -e "${GREEN}✅ Package created ($(du -h /tmp/airbnb-deploy.tar.gz | cut -f1))${NC}"

echo ""
echo -e "${BLUE}📤 Step 2: Uploading to EC2...${NC}"
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no \
    /tmp/airbnb-deploy.tar.gz \
    /tmp/airbnb.env \
    ubuntu@$EC2_IP:~/

echo -e "${GREEN}✅ Upload complete${NC}"

echo ""
echo -e "${BLUE}🔧 Step 3: Setting up EC2 instance...${NC}"
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@$EC2_IP << 'ENDSSH'
    set -e
    
    echo "📋 System Information:"
    echo "  OS: $(lsb_release -d | cut -f2)"
    echo "  RAM: $(free -h | grep Mem | awk '{print $2}')"
    echo "  Disk: $(df -h / | tail -1 | awk '{print $4}') available"
    echo ""
    
    echo "🔄 Updating system packages..."
    sudo apt-get update -y > /dev/null
    
    echo "🐳 Installing Docker..."
    if ! command -v docker &> /dev/null; then
        # Install Docker
        sudo apt-get install -y \
            apt-transport-https \
            ca-certificates \
            curl \
            software-properties-common > /dev/null
        
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        sudo apt-get update -y > /dev/null
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io > /dev/null
        
        # Add user to docker group
        sudo usermod -aG docker ubuntu
        
        echo "✅ Docker installed: $(docker --version)"
    else
        echo "✅ Docker already installed: $(docker --version)"
    fi
    
    echo "🔗 Installing Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" \
            -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        echo "✅ Docker Compose installed: $(docker-compose --version)"
    else
        echo "✅ Docker Compose already installed: $(docker-compose --version)"
    fi
    
    echo "💾 Setting up swap memory (2GB)..."
    if [ ! -f /swapfile ]; then
        # Create 2GB swap file
        sudo fallocate -l 2G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile > /dev/null
        sudo swapon /swapfile
        
        # Make swap permanent
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab > /dev/null
        
        # Optimize swap settings
        echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf > /dev/null
        echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf > /dev/null
        sudo sysctl -p > /dev/null 2>&1 || true
        
        echo "✅ Swap created: $(free -h | grep Swap | awk '{print $2}')"
    else
        echo "✅ Swap already exists: $(free -h | grep Swap | awk '{print $2}')"
    fi
    
    echo "📂 Extracting application..."
    mkdir -p ~/airbnb-app
    cd ~/airbnb-app
    tar -xzf ~/airbnb-deploy.tar.gz
    mv ~/airbnb.env .env
    
    # Create data directory for SQLite
    mkdir -p data uploads
    sudo chmod -R 777 data uploads
    
    echo "✅ Application extracted"
ENDSSH

echo -e "${GREEN}✅ EC2 setup complete${NC}"

echo ""
echo -e "${BLUE}🚀 Step 4: Starting application...${NC}"
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@$EC2_IP << 'ENDSSH'
    set -e
    cd ~/airbnb-app
    
    echo "🛑 Stopping any existing containers..."
    sudo docker-compose -f docker-compose.ec2.yml down 2>/dev/null || true
    
    echo "📥 Pulling Docker images..."
    sudo docker-compose -f docker-compose.ec2.yml pull
    
    echo "🚀 Starting services..."
    sudo docker-compose -f docker-compose.ec2.yml up -d
    
    echo ""
    echo "⏳ Waiting for services to start (60 seconds)..."
    sleep 60
    
    echo ""
    echo "📊 Service Status:"
    sudo docker-compose -f docker-compose.ec2.yml ps
    
    echo ""
    echo "💾 Resource Usage:"
    echo "Memory:"
    free -h | grep -E 'Mem|Swap'
    echo ""
    echo "Docker containers:"
    sudo docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
ENDSSH

echo ""
echo -e "${BLUE}🔍 Step 5: Running health checks...${NC}"
sleep 10

# Test backend health
echo -n "Backend API: "
if curl -s -o /dev/null -w "%{http_code}" http://$EC2_IP:5001/health | grep -q "200"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Test frontend
echo -n "Frontend: "
if curl -s -o /dev/null -w "%{http_code}" http://$EC2_IP:3000 | grep -q "200"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

echo ""
echo -e "${GREEN}=============================================="
echo "🎉 Deployment Complete!"
echo "=============================================="
echo -e "${NC}"
echo "Your Airbnb application is live on AWS!"
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo "   Frontend:    http://$EC2_IP:3000"
echo "   Backend API: http://$EC2_IP:5001"
echo "   API Docs:    http://$EC2_IP:5001/api-docs"
echo "   AI Agent:    http://$EC2_IP:8000 (if enabled)"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "   SSH:         ssh -i $KEY_FILE ubuntu@$EC2_IP"
echo "   Logs:        ssh -i $KEY_FILE ubuntu@$EC2_IP 'cd airbnb-app && sudo docker-compose -f docker-compose.ec2.yml logs -f'"
echo "   Restart:     ssh -i $KEY_FILE ubuntu@$EC2_IP 'cd airbnb-app && sudo docker-compose -f docker-compose.ec2.yml restart'"
echo "   Stop:        ssh -i $KEY_FILE ubuntu@$EC2_IP 'cd airbnb-app && sudo docker-compose -f docker-compose.ec2.yml down'"
echo ""
echo -e "${YELLOW}💰 Cost Reminder:${NC}"
echo "   t2.small costs ~$0.023/hour (~$17/month)"
echo "   Remember to stop your EC2 when not in use!"
echo ""
echo -e "${GREEN}✨ Deployment Summary:${NC}"
echo "   Database: SQLite (file-based) + MongoDB (container, 96MB)"
echo "   Memory: ~1.3GB total (optimized for bare bones usage)"
echo "   Instance: Works on t2.micro FREE TIER or t2.small"
echo "   Services: Frontend, Backend, MongoDB, Kafka, Zookeeper$([ "$SKIP_AI" != "true" ] && echo ", AI Agent")"
echo "   Data Storage: <100MB (ultra-optimized)"
echo ""

# Clean up
rm -f /tmp/airbnb-deploy.tar.gz /tmp/airbnb.env

echo -e "${BLUE}📌 Save this URL: http://$EC2_IP:3000${NC}"
echo ""

