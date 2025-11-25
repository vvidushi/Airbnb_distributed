# Quick Start Guide - Hybrid AWS Deployment

Deploy your Airbnb app to AWS EKS while keeping databases on your local machine.

## 🎯 What You'll Achieve

- ✅ Backend, Frontend, AI Agent, Kafka running on AWS
- ✅ MySQL and MongoDB running on your local machine
- ✅ Application accessible via AWS LoadBalancer
- ✅ Reduced AWS costs (~$100/month vs $300/month)

## ⚡ 5-Minute Deploy

### Prerequisites Check

```bash
# 1. Verify kubectl is configured
kubectl cluster-info

# Should show: Kubernetes control plane is running at https://...
# If not: aws eks update-kubeconfig --region us-east-1 --name airbnb-lab-cluster5
```

### Step 1: Get Your Public IP

```bash
curl -s https://ifconfig.me
# Note this IP
```

### Step 2: Configure Databases

```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/k8s-hybrid

# Run configuration script
./configure-local-db.sh YOUR_PUBLIC_IP_FROM_STEP_1
```

### Step 3: Set Up Router Port Forwarding

**On your router (usually http://192.168.1.1):**

1. Login to router admin panel
2. Find "Port Forwarding" or "Virtual Server" settings
3. Add these rules:
   - External 3306 → Your local machine IP:3306 (MySQL)
   - External 27017 → Your local machine IP:27017 (MongoDB)
4. Save settings

**Test it works:**

```bash
# From outside your network (use mobile data or different network)
nc -zv YOUR_PUBLIC_IP 3306
nc -zv YOUR_PUBLIC_IP 27017

# Both should show "succeeded" or "open"
```

### Step 4: Deploy to AWS

```bash
# Still in k8s-hybrid directory
./deploy-to-eks.sh
```

### Step 5: Get Your App URL

```bash
# Wait 2-3 minutes for LoadBalancer, then:
kubectl get svc frontend-service -n airbnb-lab

# Get the EXTERNAL-IP column, open in browser:
# http://<EXTERNAL-IP>
```

## ✅ Verification

```bash
# Check all pods are running
kubectl get pods -n airbnb-lab

# Should show all pods in Running or Completed state

# Check backend logs
kubectl logs -l app=backend -n airbnb-lab --tail=20

# Should see "Database connected successfully" and "MongoDB Connected"

# Test API
BACKEND_URL=$(kubectl get svc backend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$BACKEND_URL:5000/api/health
# Should return: {"status":"ok"}
```

## 🐛 Troubleshooting

### Problem: Backend can't connect to databases

**Check 1: Verify databases are running locally**
```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed
docker ps | grep -E "mysql|mongodb"
```

**Check 2: Verify port forwarding**
```bash
# Test from external network (use your phone's data)
nc -zv YOUR_PUBLIC_IP 3306
nc -zv YOUR_PUBLIC_IP 27017
```

**Check 3: Check backend logs**
```bash
kubectl logs -l app=backend -n airbnb-lab --tail=50
# Look for connection errors
```

**Fix: Update IP if it changed**
```bash
# Get new IP
NEW_IP=$(curl -s https://ifconfig.me)

# Update config
cd k8s-hybrid
sed -i '' "s/$(grep 'DB_HOST:' local-db-config.yaml | cut -d'"' -f2)/$NEW_IP/g" local-db-config.yaml
sed -i '' "s/$(grep 'MONGO_HOST:' local-db-config.yaml | cut -d'"' -f2)/$NEW_IP/g" local-db-config.yaml

# Redeploy
kubectl apply -f local-db-config.yaml
kubectl rollout restart deployment/backend -n airbnb-lab
```

### Problem: Pods in "Pending" state

**Check node resources:**
```bash
kubectl describe nodes | grep -A 5 "Allocated resources"
```

**Fix: Scale down if needed**
```bash
kubectl scale deployment backend --replicas=1 -n airbnb-lab
kubectl scale deployment frontend --replicas=1 -n airbnb-lab
```

### Problem: LoadBalancer stuck in "Pending"

**This is normal and can take 3-5 minutes. Check status:**
```bash
kubectl describe svc frontend-service -n airbnb-lab
# Look for "Events" section
```

**If stuck > 10 minutes:**
```bash
# Delete and recreate
kubectl delete svc frontend-service -n airbnb-lab
kubectl apply -f frontend-deployment.yaml
```

### Problem: High latency

This is expected with remote databases. Options:

1. **Accept it** - Usually 50-200ms added latency
2. **Use caching** - Redis layer (add to cluster)
3. **Migrate databases** - Move to AWS RDS/DocumentDB

## 🔄 Common Operations

### View Logs

```bash
# Backend
kubectl logs -f -l app=backend -n airbnb-lab

# Frontend
kubectl logs -f -l app=frontend -n airbnb-lab

# Kafka
kubectl logs -f -l app=kafka -n airbnb-lab

# All events
kubectl get events -n airbnb-lab --sort-by='.lastTimestamp'
```

### Scale Services

```bash
# Scale backend to 3 replicas
kubectl scale deployment backend --replicas=3 -n airbnb-lab

# Scale frontend to 2 replicas
kubectl scale deployment frontend --replicas=2 -n airbnb-lab
```

### Update Application

```bash
# After pushing new images to ECR
kubectl rollout restart deployment/backend -n airbnb-lab
kubectl rollout restart deployment/frontend -n airbnb-lab
kubectl rollout restart deployment/ai-agent -n airbnb-lab
```

### Check Resource Usage

```bash
kubectl top nodes
kubectl top pods -n airbnb-lab
```

## 🧹 Clean Up

### Remove All Services

```bash
kubectl delete namespace airbnb-lab
```

### Remove Specific Service

```bash
kubectl delete deployment backend -n airbnb-lab
kubectl delete svc backend-service -n airbnb-lab
```

## 💰 Cost Monitoring

```bash
# Check your AWS costs
aws ce get-cost-and-usage \
    --time-period Start=2025-11-01,End=2025-11-25 \
    --granularity MONTHLY \
    --metrics BlendedCost \
    --group-by Type=SERVICE

# Expected monthly costs:
# - EKS: ~$72 (control plane)
# - EC2: ~$30 (nodes)
# - Data Transfer: ~$5-10
# - Load Balancers: ~$16
# Total: ~$123-128/month
```

## 🔒 Security Checklist

- [ ] Strong database passwords (20+ characters)
- [ ] Port forwarding configured correctly
- [ ] Firewall rules limiting access to AWS IPs only
- [ ] Router firmware up to date
- [ ] SSL/TLS enabled for database connections
- [ ] Regular backup of local databases
- [ ] Monitoring and alerts configured
- [ ] Access logs reviewed weekly

## 📈 Performance Tips

1. **Enable connection pooling** (already configured)
2. **Use read replicas** for heavy read workloads
3. **Add Redis cache** to reduce database queries
4. **Monitor slow queries** in MySQL and MongoDB
5. **Consider AWS RDS Read Replicas** for production

## 🎓 Learning Resources

- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [MongoDB Performance](https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/)

## 📞 Getting Help

**Check logs first:**
```bash
kubectl logs -l app=backend -n airbnb-lab --tail=100
```

**Get pod details:**
```bash
kubectl describe pod <pod-name> -n airbnb-lab
```

**Check service connectivity:**
```bash
kubectl exec -it <backend-pod> -n airbnb-lab -- nc -zv YOUR_PUBLIC_IP 3306
kubectl exec -it <backend-pod> -n airbnb-lab -- nc -zv YOUR_PUBLIC_IP 27017
```

## ⚡ Alternative: Using Ngrok (Development Only)

For quick testing without port forwarding:

```bash
# Install ngrok
brew install ngrok

# Start tunnels
ngrok tcp 3306 &  # MySQL
ngrok tcp 27017 & # MongoDB

# Note the forwarded URLs (e.g., 0.tcp.ngrok.io:12345)
# Update local-db-config.yaml with these URLs instead of your public IP

# Example:
# DB_HOST: "0.tcp.ngrok.io"
# DB_PORT: "12345"
# MONGO_HOST: "2.tcp.ngrok.io"
# MONGO_PORT: "54321"
```

**Note:** Free ngrok URLs change on restart. Not suitable for production.

---

## 🎉 Success!

Once everything is running:

1. **Frontend:** http://YOUR_LOADBALANCER_URL
2. **Backend API:** http://YOUR_LOADBALANCER_URL:5000/api
3. **Health Check:** http://YOUR_LOADBALANCER_URL:5000/api/health

**Monitoring Dashboard:**
```bash
# Watch in real-time
watch -n 2 'kubectl get pods -n airbnb-lab'
```

Enjoy your hybrid AWS deployment! 🚀

