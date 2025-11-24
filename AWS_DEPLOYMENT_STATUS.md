# AWS EKS Deployment Status

**Last Updated:** 2025-11-25

## Cluster Information
- **Cluster Name:** airbnb-lab-cluster5
- **Region:** us-east-1
- **Node Groups:** 
  - airbnb-lab-ng2 (t3.micro) - Active
  - airbnb-lab-ng3 (t3.small) - Active

## Service Status

### ✅ Running Services
- **MySQL:** Running (1/1 Ready)
  - Endpoint: `mysql-service:3306`
  - Status: Healthy
  
- **MongoDB:** Running (1/1 Ready)  
  - Endpoint: `mongodb-service:27017`
  - Status: Healthy (Fixed probe timeouts)
  
- **Zookeeper:** Running (1/1 Ready)
  - Status: Healthy
  
- **Kafka Producer:** Running (1/1 Ready)
  - Status: Healthy

### ⚠️ Services with Issues

- **Backend:** Running but not ready (0/1)
  - Issue: DNS resolution for `mongodb-service` failing intermittently
  - Status: Pods running (not crashing), connection retries in progress
  - Fix Applied: 
    - Made MongoDB session store resilient to connection failures
    - Increased readiness probe delay to 60s
    - Session store falls back gracefully on connection errors
  
- **Frontend:** CrashLoopBackOff
  - Issue: Nginx can't resolve `backend-service` at startup
  - Fix Applied: Added DNS resolver and variables to nginx config
  - LoadBalancer URL: `http://a3806d963061a48f59a219778f18d60f-1982025708.us-east-1.elb.amazonaws.com`
  
- **Kafka:** CrashLoopBackOff
  - Issue: Resource constraints on small nodes
  
- **Kafka Consumer:** CrashLoopBackOff
  - Issue: Depends on backend/Kafka being ready

## Local Docker Compose Status

✅ **All services running locally:**
- Backend: `localhost:5001`
- MySQL: `localhost:3306`
- MongoDB: `localhost:27017`
- Kafka: `localhost:29092`
- Zookeeper: `localhost:2181`
- Kafka Producer/Consumer: Running

## Key Fixes Applied

1. **MongoDB Probes:** Changed to TCP socket check for readiness, increased timeouts
2. **Resource Requests:** Reduced CPU/memory for MySQL and MongoDB to fit small nodes
3. **Storage:** Using emptyDir volumes temporarily (PVCs pending EBS CSI driver)
4. **Nginx DNS:** Added resolver and variables for dynamic DNS resolution
5. **Backend Readiness:** Increased initial delay to 60s to allow DB connections

## Next Steps

1. Monitor backend logs for successful MongoDB connection
2. Once backend is ready, restart frontend to pick up backend-service
3. Scale down non-essential services if resource constraints persist
4. Consider upgrading node types if budget allows

## ECR Images

All images pushed to ECR with `lab2` tag:
- `868812196149.dkr.ecr.us-east-1.amazonaws.com/airbnb/backend:lab2`
- `868812196149.dkr.ecr.us-east-1.amazonaws.com/airbnb/frontend:lab2`
- `868812196149.dkr.ecr.us-east-1.amazonaws.com/airbnb/ai-agent:lab2`

## Commands for Monitoring

```bash
# Check pod status
kubectl get pods -n airbnb-lab

# Check backend logs
kubectl logs -n airbnb-lab -l app=backend --tail=50

# Check service endpoints
kubectl get endpoints -n airbnb-lab

# Get frontend URL
kubectl get svc frontend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

