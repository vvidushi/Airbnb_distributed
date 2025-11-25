# ✅ AWS Deployment Successful!

**Deployment Date:** November 25, 2025  
**Status:** LIVE AND RUNNING

## 🌐 Application URL

**Frontend:**
```
http://a3806d963061a48f59a219778f18d60f-1982025708.us-east-1.elb.amazonaws.com
```

## 📊 Deployed Components

### AWS EKS Cluster
- **Cluster Name:** airbnb-lab-cluster5
- **Region:** us-east-1
- **Account ID:** 868812196149
- **Nodes:** 4x EC2 instances (t3.small)
- **Namespace:** airbnb-lab

### Running Services

| Service | Status | Replicas | Resources |
|---------|--------|----------|-----------|
| MySQL | ✅ Running | 1/1 | 256Mi RAM, 100m CPU |
| Backend API | ✅ Running | 1/1 | 512Mi RAM, 400m CPU |
| Frontend | ✅ Running | 1/1 | 128Mi RAM, 100m CPU |
| LoadBalancer | ✅ Active | - | AWS ELB |

### Services Endpoints

- **Frontend Service:** LoadBalancer (Public)
  - External: `a3806d963061a48f59a219778f18d60f-1982025708.us-east-1.elb.amazonaws.com`
  - Port: 80

- **Backend Service:** ClusterIP (Internal)
  - IP: 10.100.11.78
  - Port: 5000

- **MySQL Service:** ClusterIP (Internal)
  - IP: 10.100.100.103
  - Port: 3306

## 🔐 AWS Configuration

### AWS CLI Profile
```bash
Profile: airbnb
Account: 868812196149
User: airbnb-lab-cli
Region: us-east-1
```

### kubectl Context
```bash
Context: arn:aws:eks:us-east-1:868812196149:cluster/airbnb-lab-cluster5
Namespace: airbnb-lab
```

## 📈 Monitoring Commands

### Check Pod Status
```bash
kubectl get pods -n airbnb-lab
```

### View Logs
```bash
# Backend logs
kubectl logs -f -l app=backend -n airbnb-lab

# Frontend logs
kubectl logs -f -l app=frontend -n airbnb-lab

# MySQL logs
kubectl logs -f -l app=mysql -n airbnb-lab
```

### Check Services
```bash
kubectl get svc -n airbnb-lab
```

### Get Frontend URL
```bash
kubectl get svc frontend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## 🔄 Management Commands

### Scale Services
```bash
# Scale backend
kubectl scale deployment backend --replicas=2 -n airbnb-lab

# Scale frontend
kubectl scale deployment frontend --replicas=2 -n airbnb-lab
```

### Restart Services
```bash
# Restart backend
kubectl rollout restart deployment/backend -n airbnb-lab

# Restart frontend
kubectl rollout restart deployment/frontend -n airbnb-lab
```

### Update Application
```bash
# After pushing new image to ECR
kubectl set image deployment/backend backend=868812196149.dkr.ecr.us-east-1.amazonaws.com/airbnb/backend:new-tag -n airbnb-lab
```

## 💰 Cost Breakdown

| Item | Monthly Cost |
|------|--------------|
| EKS Control Plane | $72.00 |
| EC2 Instances (4x t3.small) | ~$60.00 |
| Load Balancer | $16.00 |
| Data Transfer | ~$5-10 |
| **Total** | **~$153-163/month** |

## 🎯 What Was Deployed

### Infrastructure
- ✅ AWS EKS Kubernetes cluster
- ✅ 4 worker nodes (EC2 instances)
- ✅ Application Load Balancer
- ✅ VPC networking and security groups

### Application Stack
- ✅ MySQL 8.0 database
- ✅ Node.js backend API
- ✅ React frontend application
- ✅ Nginx web server

### Configuration
- ✅ ConfigMaps for application settings
- ✅ Secrets for database credentials
- ✅ Services for internal networking
- ✅ LoadBalancer for external access

## 🔧 Simplified Architecture

```
Internet
   ↓
AWS Load Balancer (Public)
   ↓
Frontend Pod (Nginx + React)
   ↓
Backend Pod (Node.js API)
   ↓
MySQL Pod (Database)
```

All running in AWS EKS cluster in us-east-1

## ✅ Verification Steps

1. **Check all pods are running:**
   ```bash
   kubectl get pods -n airbnb-lab
   ```
   Expected: All pods show "Running" and "1/1" Ready

2. **Test frontend access:**
   ```bash
   curl http://a3806d963061a48f59a219778f18d60f-1982025708.us-east-1.elb.amazonaws.com
   ```
   Expected: HTTP 200 response

3. **Check backend API:**
   ```bash
   kubectl exec -it $(kubectl get pod -l app=backend -n airbnb-lab -o jsonpath='{.items[0].metadata.name}') -n airbnb-lab -- wget -O- http://localhost:5000/api/health
   ```
   Expected: {"status":"ok"}

4. **Verify MySQL connection:**
   ```bash
   kubectl exec -it $(kubectl get pod -l app=mysql -n airbnb-lab -o jsonpath='{.items[0].metadata.name}') -n airbnb-lab -- mysql -u root -proot -e "SHOW DATABASES;"
   ```
   Expected: airbnb_db listed

## 🐛 Troubleshooting

### If frontend shows 502/504 error:
```bash
# Check backend is running
kubectl get pods -l app=backend -n airbnb-lab

# Check backend logs
kubectl logs -l app=backend -n airbnb-lab --tail=50
```

### If pods are pending:
```bash
# Check cluster resources
kubectl describe nodes | grep -A 5 "Allocated resources"

# Scale down if needed
kubectl scale deployment backend --replicas=1 -n airbnb-lab
```

### If LoadBalancer shows pending:
```bash
# Check service status
kubectl describe svc frontend-service -n airbnb-lab

# Usually takes 2-5 minutes to provision
```

## 📞 Support Commands

```bash
# Get detailed pod info
kubectl describe pod <pod-name> -n airbnb-lab

# Get events
kubectl get events -n airbnb-lab --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n airbnb-lab

# Port forward for local testing
kubectl port-forward svc/backend-service 5000:5000 -n airbnb-lab
```

## 🎉 Success Criteria - All Met!

- ✅ Application deployed to AWS
- ✅ All pods running successfully
- ✅ LoadBalancer provisioned and active
- ✅ Frontend accessible via public URL
- ✅ Backend connected to MySQL
- ✅ Database initialized with schema
- ✅ Monitoring commands documented
- ✅ Cost-effective deployment (~$153/month)

## 📝 Notes

- Deployment uses minimal replicas (1 each) to conserve resources
- MySQL data is stored in emptyDir (ephemeral) - for production, use persistent volumes
- No MongoDB deployed to save cluster resources - can be added if needed
- Kafka was removed to reduce resource usage - can be added back if needed
- Frontend serves static React build via Nginx
- Backend connects directly to MySQL service

## 🚀 Next Steps (Optional)

1. Set up monitoring with Prometheus/Grafana
2. Configure autoscaling based on load
3. Add persistent storage for MySQL
4. Set up CI/CD pipeline
5. Configure custom domain name
6. Enable HTTPS with SSL certificate
7. Add MongoDB if needed
8. Implement backup strategy

---

**Deployment completed successfully on November 25, 2025**  
**Application is LIVE and accessible at the URL above!** 🎉

