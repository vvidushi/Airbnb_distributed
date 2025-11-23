#!/bin/bash

# Airbnb Kubernetes Deployment Script
# This script builds Docker images and deploys to Kubernetes

set -e

echo "🚀 Airbnb Kubernetes Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl not found. Please install kubectl first.${NC}"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Check if using minikube
USE_MINIKUBE=false
if command -v minikube &> /dev/null; then
    echo -e "${YELLOW}🔍 Minikube detected. Use minikube Docker daemon? (y/n)${NC}"
    read -r use_mini
    if [ "$use_mini" = "y" ] || [ "$use_mini" = "Y" ]; then
        eval $(minikube docker-env)
        USE_MINIKUBE=true
        echo -e "${GREEN}✅ Using minikube Docker daemon${NC}"
    fi
fi

# Step 1: Build Docker images
echo ""
echo -e "${YELLOW}📦 Step 1: Building Docker images...${NC}"

echo "Building backend image..."
docker build -t airbnb-backend:latest ./backend
echo -e "${GREEN}✅ Backend image built${NC}"

echo "Building frontend image..."
docker build -t airbnb-frontend:latest ./frontend
echo -e "${GREEN}✅ Frontend image built${NC}"

echo "Building AI agent image..."
docker build -t airbnb-ai-agent:latest ./ai-agent
echo -e "${GREEN}✅ AI agent image built${NC}"

# Step 2: Check API keys
echo ""
echo -e "${YELLOW}🔑 Step 2: Checking API keys...${NC}"
if grep -q "your-openai-api-key-here" k8s/ai-agent-secret.yaml; then
    echo -e "${RED}⚠️  WARNING: Please update your API keys in k8s/ai-agent-secret.yaml${NC}"
    echo -e "${YELLOW}Do you want to continue anyway? (y/n)${NC}"
    read -r continue_deploy
    if [ "$continue_deploy" != "y" ] && [ "$continue_deploy" != "Y" ]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Step 3: Create namespace
echo ""
echo -e "${YELLOW}🏗️  Step 3: Creating Kubernetes namespace...${NC}"
kubectl apply -f k8s/namespace.yaml
echo -e "${GREEN}✅ Namespace created${NC}"

# Step 4: Deploy MySQL
echo ""
echo -e "${YELLOW}🗄️  Step 4: Deploying MySQL database...${NC}"
kubectl apply -f k8s/mysql-pvc.yaml
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-deployment.yaml
echo -e "${GREEN}✅ MySQL deployed${NC}"

echo "Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=mysql -n airbnb-lab --timeout=180s
echo -e "${GREEN}✅ MySQL is ready${NC}"

# Step 5: Deploy Backend
echo ""
echo -e "${YELLOW}⚙️  Step 5: Deploying Backend service...${NC}"
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
echo -e "${GREEN}✅ Backend deployed${NC}"

echo "Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n airbnb-lab --timeout=120s
echo -e "${GREEN}✅ Backend is ready${NC}"

# Step 6: Deploy AI Agent
echo ""
echo -e "${YELLOW}🤖 Step 6: Deploying AI Agent service...${NC}"
kubectl apply -f k8s/ai-agent-configmap.yaml
kubectl apply -f k8s/ai-agent-secret.yaml
kubectl apply -f k8s/ai-agent-deployment.yaml
echo -e "${GREEN}✅ AI Agent deployed${NC}"

echo "Waiting for AI Agent to be ready..."
kubectl wait --for=condition=ready pod -l app=ai-agent -n airbnb-lab --timeout=120s
echo -e "${GREEN}✅ AI Agent is ready${NC}"

# Step 7: Deploy Frontend
echo ""
echo -e "${YELLOW}🎨 Step 7: Deploying Frontend service...${NC}"
kubectl apply -f k8s/frontend-deployment.yaml
echo -e "${GREEN}✅ Frontend deployed${NC}"

echo "Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n airbnb-lab --timeout=120s
echo -e "${GREEN}✅ Frontend is ready${NC}"

# Step 8: Display deployment status
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "========================================"
echo "📊 Deployment Status:"
echo "========================================"
kubectl get pods -n airbnb-lab
echo ""
kubectl get svc -n airbnb-lab
echo ""

# Step 9: Access instructions
echo "========================================"
echo "🌐 How to access the application:"
echo "========================================"

if [ "$USE_MINIKUBE" = true ]; then
    echo -e "${YELLOW}Run: minikube service frontend-service -n airbnb-lab${NC}"
else
    EXTERNAL_IP=$(kubectl get svc frontend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    if [ "$EXTERNAL_IP" = "pending" ] || [ -z "$EXTERNAL_IP" ]; then
        echo -e "${YELLOW}External IP is pending. Run this to check:${NC}"
        echo "kubectl get svc frontend-service -n airbnb-lab"
        echo ""
        echo -e "${YELLOW}Or use port forwarding:${NC}"
        echo "kubectl port-forward -n airbnb-lab svc/frontend-service 3000:80"
        echo "Then open: http://localhost:3000"
    else
        echo -e "${GREEN}Application is available at: http://${EXTERNAL_IP}${NC}"
    fi
fi

echo ""
echo "========================================"
echo "📝 Useful Commands:"
echo "========================================"
echo "View all pods:     kubectl get pods -n airbnb-lab"
echo "View logs:         kubectl logs -f -n airbnb-lab -l app=backend"
echo "Scale backend:     kubectl scale deployment backend -n airbnb-lab --replicas=5"
echo "Delete all:        kubectl delete namespace airbnb-lab"
echo "========================================"

