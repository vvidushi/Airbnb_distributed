#!/bin/bash

# Airbnb Kafka Deployment Script
# This script deploys Kafka infrastructure to Kubernetes

set -e

echo "🚀 Airbnb Kafka Deployment Script"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0;0m'

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🗄️  Step 1: Deploying Zookeeper...${NC}"
kubectl apply -f k8s/zookeeper-deployment.yaml
echo -e "${GREEN}✅ Zookeeper deployed${NC}"

echo "Waiting for Zookeeper to be ready..."
kubectl wait --for=condition=ready pod -l app=zookeeper -n airbnb-lab --timeout=120s
echo -e "${GREEN}✅ Zookeeper is ready${NC}"

echo ""
echo -e "${YELLOW}📨 Step 2: Deploying Kafka Broker...${NC}"
kubectl apply -f k8s/kafka-deployment.yaml
echo -e "${GREEN}✅ Kafka deployed${NC}"

echo "Waiting for Kafka to be ready..."
kubectl wait --for=condition=ready pod -l app=kafka -n airbnb-lab --timeout=180s
echo -e "${GREEN}✅ Kafka is ready${NC}"

echo ""
echo -e "${YELLOW}📤 Step 3: Deploying Kafka Producer Service...${NC}"
kubectl apply -f k8s/kafka-producer-deployment.yaml
echo -e "${GREEN}✅ Producer deployed${NC}"

echo "Waiting for Producer to be ready..."
kubectl wait --for=condition=ready pod -l app=kafka-producer -n airbnb-lab --timeout=120s
echo -e "${GREEN}✅ Producer is ready${NC}"

echo ""
echo -e "${YELLOW}📥 Step 4: Deploying Kafka Consumer Service...${NC}"
kubectl apply -f k8s/kafka-consumer-deployment.yaml
echo -e "${GREEN}✅ Consumer deployed${NC}"

echo ""
echo -e "${GREEN}🎉 Kafka deployment completed successfully!${NC}"
echo ""

echo "======================================"
echo "📊 Kafka Status:"
echo "======================================"
kubectl get pods -n airbnb-lab | grep -E "kafka|zookeeper"
echo ""
kubectl get svc -n airbnb-lab | grep -E "kafka|zookeeper"
echo ""

echo "======================================"
echo "🧪 Testing Commands:"
echo "======================================"
echo "View Producer logs:   kubectl logs -f -n airbnb-lab -l app=kafka-producer"
echo "View Consumer logs:   kubectl logs -f -n airbnb-lab -l app=kafka-consumer"
echo "View Kafka logs:      kubectl logs -f -n airbnb-lab -l app=kafka"
echo ""
echo "List topics:"
echo "kubectl exec -it -n airbnb-lab \$(kubectl get pod -n airbnb-lab -l app=kafka -o jsonpath='{.items[0].metadata.name}') -- kafka-topics --list --bootstrap-server localhost:9092"
echo "======================================"

