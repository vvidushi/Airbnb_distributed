# Docker & Kubernetes Setup - Lab 2 Part 1

This document explains the Docker and Kubernetes setup for the Airbnb application.

## 📋 Overview

The application has been containerized using Docker and orchestrated with Kubernetes, consisting of:

1. **Backend Service** (Node.js/Express) - Handles Traveler, Owner, Property, and Booking services
2. **Frontend Service** (React + Nginx) - User interface
3. **AI Agent Service** (Python FastAPI) - AI travel planning
4. **MySQL Database** - Data persistence

## 🐳 Docker Setup

### Dockerfiles Created

#### 1. Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

**Features:**
- Uses lightweight Alpine Linux
- Production dependencies only
- Exposes port 5000
- Runs Express server

#### 2. Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Features:**
- Multi-stage build (reduces image size)
- Builds React app in first stage
- Serves static files with Nginx in second stage
- Nginx proxies API requests to backend
- Exposes port 80

#### 3. AI Agent Dockerfile (`ai-agent/Dockerfile`)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "simple_main.py"]
```

**Features:**
- Python 3.11 slim image
- Installs required system dependencies
- Installs Python packages
- Exposes port 8000

### Building Docker Images

```bash
# Build all images
docker build -t airbnb-backend:latest ./backend
docker build -t airbnb-frontend:latest ./frontend
docker build -t airbnb-ai-agent:latest ./ai-agent
```

### Docker Compose (Local Testing)

A `docker-compose.yml` file is provided for local testing:

```bash
# Copy environment variables
cp .env.docker .env

# Edit .env with your API keys
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access the application at `http://localhost:3000`

## ☸️ Kubernetes Setup

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                 │
│  ┌─────────────────────────────────────────────┐   │
│  │         Namespace: airbnb-lab               │   │
│  │                                             │   │
│  │  ┌──────────────┐      ┌──────────────┐   │   │
│  │  │   Frontend   │      │   Backend    │   │   │
│  │  │ (3 replicas) │ ───▶ │ (3 replicas) │   │   │
│  │  │   Nginx:80   │      │  Node:5000   │   │   │
│  │  └──────────────┘      └──────┬───────┘   │   │
│  │         │                      │           │   │
│  │         │               ┌──────▼───────┐   │   │
│  │         │               │    MySQL     │   │   │
│  │         │               │  (1 replica) │   │   │
│  │         │               │    :3306     │   │   │
│  │         │               └──────────────┘   │   │
│  │         │                                  │   │
│  │         └────▶ ┌──────────────┐           │   │
│  │                │  AI Agent    │           │   │
│  │                │ (2 replicas) │           │   │
│  │                │  Python:8000 │           │   │
│  │                └──────────────┘           │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Kubernetes Resources

#### Services

| Service | Type | Port | Replicas | Purpose |
|---------|------|------|----------|---------|
| `frontend-service` | LoadBalancer | 80 | 3 | React UI served by Nginx |
| `backend-service` | ClusterIP | 5000 | 3 | REST API for all business logic |
| `ai-agent-service` | ClusterIP | 8000 | 2 | AI travel planning service |
| `mysql-service` | ClusterIP | 3306 | 1 | Database |

#### ConfigMaps & Secrets

- `backend-config`: Backend environment variables
- `ai-agent-config`: AI Agent configuration
- `mysql-secret`: MySQL credentials
- `ai-agent-secret`: API keys (OpenAI, Tavily)

#### Persistent Storage

- `mysql-pvc`: 5Gi PersistentVolumeClaim for MySQL data

### Deployment Steps

#### Option 1: Automated Deployment (Recommended)

```bash
# Run the deployment script
./deploy.sh
```

The script will:
1. Build Docker images
2. Create Kubernetes namespace
3. Deploy MySQL database
4. Deploy Backend service
5. Deploy AI Agent service
6. Deploy Frontend service
7. Display status and access instructions

#### Option 2: Manual Deployment

```bash
# 1. Build images
docker build -t airbnb-backend:latest ./backend
docker build -t airbnb-frontend:latest ./frontend
docker build -t airbnb-ai-agent:latest ./ai-agent

# 2. Create namespace
kubectl apply -f k8s/namespace.yaml

# 3. Deploy MySQL
kubectl apply -f k8s/mysql-pvc.yaml
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-deployment.yaml

# 4. Deploy Backend
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml

# 5. Deploy AI Agent
kubectl apply -f k8s/ai-agent-configmap.yaml
kubectl apply -f k8s/ai-agent-secret.yaml
kubectl apply -f k8s/ai-agent-deployment.yaml

# 6. Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml
```

### Verification

```bash
# Check all pods are running
kubectl get pods -n airbnb-lab

# Expected output:
# NAME                        READY   STATUS    RESTARTS   AGE
# backend-xxx                 1/1     Running   0          2m
# backend-yyy                 1/1     Running   0          2m
# backend-zzz                 1/1     Running   0          2m
# frontend-xxx                1/1     Running   0          1m
# frontend-yyy                1/1     Running   0          1m
# frontend-zzz                1/1     Running   0          1m
# ai-agent-xxx                1/1     Running   0          2m
# ai-agent-yyy                1/1     Running   0          2m
# mysql-xxx                   1/1     Running   0          3m

# Check services
kubectl get svc -n airbnb-lab

# View logs
kubectl logs -f -n airbnb-lab -l app=backend
```

### Accessing the Application

#### For Minikube:

```bash
minikube service frontend-service -n airbnb-lab
```

#### For Cloud Providers (AWS, GCP, Azure):

```bash
# Get LoadBalancer IP
kubectl get svc frontend-service -n airbnb-lab

# Access at http://<EXTERNAL-IP>
```

#### Port Forwarding (Alternative):

```bash
kubectl port-forward -n airbnb-lab svc/frontend-service 3000:80
# Open http://localhost:3000
```

## 🔄 Service Communication

### Internal Service Discovery

Kubernetes DNS enables services to communicate using service names:

1. **Frontend → Backend**:
   - URL: `http://backend-service:5000/api`
   - Configured in `frontend/nginx.conf`

2. **Frontend → AI Agent**:
   - URL: `http://ai-agent-service:8000`
   - Configured in `frontend/nginx.conf`

3. **AI Agent → Backend**:
   - URL: `http://backend-service:5000/api`
   - Configured in AI Agent environment variables

4. **Backend → MySQL**:
   - Host: `mysql-service`
   - Port: `3306`
   - Configured in Backend ConfigMap

### Network Policies

All services use ClusterIP (internal) except Frontend which uses LoadBalancer for external access.

## 📊 Scaling

### Horizontal Scaling

```bash
# Scale backend to 5 replicas
kubectl scale deployment backend -n airbnb-lab --replicas=5

# Scale frontend to 5 replicas
kubectl scale deployment frontend -n airbnb-lab --replicas=5

# Scale AI agent to 4 replicas
kubectl scale deployment ai-agent -n airbnb-lab --replicas=4
```

### Auto-scaling (HPA)

```bash
# Enable auto-scaling for backend (2-10 replicas, 70% CPU)
kubectl autoscale deployment backend -n airbnb-lab \
  --min=2 --max=10 --cpu-percent=70
```

## 🔍 Health Checks

All services have liveness and readiness probes:

- **Backend**: `GET /api/health`
- **AI Agent**: `GET /health`
- **MySQL**: `mysqladmin ping`
- **Frontend**: `GET /`

## 🛠️ Troubleshooting

### Pod CrashLoopBackOff

```bash
kubectl describe pod <pod-name> -n airbnb-lab
kubectl logs <pod-name> -n airbnb-lab --previous
```

### Image Pull Errors (Minikube)

```bash
# Use minikube's Docker daemon
eval $(minikube docker-env)

# Rebuild images
docker build -t airbnb-backend:latest ./backend
```

### Database Connection Issues

```bash
# Test MySQL connectivity
kubectl exec -it -n airbnb-lab <mysql-pod> -- mysql -u root airbnb_db -e "SHOW TABLES;"
```

## 🧹 Cleanup

```bash
# Delete everything
kubectl delete namespace airbnb-lab

# Or use docker-compose
docker-compose down -v
```

## 📈 Resource Requirements

| Component | CPU Request | Memory Request | CPU Limit | Memory Limit |
|-----------|-------------|----------------|-----------|--------------|
| Frontend (x3) | 100m | 128Mi | 200m | 256Mi |
| Backend (x3) | 200m | 256Mi | 500m | 512Mi |
| AI Agent (x2) | 250m | 512Mi | 500m | 1Gi |
| MySQL (x1) | 250m | 512Mi | 500m | 1Gi |

**Total:** ~2.5 CPU cores, ~5Gi RAM

## ✅ Lab 2 Part 1 Completion Checklist

- [x] Dockerized Traveler service (part of backend)
- [x] Dockerized Owner service (part of backend)
- [x] Dockerized Property service (part of backend)
- [x] Dockerized Booking service (part of backend)
- [x] Dockerized AI Agent service
- [x] Created Kubernetes manifests for all services
- [x] Configured service-to-service communication
- [x] Implemented scaling (multiple replicas)
- [x] Added health checks and resource limits
- [x] Created deployment automation script
- [x] Documented everything

## 📸 Screenshots Needed for Report

1. `docker images` showing all three images
2. `kubectl get pods -n airbnb-lab` showing all pods running
3. `kubectl get svc -n airbnb-lab` showing all services
4. Browser showing application working
5. `kubectl scale` command and result
6. Application logs from multiple pod replicas

