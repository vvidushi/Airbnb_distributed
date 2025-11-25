# Hybrid AWS Deployment Guide
## Run Services on AWS EKS with Local Databases

This guide shows you how to deploy your Airbnb application to your existing AWS EKS cluster (`airbnb-lab-cluster5` on `airbnb-lab-ng3` node group) while keeping MySQL and MongoDB on your local machine.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Deployment Steps](#deployment-steps)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Cost Savings](#cost-savings)
- [Security](#security)

## 🚀 Quick Start

```bash
# 1. Get your public IP
curl -s https://ifconfig.me

# 2. Configure databases
cd k8s-hybrid
./configure-local-db.sh YOUR_PUBLIC_IP

# 3. Set up port forwarding on your router
#    Forward ports 3306 and 27017 to your local machine

# 4. Deploy to EKS
./deploy-to-eks.sh

# 5. Verify deployment
./verify-deployment.sh

# 6. Get frontend URL
kubectl get svc frontend-service -n airbnb-lab
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           AWS EKS Cluster               │
│        (airbnb-lab-cluster5)            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Frontend │  │ Backend  │            │
│  │  (React) │  │ (Node.js)│            │
│  └──────────┘  └──────────┘            │
│                     │                   │
│  ┌──────────┐  ┌──────────┐            │
│  │AI Agent  │  │  Kafka   │            │
│  │ (Python) │  │  +Zoo    │            │
│  └──────────┘  └──────────┘            │
│                     │                   │
└─────────────────────┼───────────────────┘
                      │
                   Internet
                      │
┌─────────────────────┼───────────────────┐
│   Your Local Machine│                   │
│                     │                   │
│  ┌──────────┐  ┌───▼──────┐            │
│  │  MySQL   │  │ MongoDB  │            │
│  │ :3306    │  │ :27017   │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

**On AWS:**
- Backend Service (Node.js + Express)
- Frontend Service (React + Nginx)
- AI Agent Service (Python + LangChain)
- Kafka + Zookeeper
- Kafka Producer & Consumer

**On Local Machine:**
- MySQL Database
- MongoDB Database

## ✅ Prerequisites

### 1. AWS Infrastructure (Already Set Up)
- ✅ EKS Cluster: `airbnb-lab-cluster5`
- ✅ Region: `us-east-1`
- ✅ Node Group: `airbnb-lab-ng3`
- ✅ ECR Images: `868812196149.dkr.ecr.us-east-1.amazonaws.com/airbnb/*:lab2`

### 2. Tools Installed
- ✅ kubectl configured
- ✅ Docker Desktop running
- ✅ AWS CLI configured

### 3. Local Setup Needed
- 🔧 MySQL and MongoDB running locally
- 🔧 Public IP address (or Dynamic DNS)
- 🔧 Router port forwarding configured
- 🔧 Firewall rules (optional but recommended)

## 📝 Deployment Steps

### Step 1: Start Local Databases

```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed

# Start MySQL and MongoDB
docker-compose up -d mysql mongodb

# Verify they're running
docker ps | grep -E "mysql|mongodb"

# Test connectivity
docker exec airbnb-mysql mysqladmin ping -h localhost
docker exec airbnb-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Step 2: Get Your Public IP

```bash
# Get your public IP
curl -s https://ifconfig.me

# Or use alternative services
curl -s https://api.ipify.org
curl -s ifconfig.me
```

**Note this IP address** - you'll need it in the next step.

### Step 3: Configure Database Access

```bash
cd k8s-hybrid

# Run the configuration script with your public IP
./configure-local-db.sh YOUR_PUBLIC_IP_FROM_STEP_2

# This script will:
# - Update Kubernetes ConfigMaps with your IP
# - Check local databases are running
# - Provide instructions for port forwarding
```

### Step 4: Configure Router Port Forwarding

**Important:** This exposes your databases to the internet. See [Security](#security) section.

1. **Find your local machine's IP address:**
   ```bash
   # On macOS
   ipconfig getifaddr en0    # WiFi
   ipconfig getifaddr en1    # Ethernet
   
   # On Linux
   hostname -I
   ```

2. **Access your router admin panel:**
   - Usually at: http://192.168.1.1 or http://192.168.0.1
   - Login with your router credentials

3. **Find "Port Forwarding" settings:**
   - May be called: Port Forwarding, Virtual Server, NAT Forwarding, etc.
   - Usually under "Advanced" or "Security" sections

4. **Add these forwarding rules:**
   ```
   Service Name: MySQL
   External Port: 3306
   Internal IP: YOUR_LOCAL_MACHINE_IP
   Internal Port: 3306
   Protocol: TCP
   
   Service Name: MongoDB
   External Port: 27017
   Internal IP: YOUR_LOCAL_MACHINE_IP
   Internal Port: 27017
   Protocol: TCP
   ```

5. **Save and test:**
   ```bash
   # From outside your network (use mobile data or VPN to different location)
   nc -zv YOUR_PUBLIC_IP 3306
   nc -zv YOUR_PUBLIC_IP 27017
   
   # Both should show "succeeded" or "open"
   ```

### Step 5: Deploy to AWS EKS

```bash
cd k8s-hybrid

# Deploy all services
./deploy-to-eks.sh

# The script will:
# - Check kubectl is configured
# - Verify ConfigMap has your IP
# - Create namespace
# - Deploy all services
# - Show deployment status
```

### Step 6: Wait for Services to Start

```bash
# Watch pods starting (Ctrl+C to exit)
kubectl get pods -n airbnb-lab -w

# All pods should eventually show "Running" status
```

This typically takes **3-5 minutes** for all services to start.

### Step 7: Get Access URLs

```bash
# Get frontend URL
kubectl get svc frontend-service -n airbnb-lab

# Copy the EXTERNAL-IP from the output
# Access in browser: http://<EXTERNAL-IP>

# Get backend URL
kubectl get svc backend-service -n airbnb-lab

# Test backend: curl http://<BACKEND-EXTERNAL-IP>:5000/api/health
```

**Note:** LoadBalancer URLs can take 2-3 minutes to provision.

## ✅ Verification

### Automated Verification

```bash
cd k8s-hybrid
./verify-deployment.sh
```

This script checks:
- ✅ Kubectl connectivity
- ✅ All pods running
- ✅ Services accessible
- ✅ Database connections working
- ✅ API responding
- ✅ Local databases running

### Manual Verification

```bash
# 1. Check pod status
kubectl get pods -n airbnb-lab
# All should show "Running"

# 2. Check backend logs
kubectl logs -l app=backend -n airbnb-lab --tail=50
# Should see: "Database connected successfully" and "MongoDB Connected"

# 3. Test backend API
BACKEND_URL=$(kubectl get svc backend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$BACKEND_URL:5000/api/health
# Should return: {"status":"ok"}

# 4. Check frontend
FRONTEND_URL=$(kubectl get svc frontend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Open: http://$FRONTEND_URL"
```

### Test Database Connectivity from AWS

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pod -n airbnb-lab -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Test MySQL connection
kubectl exec -it $BACKEND_POD -n airbnb-lab -- nc -zv YOUR_PUBLIC_IP 3306

# Test MongoDB connection
kubectl exec -it $BACKEND_POD -n airbnb-lab -- nc -zv YOUR_PUBLIC_IP 27017

# Both should show "succeeded" or "open"
```

## 🐛 Troubleshooting

### Issue: Backend can't connect to databases

**Symptoms:**
- Backend logs show connection errors
- API returns 500 errors
- Pods keep restarting

**Solutions:**

1. **Check your IP hasn't changed:**
   ```bash
   curl -s https://ifconfig.me
   # Compare with IP in ConfigMap
   kubectl get configmap backend-config -n airbnb-lab -o yaml | grep DB_HOST
   ```

2. **Verify port forwarding:**
   ```bash
   # Test from external network
   nc -zv YOUR_PUBLIC_IP 3306
   nc -zv YOUR_PUBLIC_IP 27017
   ```

3. **Check local databases are running:**
   ```bash
   docker ps | grep -E "mysql|mongodb"
   ```

4. **Test from AWS pod:**
   ```bash
   kubectl exec -it <backend-pod> -n airbnb-lab -- bash
   nc -zv YOUR_PUBLIC_IP 3306
   nc -zv YOUR_PUBLIC_IP 27017
   ```

5. **Update IP and redeploy:**
   ```bash
   cd k8s-hybrid
   ./configure-local-db.sh NEW_PUBLIC_IP
   kubectl apply -f local-db-config.yaml
   kubectl rollout restart deployment/backend -n airbnb-lab
   ```

### Issue: Pods stuck in "Pending" state

**Cause:** Insufficient resources on nodes

**Solutions:**

```bash
# Check node resources
kubectl describe nodes | grep -A 5 "Allocated resources"

# Scale down to reduce resource usage
kubectl scale deployment backend --replicas=1 -n airbnb-lab
kubectl scale deployment frontend --replicas=1 -n airbnb-lab
kubectl scale deployment kafka --replicas=1 -n airbnb-lab
```

### Issue: LoadBalancer stuck in "Pending"

**Normal:** Takes 3-5 minutes to provision

**If stuck > 10 minutes:**

```bash
# Check events
kubectl describe svc frontend-service -n airbnb-lab

# Delete and recreate
kubectl delete svc frontend-service -n airbnb-lab
kubectl apply -f frontend-deployment.yaml
```

### Issue: High latency

**Expected:** 50-200ms added latency with remote databases

**Solutions:**

1. **Accept it** - Good enough for development/testing
2. **Use caching** - Add Redis to cluster
3. **Optimize queries** - Use indexes, connection pooling (already enabled)
4. **Migrate to AWS** - Move databases to RDS/DocumentDB

### Issue: IP address keeps changing

**Solution: Use Dynamic DNS**

```bash
# Option 1: DuckDNS (free)
# 1. Sign up at https://www.duckdns.org
# 2. Create domain: yourname.duckdns.org
# 3. Install update script:
echo "url=https://www.duckdns.org/update?domains=yourname&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns.log -K -

# 4. Add to crontab (update every 5 minutes):
# */5 * * * * ~/duckdns.sh

# 5. Update ConfigMap to use domain instead of IP:
# DB_HOST: "yourname.duckdns.org"
```

**Option 2: Use ngrok (development only)**

```bash
ngrok tcp 3306 &   # MySQL
ngrok tcp 27017 &  # MongoDB

# Use the forwarded URLs in ConfigMap
# Note: Free tier URLs change on restart
```

## 💰 Cost Savings

### Before (All on AWS):

| Service | Cost |
|---------|------|
| EKS Control Plane | $72/month |
| EC2 Instances (2x t3.small) | $30/month |
| RDS MySQL (db.t3.micro) | $30/month |
| DocumentDB (1x r5.large) | $200/month |
| Load Balancers | $32/month |
| Data Transfer | $10/month |
| **Total** | **~$374/month** |

### After (Hybrid with Local DBs):

| Service | Cost |
|---------|------|
| EKS Control Plane | $72/month |
| EC2 Instances (2x t3.small) | $30/month |
| Load Balancers | $32/month |
| Data Transfer | $10/month |
| **Total** | **~$144/month** |

### Savings: ~$230/month (61% reduction!) 🎉

## 🔒 Security

⚠️ **Warning:** Exposing databases to the internet has security implications!

### Security Best Practices:

1. **Use Strong Passwords:**
   ```bash
   # Generate strong password
   openssl rand -base64 32
   
   # Update database password
   docker exec -it airbnb-mysql mysql -u root -p
   # ALTER USER 'root'@'%' IDENTIFIED BY 'new_strong_password';
   
   # Update Kubernetes secret
   kubectl edit secret mysql-secret -n airbnb-lab
   ```

2. **IP Whitelisting:**
   ```bash
   # Get AWS NAT Gateway IPs
   aws ec2 describe-nat-gateways --region us-east-1 \
     --query 'NatGateways[*].NatGatewayAddresses[*].PublicIp' \
     --output text
   
   # Configure firewall to only allow these IPs
   # See k8s-hybrid/README.md for detailed firewall setup
   ```

3. **Enable SSL/TLS:**
   - Configure MySQL to require SSL connections
   - Configure MongoDB to use TLS
   - See detailed instructions in security setup docs

4. **Monitor Access:**
   ```bash
   # Check MySQL connections
   docker exec airbnb-mysql mysql -u root -p -e "SHOW PROCESSLIST;"
   
   # Check MongoDB connections
   docker exec airbnb-mongodb mongosh -u admin -p --eval "db.currentOp()"
   ```

5. **Regular Backups:**
   ```bash
   # MySQL backup
   docker exec airbnb-mysql mysqldump -u root -p airbnb_db > backup-$(date +%Y%m%d).sql
   
   # MongoDB backup
   docker exec airbnb-mongodb mongodump --uri="mongodb://admin:pass@localhost:27017/airbnb_db"
   ```

### Recommended Secure Options:

1. **SSH Tunnel (Best for Production):**
   - Set up bastion host on AWS
   - Create SSH tunnel from local to bastion
   - Backend connects via bastion
   - Databases never exposed to internet
   - Cost: ~$3-5/month for t2.micro bastion

2. **AWS Site-to-Site VPN:**
   - Most secure
   - Encrypted tunnel
   - Private connectivity
   - Cost: ~$36/month

3. **ngrok (Development Only):**
   - Quick setup
   - Free tier available
   - URLs change on restart
   - Not for production

See `k8s-hybrid/README.md` for detailed security setup instructions.

## 📊 Monitoring

```bash
# Watch pods
kubectl get pods -n airbnb-lab -w

# Check logs
kubectl logs -f -l app=backend -n airbnb-lab
kubectl logs -f -l app=frontend -n airbnb-lab
kubectl logs -f -l app=kafka -n airbnb-lab

# Check resource usage
kubectl top nodes
kubectl top pods -n airbnb-lab

# Check events
kubectl get events -n airbnb-lab --sort-by='.lastTimestamp'

# Describe pod for details
kubectl describe pod <pod-name> -n airbnb-lab
```

## 🔄 Common Operations

### Update Application

```bash
# After pushing new images to ECR
kubectl rollout restart deployment/backend -n airbnb-lab
kubectl rollout restart deployment/frontend -n airbnb-lab

# Watch rollout
kubectl rollout status deployment/backend -n airbnb-lab
```

### Scale Services

```bash
# Scale backend to 3 replicas
kubectl scale deployment backend --replicas=3 -n airbnb-lab

# Scale frontend
kubectl scale deployment frontend --replicas=2 -n airbnb-lab

# Check scaling
kubectl get pods -n airbnb-lab
```

### View Service URLs

```bash
# Get all external URLs
kubectl get svc -n airbnb-lab -o wide

# Get specific URL
kubectl get svc frontend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Clean Up

```bash
cd k8s-hybrid

# Delete all deployments (keep namespace and configs for quick redeploy)
./cleanup.sh
# Choose option 1

# Or delete everything including namespace
./cleanup.sh
# Choose option 2
```

## 📚 Additional Resources

- **Detailed Setup:** `k8s-hybrid/README.md`
- **Quick Start:** `k8s-hybrid/QUICK_START.md`
- **Security Guide:** `k8s-hybrid/README.md` (Security section)
- **Verification:** Run `k8s-hybrid/verify-deployment.sh`

## 🎯 Next Steps

1. ✅ Deploy application (you just did this!)
2. 📊 Set up monitoring and alerts
3. 🔒 Enhance security (SSL/TLS, IP whitelisting)
4. 🚀 Test performance and optimize
5. 📈 Plan migration to fully managed AWS databases (RDS/DocumentDB)

## 📞 Getting Help

1. **Run verification:**
   ```bash
   cd k8s-hybrid
   ./verify-deployment.sh
   ```

2. **Check logs:**
   ```bash
   kubectl logs -l app=backend -n airbnb-lab --tail=100
   ```

3. **Test connectivity:**
   ```bash
   nc -zv YOUR_PUBLIC_IP 3306
   nc -zv YOUR_PUBLIC_IP 27017
   ```

4. **Check resources:**
   ```bash
   kubectl describe nodes
   kubectl get pods -n airbnb-lab
   ```

---

## 🎉 Success!

Your application is now running on AWS while keeping databases local!

**Access your application:**
- Frontend: http://YOUR-LOADBALANCER-URL
- Backend API: http://YOUR-LOADBALANCER-URL:5000/api
- Health Check: http://YOUR-LOADBALANCER-URL:5000/api/health

**Monitor your deployment:**
```bash
watch -n 2 'kubectl get pods -n airbnb-lab'
```

Enjoy your hybrid AWS deployment! 🚀

