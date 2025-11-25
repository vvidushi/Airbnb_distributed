#!/bin/bash
# Generate evidence for screenshots

echo "=========================================="
echo "AWS EKS Deployment Evidence"
echo "Generated: $(date)"
echo "=========================================="
echo ""

echo "1. EKS Cluster Information:"
echo "----------------------------------------"
aws eks describe-cluster --name airbnb-lab-cluster5 --region us-east-1 \
  --query 'cluster.{Name:name,Status:status,Version:version,Endpoint:endpoint}' \
  --output table 2>/dev/null || echo "Cluster info unavailable"
echo ""

echo "2. Kubernetes Nodes:"
echo "----------------------------------------"
kubectl get nodes -o wide
echo ""

echo "3. All Pods in airbnb-lab namespace:"
echo "----------------------------------------"
kubectl get pods -n airbnb-lab -o wide
echo ""

echo "4. All Services:"
echo "----------------------------------------"
kubectl get svc -n airbnb-lab -o wide
echo ""

echo "5. Service Endpoints:"
echo "----------------------------------------"
kubectl get endpoints -n airbnb-lab
echo ""

echo "6. ECR Repositories:"
echo "----------------------------------------"
aws ecr describe-repositories --region us-east-1 \
  --query 'repositories[*].{Name:repositoryName,URI:repositoryUri}' \
  --output table 2>/dev/null || echo "ECR info unavailable"
echo ""

echo "7. Kafka Producer Logs (last 20 lines):"
echo "----------------------------------------"
kubectl logs -n airbnb-lab -l app=kafka-producer --tail=20 2>/dev/null || echo "Producer logs unavailable"
echo ""

echo "8. Kafka Consumer Logs (last 20 lines):"
echo "----------------------------------------"
kubectl logs -n airbnb-lab -l app=kafka-consumer --tail=20 2>/dev/null || echo "Consumer logs unavailable"
echo ""

echo "9. Local Docker Compose Status:"
echo "----------------------------------------"
docker-compose ps 2>/dev/null || echo "Docker Compose not running"
echo ""

echo "=========================================="
echo "Evidence generation complete"
echo "=========================================="
