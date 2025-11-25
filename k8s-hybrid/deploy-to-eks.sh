#!/bin/bash

# Deploy Airbnb Application to EKS with Local Databases
# Cluster: airbnb-lab-cluster5
# Region: us-east-1
# Node Group: airbnb-lab-ng3

set -e

echo "🚀 Deploying Airbnb Application to EKS (Hybrid Mode)"
echo "=================================================="
echo "Services on AWS: Backend, Frontend, AI Agent, Kafka"
echo "Services on Local: MySQL, MongoDB"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if kubectl is configured
echo "📋 Checking kubectl configuration..."
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ kubectl is not configured. Please configure kubectl first:${NC}"
    echo "aws eks update-kubeconfig --region us-east-1 --name airbnb-lab-cluster5"
    exit 1
fi

CURRENT_CONTEXT=$(kubectl config current-context)
echo -e "${GREEN}✅ Connected to: $CURRENT_CONTEXT${NC}"
echo ""

# Check if local databases are configured
echo "🔍 Checking local database configuration..."
if grep -q "YOUR_PUBLIC_IP_HERE" local-db-config.yaml; then
    echo -e "${RED}❌ Please configure your public IP first${NC}"
    echo ""
    echo "Option 1: Add to .env file and run configure script"
    echo "  echo 'PUBLIC_IP=YOUR_IP' >> ../.env"
    echo "  ./configure-local-db.sh"
    echo ""
    echo "Option 2: Run configure script with IP as argument"
    echo "  ./configure-local-db.sh YOUR_PUBLIC_IP"
    echo ""
    echo "Get your public IP:"
    echo "  curl -4 -s https://api.ipify.org"
    echo "  curl -s https://checkip.amazonaws.com"
    exit 1
fi
echo -e "${GREEN}✅ Local database configuration looks good${NC}"
echo ""

# Confirm deployment
echo -e "${YELLOW}⚠️  This will deploy/update services on your EKS cluster${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Create namespace if it doesn't exist
echo ""
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

# Apply secrets
echo "🔐 Applying secrets..."
kubectl apply -f local-db-secrets.yaml

# Apply ConfigMaps
echo "⚙️  Applying ConfigMaps..."
kubectl apply -f local-db-config.yaml
kubectl apply -f ai-agent-deployment.yaml  # Contains AI agent config

# Deploy Kafka infrastructure (Zookeeper + Kafka)
echo "📨 Deploying Kafka infrastructure..."
kubectl apply -f kafka-deployment.yaml

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka to be ready..."
kubectl wait --for=condition=ready pod -l app=kafka -n airbnb-lab --timeout=300s || echo "Warning: Kafka may not be fully ready"

# Deploy Backend
echo "🔧 Deploying Backend service..."
kubectl apply -f backend-deployment.yaml

# Deploy Kafka Producer
echo "📤 Deploying Kafka Producer..."
kubectl apply -f kafka-producer-deployment.yaml

# Deploy Kafka Consumer
echo "📥 Deploying Kafka Consumer..."
kubectl apply -f kafka-consumer-deployment.yaml

# Deploy AI Agent
echo "🤖 Deploying AI Agent..."
kubectl apply -f ai-agent-deployment.yaml

# Deploy Frontend
echo "🌐 Deploying Frontend..."
kubectl apply -f frontend-deployment.yaml

echo ""
echo "✅ All services deployed!"
echo ""

# Show status
echo "📊 Deployment Status:"
echo "===================="
kubectl get pods -n airbnb-lab
echo ""

echo "🔗 Services:"
echo "============"
kubectl get svc -n airbnb-lab
echo ""

# Get LoadBalancer URLs
echo "🌍 External URLs (may take a few minutes to provision):"
echo "======================================================="
echo ""

echo "Backend URL:"
kubectl get svc backend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "  ⏳ Provisioning..."
echo ""

echo "Frontend URL:"
FRONTEND_URL=$(kubectl get svc frontend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
if [ -n "$FRONTEND_URL" ]; then
    echo "  http://$FRONTEND_URL"
else
    echo "  ⏳ Provisioning..."
fi
echo ""

# Helpful commands
echo "📝 Helpful Commands:"
echo "==================="
echo "Watch pods:           kubectl get pods -n airbnb-lab -w"
echo "Backend logs:         kubectl logs -f -l app=backend -n airbnb-lab"
echo "Frontend logs:        kubectl logs -f -l app=frontend -n airbnb-lab"
echo "Kafka logs:           kubectl logs -f -l app=kafka -n airbnb-lab"
echo "All services:         kubectl get svc -n airbnb-lab"
echo "Describe pod:         kubectl describe pod <pod-name> -n airbnb-lab"
echo "Scale backend:        kubectl scale deployment backend -n airbnb-lab --replicas=3"
echo ""

# Check for issues
echo "🔍 Checking for issues..."
PENDING_PODS=$(kubectl get pods -n airbnb-lab --field-selector=status.phase!=Running --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$PENDING_PODS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: $PENDING_PODS pod(s) not running yet${NC}"
    echo "Run this to check: kubectl get pods -n airbnb-lab"
else
    echo -e "${GREEN}✅ All pods are running!${NC}"
fi
echo ""

echo "✨ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Wait for LoadBalancers to get external IPs (2-5 minutes)"
echo "2. Test backend: curl http://<backend-url>:5000/api/health"
echo "3. Access frontend: http://<frontend-url>"
echo "4. Check logs if any issues: kubectl logs -f -l app=backend -n airbnb-lab"
echo ""
echo "🔒 Security Reminder:"
echo "Make sure your local MySQL (port 3306) and MongoDB (port 27017)"
echo "are accessible from AWS. See ../aws-hybrid-deployment/SECURITY_SETUP.md"
echo ""

