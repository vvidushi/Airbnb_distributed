#!/bin/bash

# Setup Environment for Hybrid Deployment
# This script helps you add your PUBLIC_IP to the .env file

echo "🔧 Setup Environment for Hybrid Deployment"
echo "=========================================="
echo ""

ENV_FILE="../.env"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating .env file..."
    touch "$ENV_FILE"
fi

# Try to get current PUBLIC_IP from .env
CURRENT_IP=$(grep -E "^PUBLIC_IP=" "$ENV_FILE" | cut -d '=' -f2 | tr -d ' "' 2>/dev/null || echo "")

if [ -n "$CURRENT_IP" ]; then
    echo "📋 Current PUBLIC_IP in .env: $CURRENT_IP"
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping current IP: $CURRENT_IP"
        exit 0
    fi
fi

echo "🌐 Getting your public IPv4 address..."
echo ""

# Try multiple methods to get IPv4
echo "Trying different services..."

PUBLIC_IP=""

# Method 1: api.ipify.org
PUBLIC_IP=$(curl -4 -s --connect-timeout 3 https://api.ipify.org 2>/dev/null || echo "")
if [ -n "$PUBLIC_IP" ] && [[ $PUBLIC_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "✅ Found IPv4: $PUBLIC_IP (from api.ipify.org)"
fi

# Method 2: checkip.amazonaws.com
if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP=$(curl -s --connect-timeout 3 https://checkip.amazonaws.com 2>/dev/null | tr -d '\n' || echo "")
    if [ -n "$PUBLIC_IP" ] && [[ $PUBLIC_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "✅ Found IPv4: $PUBLIC_IP (from checkip.amazonaws.com)"
    fi
fi

# Method 3: ipv4.icanhazip.com
if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP=$(curl -s --connect-timeout 3 https://ipv4.icanhazip.com 2>/dev/null | tr -d '\n' || echo "")
    if [ -n "$PUBLIC_IP" ] && [[ $PUBLIC_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "✅ Found IPv4: $PUBLIC_IP (from ipv4.icanhazip.com)"
    fi
fi

# Method 4: ifconfig.me with IPv4
if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP=$(curl -4 -s --connect-timeout 3 https://ifconfig.me 2>/dev/null || echo "")
    if [ -n "$PUBLIC_IP" ] && [[ $PUBLIC_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "✅ Found IPv4: $PUBLIC_IP (from ifconfig.me)"
    fi
fi

echo ""

# If auto-detection failed, ask user
if [ -z "$PUBLIC_IP" ] || [[ ! $PUBLIC_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "⚠️  Could not automatically detect IPv4 address"
    echo ""
    echo "Please enter your public IPv4 address manually:"
    echo "(Get it from: https://www.whatismyip.com or your router)"
    echo ""
    read -p "Enter IPv4 address: " PUBLIC_IP
    
    # Validate format
    if [[ ! $PUBLIC_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "❌ Invalid IPv4 format. Should be like: 123.45.67.89"
        exit 1
    fi
fi

echo ""
echo "📝 Saving PUBLIC_IP to .env file..."

# Remove old PUBLIC_IP entry if exists
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    sed -i '' '/^PUBLIC_IP=/d' "$ENV_FILE" 2>/dev/null || true
else
    # Linux
    sed -i '/^PUBLIC_IP=/d' "$ENV_FILE" 2>/dev/null || true
fi

# Add new PUBLIC_IP
echo "" >> "$ENV_FILE"
echo "# Public IP for AWS Hybrid Deployment" >> "$ENV_FILE"
echo "PUBLIC_IP=$PUBLIC_IP" >> "$ENV_FILE"

echo "✅ PUBLIC_IP saved to .env: $PUBLIC_IP"
echo ""

echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Configure databases:"
echo "   ./configure-local-db.sh"
echo ""
echo "2. Set up port forwarding on your router:"
echo "   Forward ports 3306 and 27017 to your local machine"
echo ""
echo "3. Deploy to AWS:"
echo "   ./deploy-to-eks.sh"
echo ""
echo "💡 Tip: If your IP changes, just run this script again!"
echo ""

