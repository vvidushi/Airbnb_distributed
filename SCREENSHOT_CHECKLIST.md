# Screenshot Checklist for Submission

This document provides a quick checklist of all screenshots needed for submission.

---

## ✅ Required Screenshots

### 1. AWS EKS Cluster Status
**What to Screenshot:**
- AWS Console → EKS → Clusters → `airbnb-lab-cluster5`
- Show: Cluster status "ACTIVE", version, endpoint

**Command Alternative:**
```bash
aws eks describe-cluster --name airbnb-lab-cluster5 --region us-east-1 \
  --query 'cluster.{Name:name,Status:status,Version:version}' --output table
```

**Status:** ✅ Ready to screenshot

---

### 2. Kubernetes Nodes
**What to Screenshot:**
- 4 nodes showing "Ready" status
- Node types (t3.micro, t3.small)
- Internal IPs

**Command:**
```bash
kubectl get nodes -o wide
```

**Status:** ✅ Ready to screenshot

---

### 3. Running Pods on AWS
**What to Screenshot:**
- MySQL: 1/1 Running ✅
- MongoDB: 1/1 Running ✅
- Zookeeper: 1/1 Running ✅
- Kafka Producer: 1/1 Running ✅
- (Backend/Frontend may show issues - that's okay, document it)

**Command:**
```bash
kubectl get pods -n airbnb-lab -o wide
```

**Status:** ✅ Ready to screenshot (5 pods running)

---

### 4. Services and LoadBalancer
**What to Screenshot:**
- All services listed
- **Frontend LoadBalancer** with EXTERNAL-IP highlighted
- Service types (ClusterIP, LoadBalancer)

**Command:**
```bash
kubectl get svc -n airbnb-lab
```

**LoadBalancer URL:**
```
a3806d963061a48f59a219778f18d60f-1982025708.us-east-1.elb.amazonaws.com
```

**Status:** ✅ Ready to screenshot

---

### 5. ECR Repositories
**What to Screenshot:**
- AWS Console → ECR → Repositories
- Show: `airbnb/backend`, `airbnb/frontend`, `airbnb/ai-agent`
- Image tags: `lab2`
- Push timestamps

**Command Alternative:**
```bash
aws ecr describe-repositories --region us-east-1 --output table
```

**Status:** ✅ Ready to screenshot

---

### 6. Kafka Producer Logs (AWS)
**What to Screenshot:**
- Logs showing: "🚀 Kafka Producer Service running on port 5001"
- Logs showing: "📤 Publishing events to Kafka topics"
- Producer pod status: Running

**Command:**
```bash
kubectl logs -n airbnb-lab -l app=kafka-producer --tail=30
```

**Status:** ✅ Ready to screenshot

---

### 7. Kafka Message Flow (Local - Backup Evidence)
**What to Screenshot:**
- Docker Compose showing all Kafka services Up
- Kafka Producer logs showing publishing
- Kafka Consumer logs showing consuming
- Kafka topics list

**Commands:**
```bash
# Services
docker-compose ps | grep kafka

# Producer logs
docker-compose logs kafka-producer | tail -20

# Consumer logs  
docker-compose logs kafka-consumer | tail -20

# Topics (if accessible)
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

**Status:** ✅ Ready to screenshot (Local fully functional)

---

### 8. Local Docker Compose (Full Stack Evidence)
**What to Screenshot:**
- All services showing "Up" status
- All services healthy
- Port mappings visible

**Command:**
```bash
docker-compose ps
```

**Status:** ✅ Ready to screenshot

---

## 📋 Quick Screenshot Commands

Run this single command to get all evidence at once:

```bash
./capture-screenshots.sh
```

Or run individual commands:

```bash
# 1. Cluster
aws eks describe-cluster --name airbnb-lab-cluster5 --region us-east-1 --query 'cluster.{Name:name,Status:status}' --output table

# 2. Nodes
kubectl get nodes

# 3. Pods
kubectl get pods -n airbnb-lab

# 4. Services
kubectl get svc -n airbnb-lab

# 5. ECR
aws ecr describe-repositories --region us-east-1 --output table

# 6. Kafka Producer
kubectl logs -n airbnb-lab -l app=kafka-producer --tail=20

# 7. Local Docker Compose
docker-compose ps
```

---

## 🎯 What Each Screenshot Proves

1. **EKS Cluster** → Shows AWS deployment infrastructure
2. **Kubernetes Nodes** → Shows worker nodes running
3. **Running Pods** → Shows services deployed and running
4. **Services/LoadBalancer** → Shows networking and external access
5. **ECR Repositories** → Shows container images stored in AWS
6. **Kafka Producer Logs** → Shows Kafka integration working
7. **Local Docker Compose** → Shows architecture works correctly (backup evidence)

---

## 📝 Notes for Submission

- **If AWS has issues:** Use local Docker Compose screenshots as primary evidence
- **Document issues:** Reference `CURRENT_ISSUES.md` for known problems
- **Kafka Flow:** Local evidence is sufficient to show message flow works
- **Architecture:** All components are implemented correctly

---

## 🚀 Quick Start

1. Run: `./capture-screenshots.sh`
2. Take screenshots of each numbered section
3. Save screenshots in a `screenshots/` folder
4. Reference them in your submission document

---

**All evidence generation scripts are ready. Run the commands and take screenshots!**

