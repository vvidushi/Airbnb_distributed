# Current Issues in AWS EKS Deployment

**Last Updated:** 2025-11-25  
**Cluster:** airbnb-lab-cluster5 (us-east-1)  
**Namespace:** airbnb-lab

---

## 🔴 Critical Issues

### 1. Backend Service DNS Resolution Failure

**Status:** ⚠️ Partially Resolved - Backend running but not ready

**Problem:**
- Backend pods cannot resolve `mysql-service` and `mongodb-service` DNS names
- Error: `getaddrinfo EAI_AGAIN mysql-service` / `getaddrinfo EAI_AGAIN mongodb-service`
- Backend service has no endpoints (pods not passing readiness probe)

**Impact:**
- Backend cannot connect to databases
- Frontend cannot connect to backend
- Full application stack non-functional

**Current State:**
- Backend pods are **Running** (not crashing) ✅
- Session store made resilient to connection failures ✅
- DNS resolution still failing intermittently ❌
- Backend service endpoints: **None** ❌

**Attempted Fixes:**
1. ✅ Added init containers to wait for services (removed - DNS resolution failed in init containers)
2. ✅ Increased backend readiness probe delay to 60s
3. ✅ Made MongoDB session store resilient with error handling
4. ✅ Used full FQDN service names (reverted - didn't help)
5. ✅ Scaled down replicas to reduce resource pressure

**Root Cause:**
- Possible CoreDNS issue in EKS cluster
- DNS propagation delay in Kubernetes
- Service discovery timing issue

**Next Steps:**
- [ ] Check CoreDNS pod status: `kubectl get pods -n kube-system | grep coredns`
- [ ] Verify DNS resolution from within cluster: `kubectl run dns-test --image=busybox --rm -it --restart=Never -- nslookup mongodb-service.airbnb-lab.svc.cluster.local`
- [ ] Check if services are in correct namespace
- [ ] Consider using IP addresses directly (not recommended for production)
- [ ] Wait longer for DNS to stabilize (may resolve automatically)

---

### 2. Frontend Service Not Ready

**Status:** 🔴 Not Resolved

**Problem:**
- Frontend pods in `CrashLoopBackOff` or `Error` state
- Nginx cannot resolve `backend-service` at startup
- Frontend service has no endpoints

**Impact:**
- Frontend LoadBalancer URL returns errors
- Users cannot access the application

**Current State:**
- Frontend pods: **CrashLoopBackOff** / **Error** ❌
- Frontend service endpoints: **None** ❌
- LoadBalancer URL: Available but non-functional

**Error Messages:**
```
nginx: [emerg] host not found in upstream "backend-service" in /etc/nginx/conf.d/default.conf:14
```

**Attempted Fixes:**
1. ✅ Updated nginx.conf to use `backend-service` instead of `backend`
2. ✅ Added DNS resolver to nginx config
3. ✅ Used variables for dynamic DNS resolution in nginx
4. ✅ Set `imagePullPolicy: Always` to ensure latest image

**Root Cause:**
- Nginx resolves DNS at startup time
- Backend service has no endpoints (depends on Issue #1)
- DNS resolver in nginx may not be working correctly

**Next Steps:**
- [ ] Wait for backend to become ready (depends on Issue #1)
- [ ] Verify nginx resolver configuration
- [ ] Test DNS resolution from frontend pod
- [ ] Consider using IP-based connection (temporary workaround)

---

## 🟡 Medium Priority Issues

### 3. Kafka Broker CrashLoopBackOff

**Status:** 🟡 Not Critical - Kafka Producer/Consumer can work with external Kafka

**Problem:**
- Kafka broker pod in `CrashLoopBackOff` state
- Restart count: 66+ times

**Impact:**
- Internal Kafka broker unavailable
- Kafka Producer/Consumer may have issues

**Current State:**
- Kafka pod: **CrashLoopBackOff** ❌
- Kafka Producer: **Running (1/1)** ✅
- Kafka Consumer: **CrashLoopBackOff** ❌

**Root Cause:**
- Resource constraints on small nodes (t3.micro/t3.small)
- Kafka requires significant memory

**Next Steps:**
- [ ] Check Kafka pod logs for specific error
- [ ] Reduce Kafka resource requests if possible
- [ ] Consider using managed Kafka service (MSK) if budget allows
- [ ] Scale up node types if resources available

---

### 4. Kafka Consumer Not Stable

**Status:** 🟡 Partially Resolved

**Problem:**
- Kafka Consumer pod in `CrashLoopBackOff`
- High restart count (45+)

**Current State:**
- Kafka Consumer: **CrashLoopBackOff** ❌
- Depends on Kafka broker being available

**Next Steps:**
- [ ] Resolve Kafka broker issue first (Issue #3)
- [ ] Check consumer logs for connection errors
- [ ] Verify Kafka service endpoints

---

### 5. AI Agent Pods Pending

**Status:** 🟡 Low Priority - Not Critical for Core Functionality

**Problem:**
- AI Agent pods stuck in `Pending` state
- Cannot be scheduled due to resource constraints

**Impact:**
- AI Assistant feature unavailable
- Core application functionality not affected

**Current State:**
- AI Agent pods: **Pending** ❌
- No resources available on nodes

**Root Cause:**
- Insufficient CPU/memory on t3.micro/t3.small nodes
- Too many pods competing for resources

**Next Steps:**
- [ ] Scale down other non-essential services
- [ ] Increase node sizes if budget allows
- [ ] Reduce AI Agent resource requests
- [ ] Deploy AI Agent separately or use managed service

---

## 🟢 Resolved Issues

### ✅ MongoDB Probe Timeouts
- **Fixed:** Changed readiness probe to TCP socket check
- **Fixed:** Increased probe timeouts and delays
- **Status:** MongoDB now stable (1/1 Ready)

### ✅ Resource Constraints
- **Fixed:** Reduced CPU/memory requests for MySQL and MongoDB
- **Fixed:** Scaled down replicas to 1 for most services
- **Status:** Core services can now schedule

### ✅ Storage Issues
- **Fixed:** Using emptyDir volumes temporarily
- **Status:** Databases running (data not persistent across pod restarts)

---

## 📊 Current Deployment Status

### Healthy Services (6 pods)
- ✅ MySQL: 1/1 Ready
- ✅ MongoDB: 1/1 Ready  
- ✅ Zookeeper: 1/1 Ready
- ✅ Kafka Producer: 1/1 Ready
- ⚠️ Backend: Running (0/1 Ready)
- ⚠️ Frontend: Running (0/1 Ready)

### Unhealthy Services
- ❌ Backend: DNS resolution issues
- ❌ Frontend: Depends on backend
- ❌ Kafka Broker: CrashLoopBackOff
- ❌ Kafka Consumer: CrashLoopBackOff
- ❌ AI Agent: Pending (resource constraints)

---

## 🔧 Recommended Actions

### Immediate (High Priority)
1. **Investigate DNS Resolution**
   ```bash
   kubectl get pods -n kube-system | grep coredns
   kubectl logs -n kube-system -l k8s-app=kube-dns
   ```

2. **Test DNS from within cluster**
   ```bash
   kubectl run dns-test --image=busybox --rm -it --restart=Never -n airbnb-lab -- nslookup mongodb-service
   ```

3. **Check service selectors match pod labels**
   ```bash
   kubectl get svc mongodb-service -n airbnb-lab -o yaml
   kubectl get pods -l app=mongodb -n airbnb-lab
   ```

### Short Term (Medium Priority)
1. Monitor backend logs for successful connection
2. Once backend ready, restart frontend
3. Check Kafka broker logs and resource usage
4. Consider upgrading node types if budget allows

### Long Term (Low Priority)
1. Set up persistent volumes for databases
2. Configure proper resource limits
3. Set up monitoring and alerting
4. Document DNS troubleshooting procedures

---

## 📝 Notes

- **Local Docker Compose:** All services working perfectly ✅
- **ECR Images:** All images built and pushed successfully ✅
- **Kubernetes Manifests:** All configurations applied ✅
- **Git Repository:** All changes committed and pushed ✅

The main blocker is DNS resolution in the Kubernetes cluster. Once this is resolved, the backend should connect to databases, become ready, and the frontend should stabilize.

---

## 🔗 Related Files

- `AWS_DEPLOYMENT_STATUS.md` - Overall deployment status
- `k8s/backend-deployment.yaml` - Backend configuration
- `k8s/backend-configmap.yaml` - Backend environment variables
- `backend/src/config/session-mongo.js` - Session store configuration

---

**For troubleshooting commands and monitoring, see `AWS_DEPLOYMENT_STATUS.md`**

