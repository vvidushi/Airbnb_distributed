# 🚀 START HERE - Hybrid AWS Deployment

Deploy your Airbnb app to AWS EKS (`airbnb-lab-ng3`) with local databases in 3 simple steps!

## 📦 What's Included

This deployment setup will:
- ✅ Deploy Backend, Frontend, AI Agent, Kafka to your EKS cluster
- ✅ Keep MySQL and MongoDB on your local machine
- ✅ Save ~$230/month in AWS costs
- ✅ Provide all scripts and configs needed

## ⚡ 3-Step Deployment

### Step 1: Setup Environment & Configure

```bash
cd /Users/vidushi/PycharmProjects/Airbnb_distributed/k8s-hybrid

# Auto-detect and save your public IP to .env file
./setup-env.sh

# Then configure databases (reads IP from .env)
./configure-local-db.sh
```

**Or manually:**
```bash
# Add to .env file
echo "PUBLIC_IP=YOUR_IP_HERE" >> ../.env

# Then configure
./configure-local-db.sh
```

### Step 2: Set Up Port Forwarding

**On your router (http://192.168.1.1):**
- Forward port **3306** → Your local machine (MySQL)
- Forward port **27017** → Your local machine (MongoDB)

**Test it works:**
```bash
nc -zv YOUR_PUBLIC_IP 3306
nc -zv YOUR_PUBLIC_IP 27017
```

### Step 3: Deploy to AWS

```bash
./deploy-to-eks.sh
```

## ✅ Verify It's Working

```bash
# Run automated verification
./verify-deployment.sh

# Get your app URL
kubectl get svc frontend-service -n airbnb-lab
# Open the EXTERNAL-IP in your browser
```

## 📁 Files in This Directory

| File | Purpose |
|------|---------|
| `START_HERE.md` | 👈 You are here! Quick start guide |
| `README.md` | Detailed documentation and troubleshooting |
| `QUICK_START.md` | 5-minute deployment walkthrough |
| `setup-env.sh` | 🔧 Setup PUBLIC_IP in .env file (auto-detect) |
| `deploy-to-eks.sh` | 🚀 Main deployment script |
| `configure-local-db.sh` | Configure database connectivity |
| `verify-deployment.sh` | ✅ Check everything is working |
| `cleanup.sh` | 🧹 Remove all deployed services |
| `*.yaml` | Kubernetes configuration files |

## 🎯 What Gets Deployed

### On AWS EKS (your airbnb-lab-ng3 nodes):
- **Backend** - Node.js API server (2 replicas)
- **Frontend** - React app with Nginx (2 replicas)
- **AI Agent** - Python LangChain service (1 replica)
- **Kafka** - Message broker (1 replica)
- **Zookeeper** - Kafka coordination (1 replica)
- **Kafka Producer** - Event producer (1 replica)
- **Kafka Consumer** - Event consumer (1 replica)

### On Your Local Machine:
- **MySQL** - Main database (Docker)
- **MongoDB** - NoSQL database (Docker)

## 📊 System Requirements

**Local Machine:**
- Docker Desktop running
- MySQL and MongoDB containers
- Public IP or Dynamic DNS
- Port forwarding configured

**AWS:**
- ✅ EKS Cluster: `airbnb-lab-cluster5`
- ✅ Region: `us-east-1`
- ✅ Node Group: `airbnb-lab-ng3`
- ✅ kubectl configured

## 🐛 Common Issues

### "ConfigMap not updated"
```bash
# Edit the file manually
nano local-db-config.yaml
# Replace YOUR_PUBLIC_IP_HERE with your actual IP
```

### "Backend can't connect to databases"
```bash
# Test port forwarding
nc -zv YOUR_PUBLIC_IP 3306

# Check databases are running
cd /Users/vidushi/PycharmProjects/Airbnb_distributed
docker ps | grep -E "mysql|mongodb"

# Start them if needed
docker-compose up -d mysql mongodb
```

### "Pods stuck in Pending"
```bash
# Scale down to reduce resource usage
kubectl scale deployment backend --replicas=1 -n airbnb-lab
kubectl scale deployment frontend --replicas=1 -n airbnb-lab
```

### "IP address changed"
```bash
# Re-run setup to update .env with new IP
./setup-env.sh

# Reconfigure
./configure-local-db.sh

# Update and restart
kubectl apply -f local-db-config.yaml
kubectl rollout restart deployment/backend -n airbnb-lab
```

## 🔍 Monitoring Commands

```bash
# Watch pods
kubectl get pods -n airbnb-lab -w

# Check logs
kubectl logs -f -l app=backend -n airbnb-lab

# Check services
kubectl get svc -n airbnb-lab

# Check resource usage
kubectl top pods -n airbnb-lab
```

## 💰 Cost Breakdown

| Component | Monthly Cost |
|-----------|--------------|
| EKS Control Plane | $72 |
| EC2 Nodes (t3.small x2) | $30 |
| Load Balancers (x2) | $32 |
| Data Transfer | $10 |
| **Total** | **~$144/month** |

Compare to fully managed AWS databases: ~$374/month
**Savings: $230/month (61%)** 🎉

## 🔒 Security Warnings

⚠️ **Your databases will be accessible from the internet!**

**Recommended actions:**
1. Use strong passwords (20+ characters)
2. Set up firewall rules to whitelist only AWS IPs
3. Enable SSL/TLS for database connections
4. Monitor access logs regularly
5. Consider VPN or SSH tunnel for production

See `README.md` for detailed security setup.

## 📖 Next Steps

After successful deployment:

1. **Test your application**
   - Open frontend URL in browser
   - Try logging in, searching properties, making bookings

2. **Set up monitoring**
   - Configure CloudWatch logs
   - Set up alerts for pod failures
   - Monitor database connections

3. **Enhance security**
   - Configure firewall rules
   - Enable SSL/TLS
   - Set up VPN (recommended for production)

4. **Optimize performance**
   - Monitor latency
   - Add caching layer if needed
   - Consider database read replicas

5. **Plan migration**
   - When ready, migrate to AWS RDS and DocumentDB
   - No code changes needed!

## 🆘 Need Help?

1. **Run verification script:**
   ```bash
   ./verify-deployment.sh
   ```

2. **Check detailed docs:**
   - Full documentation: `README.md`
   - Quick walkthrough: `QUICK_START.md`
   - Root guide: `../HYBRID_DEPLOYMENT_GUIDE.md`

3. **Check logs:**
   ```bash
   kubectl logs -l app=backend -n airbnb-lab --tail=100
   ```

4. **Test connectivity:**
   ```bash
   # From AWS pod
   BACKEND_POD=$(kubectl get pod -n airbnb-lab -l app=backend -o jsonpath='{.items[0].metadata.name}')
   kubectl exec -it $BACKEND_POD -n airbnb-lab -- nc -zv YOUR_IP 3306
   ```

## 🎉 You're All Set!

Once deployed, access your application at:
- **Frontend:** http://YOUR-FRONTEND-LOADBALANCER
- **Backend API:** http://YOUR-BACKEND-LOADBALANCER:5000/api
- **Health Check:** http://YOUR-BACKEND-LOADBALANCER:5000/api/health

Get the URLs with:
```bash
kubectl get svc -n airbnb-lab | grep LoadBalancer
```

---

**Questions or issues?** Check `README.md` for comprehensive troubleshooting.

**Want to clean up?** Run `./cleanup.sh`

Happy deploying! 🚀

