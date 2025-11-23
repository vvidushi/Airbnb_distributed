# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Airbnb application to a Kubernetes cluster.

## Architecture Overview

The application consists of the following services:
- **Frontend**: React application (3 replicas) served by Nginx
- **Backend**: Node.js/Express API (3 replicas) handling Traveler, Owner, Property, and Booking services
- **AI Agent**: Python FastAPI service (2 replicas) for AI travel planning
- **MySQL**: Database (1 replica) with persistent storage

## Prerequisites

1. **Kubernetes cluster** (minikube, Docker Desktop, or cloud provider)
2. **kubectl** CLI tool installed
3. **Docker** for building images

## Quick Start

### 1. Build Docker Images

```bash
# From project root directory
docker build -t airbnb-backend:latest ./backend
docker build -t airbnb-frontend:latest ./frontend
docker build -t airbnb-ai-agent:latest ./ai-agent
```

### 2. Configure Secrets

Edit `k8s/ai-agent-secret.yaml` and add your API keys:

```yaml
stringData:
  OPENAI_API_KEY: "your-actual-openai-key"
  TAVILY_API_KEY: "your-actual-tavily-key"
```

### 3. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy MySQL
kubectl apply -f k8s/mysql-pvc.yaml
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-deployment.yaml

# Deploy Backend
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml

# Deploy AI Agent
kubectl apply -f k8s/ai-agent-configmap.yaml
kubectl apply -f k8s/ai-agent-secret.yaml
kubectl apply -f k8s/ai-agent-deployment.yaml

# Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml
```

### 4. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n airbnb-lab

# Check services
kubectl get svc -n airbnb-lab

# Check deployment status
kubectl get deployments -n airbnb-lab
```

### 5. Access the Application

```bash
# Get frontend service external IP (for LoadBalancer)
kubectl get svc frontend-service -n airbnb-lab

# For minikube
minikube service frontend-service -n airbnb-lab

# For port forwarding (alternative)
kubectl port-forward -n airbnb-lab svc/frontend-service 3000:80
```

Then open your browser to `http://localhost:3000`

## Service Communication

- **Frontend** → **Backend**: `http://backend-service:5000/api`
- **Frontend** → **AI Agent**: `http://ai-agent-service:8000`
- **AI Agent** → **Backend**: `http://backend-service:5000/api`
- **Backend** → **MySQL**: `mysql-service:3306`

## Scaling

### Scale Backend

```bash
kubectl scale deployment backend -n airbnb-lab --replicas=5
```

### Scale Frontend

```bash
kubectl scale deployment frontend -n airbnb-lab --replicas=5
```

### Scale AI Agent

```bash
kubectl scale deployment ai-agent -n airbnb-lab --replicas=4
```

## Database Initialization

The MySQL database will be automatically initialized with the schema. To manually run schema and seed:

```bash
# Copy SQL files to MySQL pod
kubectl cp database/schema.sql airbnb-lab/mysql-<pod-id>:/tmp/schema.sql
kubectl cp database/seed.sql airbnb-lab/mysql-<pod-id>:/tmp/seed.sql

# Execute SQL
kubectl exec -it -n airbnb-lab mysql-<pod-id> -- mysql -u root airbnb_db < /tmp/schema.sql
kubectl exec -it -n airbnb-lab mysql-<pod-id> -- mysql -u root airbnb_db < /tmp/seed.sql
```

## Monitoring

### View Logs

```bash
# Backend logs
kubectl logs -f -n airbnb-lab -l app=backend

# Frontend logs
kubectl logs -f -n airbnb-lab -l app=frontend

# AI Agent logs
kubectl logs -f -n airbnb-lab -l app=ai-agent

# MySQL logs
kubectl logs -f -n airbnb-lab -l app=mysql
```

### Check Pod Health

```bash
kubectl describe pod <pod-name> -n airbnb-lab
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl get pods -n airbnb-lab

# Describe problematic pod
kubectl describe pod <pod-name> -n airbnb-lab

# Check logs
kubectl logs <pod-name> -n airbnb-lab
```

### Database connection issues

```bash
# Test MySQL connectivity
kubectl exec -it -n airbnb-lab mysql-<pod-id> -- mysql -u root airbnb_db -e "SHOW TABLES;"

# Check backend can reach MySQL
kubectl exec -it -n airbnb-lab backend-<pod-id> -- ping mysql-service
```

### Image pull errors

If using local images with minikube:

```bash
# Use minikube's Docker daemon
eval $(minikube docker-env)

# Rebuild images
docker build -t airbnb-backend:latest ./backend
docker build -t airbnb-frontend:latest ./frontend
docker build -t airbnb-ai-agent:latest ./ai-agent
```

## Clean Up

```bash
# Delete all resources
kubectl delete namespace airbnb-lab

# Or delete individual resources
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/ai-agent-deployment.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/mysql-deployment.yaml
kubectl delete -f k8s/namespace.yaml
```

## Resource Requirements

| Service | Replicas | CPU Request | Memory Request | CPU Limit | Memory Limit |
|---------|----------|-------------|----------------|-----------|--------------|
| Frontend | 3 | 100m | 128Mi | 200m | 256Mi |
| Backend | 3 | 200m | 256Mi | 500m | 512Mi |
| AI Agent | 2 | 250m | 512Mi | 500m | 1Gi |
| MySQL | 1 | 250m | 512Mi | 500m | 1Gi |

**Total Cluster Requirements:**
- CPU: ~2.5 cores
- Memory: ~5Gi
- Storage: 5Gi (MySQL PVC)

## High Availability Features

1. **Multiple Replicas**: Frontend (3), Backend (3), AI Agent (2)
2. **Health Checks**: Liveness and readiness probes for all services
3. **Rolling Updates**: Zero-downtime deployments
4. **Persistent Storage**: MySQL data persists across pod restarts
5. **Resource Limits**: Prevents resource exhaustion
6. **Network Policies**: Services communicate via ClusterIP

## Production Considerations

1. **Use Docker Registry**: Push images to Docker Hub or private registry
2. **Use Secrets Manager**: Store sensitive data in external secrets manager
3. **Enable Autoscaling**: Configure HPA (Horizontal Pod Autoscaler)
4. **Add Ingress**: Use Ingress controller instead of LoadBalancer
5. **Enable Logging**: Configure centralized logging (ELK, Fluentd)
6. **Add Monitoring**: Set up Prometheus and Grafana
7. **Backup Database**: Regular MySQL backups to persistent storage
8. **Use StatefulSet for MySQL**: For production database workloads

