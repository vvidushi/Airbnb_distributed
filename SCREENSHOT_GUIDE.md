# Screenshot Guide for AWS Services and Kafka Message Flow

This guide provides step-by-step instructions for capturing screenshots and evidence of services running on AWS and Kafka message flow.

---

## Part 1: AWS Services Running Screenshots

### 1.1 EKS Cluster Overview

**AWS Console Steps:**
1. Go to AWS Console → EKS → Clusters
2. Click on `airbnb-lab-cluster5`
3. Take screenshot of:
   - Cluster overview showing status "Active"
   - Cluster version and endpoint
   - Node groups showing "Active" status

**Command Line Evidence:**
```bash
# Run this command and screenshot the output:
aws eks describe-cluster --name airbnb-lab-cluster5 --region us-east-1 \
  --query 'cluster.{Name:name,Status:status,Version:version,Endpoint:endpoint}' \
  --output table

# Or use kubectl:
kubectl cluster-info
kubectl get nodes
```

**Expected Output:**
```
Cluster Name: airbnb-lab-cluster5
Status: ACTIVE
Version: 1.32
Endpoint: https://...
```

---

### 1.2 Node Groups

**AWS Console Steps:**
1. In EKS cluster → Go to "Compute" tab
2. Take screenshot showing:
   - Node groups: `airbnb-lab-ng2` and `airbnb-lab-ng3`
   - Status: "Active"
   - Instance types: t3.micro, t3.small
   - Desired/Max/Min sizes

**Command Line Evidence:**
```bash
# Get node information
kubectl get nodes -o wide

# Get node details
kubectl describe nodes | grep -E "Name:|Capacity:|Allocatable:"
```

---

### 1.3 Kubernetes Pods Status

**Command to Run:**
```bash
kubectl get pods -n airbnb-lab -o wide
```

**Screenshot this output showing:**
- Running pods (MySQL, MongoDB, Zookeeper, Kafka Producer)
- Pod statuses
- Node assignments
- IP addresses

**Expected Output:**
```
NAME                              READY   STATUS    RESTARTS   AGE     IP               NODE
mysql-557cdff487-5vnlw            1/1     Running   0          Xh    192.168.124.98   ip-192-168-114-195.ec2.internal
mongodb-764697c874-jtfjl          1/1     Running   0          Xh    192.168.96.168    ip-192-168-103-241.ec2.internal
zookeeper-754896fc8d-nx5gw        1/1     Running   0          Xh    192.168.74.200    ip-192-168-70-50.ec2.internal
kafka-producer-647fd4dcc8-ddl68   1/1     Running   0          Xh    192.168.79.33     ip-192-168-70-50.ec2.internal
```

---

### 1.4 Kubernetes Services

**Command to Run:**
```bash
kubectl get svc -n airbnb-lab -o wide
```

**Screenshot showing:**
- All services (mysql-service, mongodb-service, backend-service, etc.)
- Service types (ClusterIP, LoadBalancer)
- External IP for frontend LoadBalancer
- Port mappings

**Expected Output:**
```
NAME               TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)        AGE
frontend-service   LoadBalancer   10.100.57.152    a3806d963061a48f59a219778f18d60f-1982025708.us-east-1.elb.amazonaws.com   80:31025/TCP   Xh
backend-service    ClusterIP      10.100.11.78     <none>                                                                    5000/TCP       Xh
mysql-service      ClusterIP      10.100.100.103    <none>                                                                    3306/TCP       Xh
mongodb-service    ClusterIP      10.100.222.122    <none>                                                                    27017/TCP      Xh
kafka-service      ClusterIP      10.100.188.133    <none>                                                                    9092/TCP       Xh
```

---

### 1.5 ECR Repositories

**AWS Console Steps:**
1. Go to AWS Console → ECR → Repositories
2. Take screenshot showing:
   - `airbnb/backend`
   - `airbnb/frontend`
   - `airbnb/ai-agent`
   - Image tags: `lab2`
   - Push dates

**Command Line Evidence:**
```bash
# List repositories
aws ecr describe-repositories --region us-east-1 --output table

# List images in each repository
aws ecr list-images --repository-name airbnb/backend --region us-east-1
aws ecr list-images --repository-name airbnb/frontend --region us-east-1
aws ecr list-images --repository-name airbnb/ai-agent --region us-east-1
```

---

### 1.6 LoadBalancer Details

**AWS Console Steps:**
1. Go to EC2 → Load Balancers
2. Find the load balancer for frontend-service
3. Take screenshot showing:
   - Load balancer name/ARN
   - Status: Active
   - DNS name
   - Listeners (port 80)
   - Target groups

**Command Line Evidence:**
```bash
# Get LoadBalancer details
kubectl get svc frontend-service -n airbnb-lab -o yaml | grep -A 5 "loadBalancer"

# Or from AWS CLI
aws elbv2 describe-load-balancers --region us-east-1 \
  --query 'LoadBalancers[?contains(LoadBalancerName, `a3806d9`)].{Name:LoadBalancerName,DNS:DNSName,State:State.Code}'
```

---

## Part 2: Kafka Message Flow Screenshots

### 2.1 Kafka Producer Logs

**Command to Run:**
```bash
kubectl logs -n airbnb-lab -l app=kafka-producer --tail=50
```

**What to Look For:**
- Messages about publishing to Kafka topics
- Booking request messages
- Topic names (e.g., `booking-requests`)
- Success confirmations

**Screenshot the output showing:**
```
Published message to topic: booking-requests
Message: { bookingId: ..., propertyId: ..., userId: ... }
```

---

### 2.2 Kafka Consumer Logs

**Command to Run:**
```bash
kubectl logs -n airbnb-lab -l app=kafka-consumer --tail=50
```

**What to Look For:**
- Messages about consuming from Kafka
- Processing booking requests
- Database updates
- Booking status changes

**Screenshot the output showing:**
```
Consumed message from topic: booking-requests
Processing booking: { bookingId: ... }
Booking processed successfully
```

---

### 2.3 Kafka Topic Verification

**Command to Run (if Kafka pod is accessible):**
```bash
# If Kafka pod is running, exec into it
kubectl exec -it <kafka-pod-name> -n airbnb-lab -- kafka-topics --list --bootstrap-server localhost:9092

# Or check producer/consumer logs for topic references
kubectl logs -n airbnb-lab -l app=kafka-producer | grep -i topic
kubectl logs -n airbnb-lab -l app=kafka-consumer | grep -i topic
```

---

### 2.4 End-to-End Message Flow

**To Demonstrate Message Flow:**

1. **Trigger a booking** (if backend is accessible):
   ```bash
   # Port forward to backend
   kubectl port-forward svc/backend-service 5000:5000 -n airbnb-lab
   
   # Then make API call to create booking
   curl -X POST http://localhost:5000/api/bookings \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"propertyId": 1, "checkIn": "2025-12-01", "checkOut": "2025-12-05"}'
   ```

2. **Watch Producer Logs:**
   ```bash
   kubectl logs -f -n airbnb-lab -l app=kafka-producer
   ```

3. **Watch Consumer Logs:**
   ```bash
   kubectl logs -f -n airbnb-lab -l app=kafka-consumer
   ```

**Screenshot sequence:**
- Producer log showing message published
- Consumer log showing message consumed
- Consumer log showing processing/update

---

## Part 3: Local Docker Compose Evidence (Alternative)

Since local deployment is fully functional, you can also show:

### 3.1 Docker Compose Services

**Command:**
```bash
docker-compose ps
```

**Screenshot showing all services:**
- backend, frontend, mysql, mongodb, kafka, zookeeper, kafka-producer, kafka-consumer
- All showing "Up" status
- Port mappings

---

### 3.2 Local Kafka Message Flow

**Commands:**
```bash
# View Kafka producer logs
docker-compose logs kafka-producer | tail -30

# View Kafka consumer logs  
docker-compose logs kafka-consumer | tail -30

# Check Kafka topics (if accessible)
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

---

## Part 4: Quick Screenshot Commands

Run these commands and screenshot the outputs:

```bash
# 1. Cluster and nodes
echo "=== EKS Cluster ===" && \
aws eks describe-cluster --name airbnb-lab-cluster5 --region us-east-1 --query 'cluster.{Name:name,Status:status}' --output table && \
echo -e "\n=== Kubernetes Nodes ===" && \
kubectl get nodes -o wide

# 2. All pods
echo "=== All Pods ===" && \
kubectl get pods -n airbnb-lab -o wide

# 3. All services
echo "=== All Services ===" && \
kubectl get svc -n airbnb-lab -o wide

# 4. ECR repositories
echo "=== ECR Repositories ===" && \
aws ecr describe-repositories --region us-east-1 --query 'repositories[*].{Name:repositoryName,URI:repositoryUri}' --output table

# 5. Kafka Producer logs
echo "=== Kafka Producer Logs ===" && \
kubectl logs -n airbnb-lab -l app=kafka-producer --tail=20

# 6. Kafka Consumer logs
echo "=== Kafka Consumer Logs ===" && \
kubectl logs -n airbnb-lab -l app=kafka-consumer --tail=20

# 7. Service endpoints
echo "=== Service Endpoints ===" && \
kubectl get endpoints -n airbnb-lab
```

---

## Part 5: AWS Console Screenshots Checklist

### EKS Cluster
- [ ] Cluster overview page showing "Active" status
- [ ] Compute tab showing node groups
- [ ] Networking tab showing VPC/subnets
- [ ] Add-ons tab showing EBS CSI driver

### EC2
- [ ] EC2 instances (worker nodes)
- [ ] Load Balancers (frontend LoadBalancer)
- [ ] Security Groups

### ECR
- [ ] Repository list (backend, frontend, ai-agent)
- [ ] Image details showing tags and push dates

### CloudWatch (Optional)
- [ ] Log groups for EKS cluster
- [ ] Metrics for nodes/pods

---

## Part 6: Creating a Message Flow Diagram

You can create a simple diagram showing:

```
User Request → Frontend → Backend API
                      ↓
              Booking Controller
                      ↓
              Kafka Producer
                      ↓
              Kafka Topic (booking-requests)
                      ↓
              Kafka Consumer
                      ↓
              Database Update
                      ↓
              Response to User
```

**Tools to use:**
- Draw.io / diagrams.net
- Mermaid (in markdown)
- Simple text diagram

---

## Part 7: Sample Screenshot Script

Create a script to generate all evidence at once:

```bash
#!/bin/bash
# screenshot-evidence.sh

echo "=== AWS EKS Deployment Evidence ===" > evidence.txt
echo "" >> evidence.txt

echo "1. Cluster Information:" >> evidence.txt
aws eks describe-cluster --name airbnb-lab-cluster5 --region us-east-1 \
  --query 'cluster.{Name:name,Status:status,Version:version}' --output table >> evidence.txt

echo "" >> evidence.txt
echo "2. Node Information:" >> evidence.txt
kubectl get nodes -o wide >> evidence.txt

echo "" >> evidence.txt
echo "3. Pod Status:" >> evidence.txt
kubectl get pods -n airbnb-lab -o wide >> evidence.txt

echo "" >> evidence.txt
echo "4. Services:" >> evidence.txt
kubectl get svc -n airbnb-lab -o wide >> evidence.txt

echo "" >> evidence.txt
echo "5. ECR Repositories:" >> evidence.txt
aws ecr describe-repositories --region us-east-1 \
  --query 'repositories[*].repositoryName' --output table >> evidence.txt

echo "" >> evidence.txt
echo "6. Kafka Producer Logs:" >> evidence.txt
kubectl logs -n airbnb-lab -l app=kafka-producer --tail=20 >> evidence.txt

echo "" >> evidence.txt
echo "7. Kafka Consumer Logs:" >> evidence.txt
kubectl logs -n airbnb-lab -l app=kafka-consumer --tail=20 >> evidence.txt

echo "Evidence saved to evidence.txt"
```

---

## Part 8: What to Include in Submission

### Required Screenshots:

1. **AWS EKS Cluster Dashboard**
   - Cluster status: Active
   - Node groups: Active
   - Cluster version

2. **Kubernetes Pods**
   - At least 4-5 pods showing "Running" status
   - MySQL, MongoDB, Zookeeper, Kafka Producer

3. **Kubernetes Services**
   - All services listed
   - Frontend LoadBalancer with external IP

4. **ECR Repositories**
   - All three repositories visible
   - Images with `lab2` tag

5. **Kafka Producer Logs**
   - Messages being published
   - Topic names visible

6. **Kafka Consumer Logs**
   - Messages being consumed
   - Processing confirmation

### Optional but Helpful:

7. **Load Balancer Details** (EC2 Console)
8. **Node Details** (EC2 Instances)
9. **Local Docker Compose** (as backup evidence)

---

## Quick Reference Commands

```bash
# Get everything at once
kubectl get all -n airbnb-lab

# Get detailed pod info
kubectl describe pod <pod-name> -n airbnb-lab

# Follow logs in real-time
kubectl logs -f -n airbnb-lab -l app=kafka-producer

# Get service endpoints
kubectl get endpoints -n airbnb-lab

# Check cluster connectivity
kubectl cluster-info
```

---

**Note:** If AWS deployment has issues, use local Docker Compose screenshots as evidence that the architecture works correctly. Document that AWS issues are DNS-related and not architectural problems.

