# Hybrid Kubernetes Deployment
## AWS EKS with Local Databases

This directory contains Kubernetes manifests for deploying to your existing EKS cluster (`airbnb-lab-cluster5`) while keeping MongoDB and MySQL on your local machine.

## Architecture

**On AWS EKS (airbnb-lab-ng3 node group):**
- Backend Service (Node.js API)
- Frontend Service (React/Nginx)
- AI Agent Service (Python)
- Kafka + Zookeeper (Message Broker)
- Kafka Producer & Consumer

**On Your Local Machine:**
- MySQL Database (port 3306)
- MongoDB Database (port 27017)

## Prerequisites

1. ✅ AWS EKS Cluster: `airbnb-lab-cluster5` (us-east-1)
2. ✅ Node Group: `airbnb-lab-ng3`
3. ✅ kubectl configured to access your cluster
4. ✅ ECR images already pushed
5. 🔧 Local MySQL and MongoDB running
6. 🔧 Your public IP address exposed (or ngrok tunnel)

## Quick Deploy

### Step 1: Configure Your Public IP

Get your public IP address:

```bash
curl -s https://ifconfig.me
# Or use: curl -s https://api.ipify.org
```

Edit `local-db-config.yaml` and replace `YOUR_PUBLIC_IP_HERE` with your actual IP.

### Step 2: Start Local Databases

```bash
# Start local MySQL and MongoDB
cd /Users/vidushi/PycharmProjects/Airbnb_distributed
docker-compose up -d mysql mongodb

# Verify they're running
docker ps | grep -E "mysql|mongodb"
```

### Step 3: Configure Local Database Access

```bash
# Allow connections from AWS (use your public IP from Step 1)
# This script will help secure your databases
./configure-local-db.sh YOUR_PUBLIC_IP
```

### Step 4: Deploy to EKS

```bash
# Deploy all services to your existing cluster
./deploy-to-eks.sh
```

### Step 5: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n airbnb-lab

# Check services
kubectl get svc -n airbnb-lab

# Get frontend URL
kubectl get svc frontend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## What Changed from Original K8s Deployment

1. **Removed:** MySQL and MongoDB deployments (running locally now)
2. **Updated:** Backend, Kafka Producer, Kafka Consumer to connect to your local IP
3. **Added:** External service endpoints for local databases
4. **Modified:** ConfigMaps to use your local database credentials

## Files in This Directory

- `README.md` - This file
- `namespace.yaml` - Namespace definition (same as before)
- `local-db-config.yaml` - **EDIT THIS** with your public IP
- `local-db-secrets.yaml` - Database passwords for local DBs
- `backend-deployment.yaml` - Backend deployment (updated for local DBs)
- `frontend-deployment.yaml` - Frontend deployment (no changes)
- `ai-agent-deployment.yaml` - AI Agent deployment (no changes)
- `kafka-deployment.yaml` - Kafka and Zookeeper (no changes)
- `kafka-producer-deployment.yaml` - Producer (updated for local DBs)
- `kafka-consumer-deployment.yaml` - Consumer (updated for local DBs)
- `deploy-to-eks.sh` - Deployment script
- `configure-local-db.sh` - Local database security setup

## Testing the Deployment

```bash
# 1. Test backend health
BACKEND_URL=$(kubectl get svc backend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$BACKEND_URL:5000/api/health

# 2. Test database connectivity
kubectl logs -n airbnb-lab -l app=backend --tail=50 | grep -i "database\|mongo"

# 3. Access frontend
FRONTEND_URL=$(kubectl get svc frontend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Frontend: http://$FRONTEND_URL"
```

## Troubleshooting

### Issue: Backend can't connect to local databases

**Solution 1: Check your public IP hasn't changed**
```bash
curl -s https://ifconfig.me
# If different, update local-db-config.yaml and redeploy
kubectl apply -f local-db-config.yaml
kubectl rollout restart deployment/backend -n airbnb-lab
```

**Solution 2: Verify port forwarding**
```bash
# From another machine or use mobile data
nc -zv YOUR_PUBLIC_IP 3306
nc -zv YOUR_PUBLIC_IP 27017
```

**Solution 3: Check firewall rules**
```bash
# Mac firewall status
sudo pfctl -sr | grep -E "3306|27017"
```

### Issue: High latency from AWS to local

This is expected when databases are on a different network. To reduce latency:

1. **Use connection pooling** (already configured)
2. **Enable compression** in database connections
3. **Consider caching** for frequently accessed data
4. **Monitor performance** and migrate to AWS RDS if needed

### Issue: IP address keeps changing

Use a Dynamic DNS service:

```bash
# Option 1: DuckDNS (free)
curl "https://www.duckdns.org/update?domains=yourdomain&token=yourtoken&ip="

# Option 2: No-IP (free tier)
# Install their Dynamic Update Client

# Option 3: Use ngrok (see below)
```

### Using Ngrok for Testing (Not Production)

```bash
# Install ngrok
brew install ngrok

# Start tunnels
ngrok tcp 3306 &   # MySQL
ngrok tcp 27017 &  # MongoDB

# Get the URLs (e.g., 0.tcp.ngrok.io:12345)
# Update local-db-config.yaml with these endpoints
# Note: Free tier URLs change each time you restart
```

## Monitoring

```bash
# Watch pods
kubectl get pods -n airbnb-lab -w

# Check logs
kubectl logs -f -n airbnb-lab -l app=backend

# Check resource usage
kubectl top pods -n airbnb-lab
kubectl top nodes

# Describe failing pods
kubectl describe pod -n airbnb-lab <pod-name>
```

## Scaling

```bash
# Scale backend
kubectl scale deployment backend -n airbnb-lab --replicas=5

# Scale frontend
kubectl scale deployment frontend -n airbnb-lab --replicas=3

# Check autoscaling
kubectl get hpa -n airbnb-lab
```

## Clean Up

```bash
# Delete all deployments (keeps namespace)
kubectl delete -f . -n airbnb-lab

# Delete namespace (removes everything)
kubectl delete namespace airbnb-lab
```

## Cost Optimization

With local databases, your AWS costs are reduced:

**Before (all on AWS):**
- EKS Control Plane: $72/month
- t3.small nodes (2): $30/month
- RDS MySQL: $30/month
- DocumentDB: $200/month
- **Total: ~$332/month**

**After (hybrid with local DBs):**
- EKS Control Plane: $72/month
- t3.small nodes (2): $30/month
- **Total: ~$102/month**

**Savings: ~$230/month** 💰

## Migration Path to Full AWS

When ready to move databases to AWS:

```bash
# 1. Create RDS MySQL instance
aws rds create-db-instance \
    --db-instance-identifier airbnb-mysql \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --master-username admin \
    --master-user-password YourPassword \
    --allocated-storage 20

# 2. Create DocumentDB cluster (or use MongoDB Atlas)
aws docdb create-db-cluster \
    --db-cluster-identifier airbnb-mongodb \
    --engine docdb \
    --master-username admin \
    --master-user-password YourPassword

# 3. Export local databases
mysqldump -u root -p airbnb_db > airbnb_backup.sql
mongodump --uri="mongodb://admin:pass@localhost:27017/airbnb_db"

# 4. Import to AWS
mysql -h rds-endpoint -u admin -p airbnb_db < airbnb_backup.sql
mongorestore --uri="mongodb://admin:pass@docdb-endpoint/airbnb_db"

# 5. Update ConfigMaps and redeploy (no code changes needed!)
```

## Security Notes

⚠️ **Important:** Exposing local databases to the internet has security implications!

1. **Use strong passwords** (20+ characters)
2. **Whitelist only AWS IPs** in your firewall
3. **Enable SSL/TLS** for database connections
4. **Monitor access logs** regularly
5. **Consider VPN** for production use

See `../aws-hybrid-deployment/SECURITY_SETUP.md` for detailed security configuration.

## Support

**Backend not connecting?**
- Check backend logs: `kubectl logs -l app=backend -n airbnb-lab`
- Verify database credentials in secrets
- Test connectivity from pod: `kubectl exec -it <backend-pod> -n airbnb-lab -- nc -zv YOUR_IP 3306`

**Frontend not loading?**
- Check frontend logs: `kubectl logs -l app=frontend -n airbnb-lab`
- Verify LoadBalancer is provisioned: `kubectl get svc -n airbnb-lab`
- Check Nginx config: `kubectl describe pod -l app=frontend -n airbnb-lab`

**Kafka issues?**
- Check Kafka logs: `kubectl logs -l app=kafka -n airbnb-lab`
- Verify Zookeeper is healthy: `kubectl get pods -l app=zookeeper -n airbnb-lab`
- Check consumer group: `kubectl exec -it kafka-pod -n airbnb-lab -- kafka-consumer-groups.sh --list`

---

**Next Steps:**
1. Edit `local-db-config.yaml` with your public IP
2. Run `./configure-local-db.sh`
3. Run `./deploy-to-eks.sh`
4. Monitor with `kubectl get pods -n airbnb-lab -w`

