#!/bin/bash

# Fix Login Timeout Issue
# The frontend needs to be rebuilt with correct API URL

EC2_IP="54.81.110.183"
KEY_PATH="${1:-$HOME/.ssh/airbnb-key.pem}"

echo "🔧 Fixing Login Timeout Issue"
echo "EC2 IP: $EC2_IP"
echo ""

# Create fix script to run on EC2
cat > /tmp/fix-frontend.sh << 'REMOTE_SCRIPT'
#!/bin/bash

EC2_IP="54.81.110.183"
DEPLOY_DIR="/home/ubuntu/deployment"

cd $DEPLOY_DIR

echo "1️⃣ Checking current frontend configuration..."
docker exec airbnb-frontend env | grep REACT_APP || echo "No REACT_APP vars found"

echo ""
echo "2️⃣ Rebuilding frontend with correct API URL..."

# Rebuild frontend with correct environment variables
docker-compose -f docker-compose.ec2.yml build \
  --build-arg REACT_APP_API_URL=http://${EC2_IP}:5001 \
  --build-arg REACT_APP_AI_URL=http://${EC2_IP}:8000 \
  frontend

echo ""
echo "3️⃣ Restarting frontend container..."
docker-compose -f docker-compose.ec2.yml up -d frontend

echo ""
echo "4️⃣ Checking backend connectivity..."
curl -s http://localhost:5000/health || echo "⚠️ Backend not responding"

echo ""
echo "5️⃣ Checking backend logs for errors..."
docker logs airbnb-backend --tail 30

echo ""
echo "6️⃣ Testing login endpoint..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' | head -100

echo ""
echo "✅ Frontend rebuilt! Try logging in again."
REMOTE_SCRIPT

# Copy and execute on EC2
if [ -f "$KEY_PATH" ]; then
    echo "Copying fix script to EC2..."
    scp -o StrictHostKeyChecking=no -i "$KEY_PATH" /tmp/fix-frontend.sh ubuntu@$EC2_IP:/tmp/
    
    echo ""
    echo "Executing fix on EC2..."
    ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ubuntu@$EC2_IP "chmod +x /tmp/fix-frontend.sh && sudo /tmp/fix-frontend.sh"
    
    echo ""
    echo "✅ Done! Clear your browser cache and try logging in again."
    echo "   URL: http://$EC2_IP:3000"
else
    echo "❌ Key file not found: $KEY_PATH"
    echo "Please provide the correct key path as an argument:"
    echo "  ./fix-login-timeout.sh /path/to/your/key.pem"
    exit 1
fi

