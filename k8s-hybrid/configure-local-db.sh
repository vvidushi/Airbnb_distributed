#!/bin/bash

# Configure Local Databases for AWS Access
# This script helps secure your local MySQL and MongoDB for AWS access

set -e

PUBLIC_IP=$1

echo "🔒 Configure Local Databases for AWS Access"
echo "============================================"
echo ""

# Check if IP provided as argument
if [ -z "$PUBLIC_IP" ]; then
    # Try to read from .env file
    if [ -f "../.env" ]; then
        echo "📋 Reading PUBLIC_IP from .env file..."
        PUBLIC_IP=$(grep -E "^PUBLIC_IP=" ../.env | cut -d '=' -f2 | tr -d ' "' || echo "")
    fi
    
    if [ -z "$PUBLIC_IP" ]; then
        echo "❌ No PUBLIC_IP found!"
        echo ""
        echo "Option 1: Pass as argument"
        echo "  ./configure-local-db.sh YOUR_PUBLIC_IP"
        echo ""
        echo "Option 2: Add to .env file"
        echo "  echo 'PUBLIC_IP=YOUR_IP_HERE' >> ../.env"
        echo "  ./configure-local-db.sh"
        echo ""
        echo "Get your public IP with:"
        echo "  curl -4 -s https://api.ipify.org"
        echo "  curl -s https://checkip.amazonaws.com"
        exit 1
    fi
    
    echo "✅ Found PUBLIC_IP in .env: $PUBLIC_IP"
fi

echo "Your public IP: $PUBLIC_IP"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Update ConfigMap
echo "📝 Step 1: Updating Kubernetes ConfigMap..."
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    sed -i '' "s/YOUR_PUBLIC_IP_HERE/$PUBLIC_IP/g" local-db-config.yaml
else
    # Linux
    sed -i "s/YOUR_PUBLIC_IP_HERE/$PUBLIC_IP/g" local-db-config.yaml
fi
echo -e "${GREEN}✅ ConfigMap updated${NC}"
echo ""

# Check if local databases are running
echo "📊 Step 2: Checking local databases..."
cd ..
if docker ps | grep -q "airbnb-mysql"; then
    echo -e "${GREEN}✅ MySQL is running${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL not found. Starting...${NC}"
    docker-compose up -d mysql
fi

if docker ps | grep -q "airbnb-mongodb"; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB not found. Starting...${NC}"
    docker-compose up -d mongodb
fi
echo ""

# Test local database connections
echo "🔍 Step 3: Testing local database connections..."
if docker exec airbnb-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL is responding${NC}"
else
    echo -e "${RED}❌ MySQL is not responding${NC}"
fi

if docker exec airbnb-mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null; then
    echo -e "${GREEN}✅ MongoDB is responding${NC}"
else
    echo -e "${RED}❌ MongoDB is not responding${NC}"
fi
echo ""

# Port configuration
echo "⚙️  Step 4: Port Configuration"
echo "=============================="
echo ""
echo "You need to configure your router to forward these ports:"
echo "  - Port 3306 (MySQL) → Your local machine"
echo "  - Port 27017 (MongoDB) → Your local machine"
echo ""
echo "Steps:"
echo "1. Find your local machine IP:"
echo "   macOS:  ipconfig getifaddr en0"
echo "   Linux:  hostname -I"
echo ""
echo "2. Access your router admin panel (usually http://192.168.1.1)"
echo ""
echo "3. Find 'Port Forwarding' or 'Virtual Server' settings"
echo ""
echo "4. Add these rules:"
echo "   External Port: 3306  → Internal IP: <your-local-ip>:3306"
echo "   External Port: 27017 → Internal IP: <your-local-ip>:27017"
echo ""
echo "5. Save and test with:"
echo "   nc -zv $PUBLIC_IP 3306"
echo "   nc -zv $PUBLIC_IP 27017"
echo ""

# Firewall configuration
echo "🔥 Step 5: Firewall Configuration"
echo "================================="
echo ""
echo "You should restrict database access to AWS IPs only!"
echo ""
echo "Get AWS NAT Gateway IPs:"
echo "  aws ec2 describe-nat-gateways --region us-east-1 \\"
echo "    --query 'NatGateways[*].NatGatewayAddresses[*].PublicIp' \\"
echo "    --output text"
echo ""

if [ "$(uname)" == "Darwin" ]; then
    echo "macOS Firewall (pf):"
    echo "  1. Create rule file:"
    echo "     sudo nano /etc/pf.anchors/airbnb"
    echo ""
    echo "  2. Add these rules (replace AWS_IP with actual IPs):"
    echo "     pass in proto tcp from AWS_IP_1 to any port 3306"
    echo "     pass in proto tcp from AWS_IP_1 to any port 27017"
    echo "     block in proto tcp from any to any port 3306"
    echo "     block in proto tcp from any to any port 27017"
    echo ""
    echo "  3. Load rules:"
    echo "     sudo pfctl -f /etc/pf.anchors/airbnb"
    echo "     sudo pfctl -e"
else
    echo "Linux Firewall (iptables):"
    echo "  sudo iptables -A INPUT -p tcp -s AWS_IP_1 --dport 3306 -j ACCEPT"
    echo "  sudo iptables -A INPUT -p tcp -s AWS_IP_1 --dport 27017 -j ACCEPT"
    echo "  sudo iptables -A INPUT -p tcp --dport 3306 -j DROP"
    echo "  sudo iptables -A INPUT -p tcp --dport 27017 -j DROP"
    echo "  sudo iptables-save > /etc/iptables/rules.v4"
fi
echo ""

# MySQL user configuration
echo "👤 Step 6: MySQL User Configuration"
echo "===================================="
echo ""
echo "Create a dedicated user for AWS access:"
echo ""
echo "docker exec -it airbnb-mysql mysql -u root -p << 'EOF'"
echo "CREATE USER 'aws_app'@'%' IDENTIFIED BY 'strong_password_here';"
echo "GRANT ALL PRIVILEGES ON airbnb_db.* TO 'aws_app'@'%';"
echo "FLUSH PRIVILEGES;"
echo "EOF"
echo ""
echo "Then update local-db-secrets.yaml with the new password"
echo ""

# MongoDB user configuration
echo "👤 Step 7: MongoDB User Configuration"
echo "======================================"
echo ""
echo "MongoDB is already configured with admin user"
echo "Check connection:"
echo ""
echo "docker exec -it airbnb-mongodb mongosh -u admin -p airbnb_mongo_2024 --eval 'db.adminCommand({listDatabases: 1})'"
echo ""

# Test external connectivity
echo "🧪 Step 8: Test External Connectivity"
echo "======================================"
echo ""
echo "From another network or using mobile data, test:"
echo ""
echo "MySQL:"
echo "  nc -zv $PUBLIC_IP 3306"
echo "  mysql -h $PUBLIC_IP -u root -p airbnb_db"
echo ""
echo "MongoDB:"
echo "  nc -zv $PUBLIC_IP 27017"
echo "  mongosh mongodb://admin:airbnb_mongo_2024@$PUBLIC_IP:27017/airbnb_db"
echo ""

# Dynamic DNS setup (if needed)
echo "🌐 Step 9: Dynamic DNS (Optional)"
echo "=================================="
echo ""
echo "If your IP changes frequently, use a Dynamic DNS service:"
echo ""
echo "Option 1: DuckDNS (Free)"
echo "  1. Sign up at https://www.duckdns.org"
echo "  2. Create a domain (e.g., yourname.duckdns.org)"
echo "  3. Install update client:"
echo "     echo url=\"https://www.duckdns.org/update?domains=yourname&token=YOUR_TOKEN&ip=\" | curl -k -o ~/duckdns.log -K -"
echo "  4. Add to crontab: */5 * * * * ~/duckdns.sh"
echo "  5. Update local-db-config.yaml to use yourname.duckdns.org instead of IP"
echo ""
echo "Option 2: ngrok (Development Only)"
echo "  ngrok tcp 3306 &"
echo "  ngrok tcp 27017 &"
echo "  # Use the forwarded URLs in local-db-config.yaml"
echo ""

# Summary
echo "✅ Configuration Summary"
echo "======================="
echo ""
echo "Completed:"
echo "  ✓ ConfigMap updated with your public IP"
echo "  ✓ Local databases checked"
echo ""
echo "You need to do:"
echo "  □ Configure router port forwarding"
echo "  □ Set up firewall rules"
echo "  □ Test external connectivity"
echo "  □ (Optional) Set up Dynamic DNS"
echo ""
echo "After completing these steps, deploy with:"
echo "  cd k8s-hybrid"
echo "  ./deploy-to-eks.sh"
echo ""
echo "📖 For detailed security setup, see:"
echo "   ../aws-hybrid-deployment/SECURITY_SETUP.md"
echo ""

