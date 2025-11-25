#!/bin/bash
# Quick script to capture all evidence for screenshots

echo "=========================================="
echo "CAPTURING EVIDENCE FOR SCREENSHOTS"
echo "=========================================="
echo ""

echo "📸 SCREENSHOT 1: EKS Cluster Status"
echo "----------------------------------------"
aws eks describe-cluster --name airbnb-lab-cluster5 --region us-east-1 \
  --query 'cluster.{Name:name,Status:status,Version:version}' --output table
echo ""
echo "Take screenshot of the above output"
echo ""

echo "📸 SCREENSHOT 2: Kubernetes Nodes"
echo "----------------------------------------"
kubectl get nodes -o wide
echo ""
echo "Take screenshot of the above output"
echo ""

echo "📸 SCREENSHOT 3: All Pods Status"
echo "----------------------------------------"
kubectl get pods -n airbnb-lab -o wide | head -15
echo ""
echo "Take screenshot showing MySQL, MongoDB, Zookeeper, Kafka Producer running"
echo ""

echo "📸 SCREENSHOT 4: Services and LoadBalancer"
echo "----------------------------------------"
kubectl get svc -n airbnb-lab
echo ""
echo "Take screenshot showing frontend-service LoadBalancer with EXTERNAL-IP"
echo ""

echo "📸 SCREENSHOT 5: ECR Repositories"
echo "----------------------------------------"
aws ecr describe-repositories --region us-east-1 \
  --query 'repositories[*].{Name:repositoryName,URI:repositoryUri}' --output table
echo ""
echo "Take screenshot of ECR repositories"
echo ""

echo "📸 SCREENSHOT 6: Kafka Producer Logs"
echo "----------------------------------------"
kubectl logs -n airbnb-lab -l app=kafka-producer --tail=20
echo ""
echo "Take screenshot showing 'Publishing events to Kafka topics'"
echo ""

echo "📸 SCREENSHOT 7: Local Docker Compose (Backup Evidence)"
echo "----------------------------------------"
docker-compose ps
echo ""
echo "Take screenshot showing all services Up"
echo ""

echo "=========================================="
echo "All evidence captured. Take screenshots of each section above."
echo "=========================================="
