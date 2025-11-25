#!/bin/bash

# Cleanup Script for Hybrid Deployment
# Removes all Kubernetes resources from your EKS cluster

echo "🧹 Cleanup Hybrid Deployment"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Confirmation
echo -e "${YELLOW}⚠️  WARNING: This will delete all Airbnb services from your EKS cluster${NC}"
echo ""
echo "This will remove:"
echo "  - All pods (Backend, Frontend, AI Agent, Kafka, etc.)"
echo "  - All services (including LoadBalancers)"
echo "  - ConfigMaps and Secrets"
echo "  - The 'airbnb-lab' namespace"
echo ""
echo "This will NOT affect:"
echo "  - Your local MySQL and MongoDB databases"
echo "  - Your EKS cluster itself"
echo "  - Your ECR images"
echo ""

read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Cleanup cancelled"
    exit 0
fi

# Check kubectl connectivity
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    echo "Configure kubectl first:"
    echo "  aws eks update-kubeconfig --region us-east-1 --name airbnb-lab-cluster5"
    exit 1
fi

CONTEXT=$(kubectl config current-context)
echo "Connected to: $CONTEXT"
echo ""

read -p "Is this the correct cluster? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Cleanup cancelled"
    exit 0
fi

# Option: Delete everything or just deployments
echo "Choose cleanup option:"
echo "  1) Delete all deployments (keep namespace and configs)"
echo "  2) Delete everything including namespace (complete cleanup)"
echo "  3) Cancel"
echo ""
read -p "Enter choice (1-3): " CHOICE
echo ""

case $CHOICE in
    1)
        echo "🗑️  Deleting deployments and services..."
        
        kubectl delete deployment --all -n airbnb-lab
        kubectl delete service --all -n airbnb-lab
        
        echo -e "${GREEN}✅ Deployments and services deleted${NC}"
        echo "ConfigMaps and namespace preserved for quick redeployment"
        ;;
    2)
        echo "🗑️  Deleting namespace (this removes everything)..."
        
        kubectl delete namespace airbnb-lab
        
        echo "⏳ Waiting for namespace deletion..."
        kubectl wait --for=delete namespace/airbnb-lab --timeout=120s || echo "Still deleting..."
        
        echo -e "${GREEN}✅ Complete cleanup done${NC}"
        ;;
    3)
        echo "Cleanup cancelled"
        exit 0
        ;;
    *)
        echo "Invalid choice. Cleanup cancelled"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cleanup Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check remaining resources
REMAINING_PODS=$(kubectl get pods -n airbnb-lab --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$REMAINING_PODS" -gt 0 ]; then
    echo -e "${YELLOW}Note: $REMAINING_PODS pod(s) still terminating${NC}"
    echo "Check status: kubectl get pods -n airbnb-lab"
else
    echo -e "${GREEN}All resources cleaned up${NC}"
fi

echo ""
echo "Your local databases (MySQL and MongoDB) are still running."
echo "To stop them:"
echo "  cd /Users/vidushi/PycharmProjects/Airbnb_distributed"
echo "  docker-compose down"
echo ""
echo "To redeploy:"
echo "  cd k8s-hybrid"
echo "  ./deploy-to-eks.sh"
echo ""

