#!/bin/bash

# Verify Hybrid Deployment
# Checks that all services are running correctly

set -e

echo "🔍 Verifying Hybrid Deployment"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Check 1: Kubectl connectivity
echo "1️⃣  Checking kubectl connectivity..."
if kubectl cluster-info &> /dev/null; then
    CONTEXT=$(kubectl config current-context)
    echo -e "${GREEN}✅ Connected to: $CONTEXT${NC}"
else
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: Namespace exists
echo "2️⃣  Checking namespace..."
if kubectl get namespace airbnb-lab &> /dev/null; then
    echo -e "${GREEN}✅ Namespace 'airbnb-lab' exists${NC}"
else
    echo -e "${RED}❌ Namespace 'airbnb-lab' not found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 3: Pods status
echo "3️⃣  Checking pods..."
kubectl get pods -n airbnb-lab
echo ""

RUNNING_PODS=$(kubectl get pods -n airbnb-lab --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l | tr -d ' ')
TOTAL_PODS=$(kubectl get pods -n airbnb-lab --no-headers 2>/dev/null | wc -l | tr -d ' ')

if [ "$RUNNING_PODS" -eq "$TOTAL_PODS" ] && [ "$TOTAL_PODS" -gt 0 ]; then
    echo -e "${GREEN}✅ All $TOTAL_PODS pods are running${NC}"
else
    echo -e "${YELLOW}⚠️  $RUNNING_PODS out of $TOTAL_PODS pods are running${NC}"
    WARNINGS=$((WARNINGS + 1))
    
    # Show non-running pods
    echo ""
    echo "Non-running pods:"
    kubectl get pods -n airbnb-lab --field-selector=status.phase!=Running --no-headers 2>/dev/null || echo "None"
fi
echo ""

# Check 4: Services
echo "4️⃣  Checking services..."
kubectl get svc -n airbnb-lab
echo ""

# Check for LoadBalancers
FRONTEND_LB=$(kubectl get svc frontend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
BACKEND_LB=$(kubectl get svc backend-service -n airbnb-lab -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [ -n "$FRONTEND_LB" ]; then
    echo -e "${GREEN}✅ Frontend LoadBalancer: $FRONTEND_LB${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend LoadBalancer not ready yet${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -n "$BACKEND_LB" ]; then
    echo -e "${GREEN}✅ Backend LoadBalancer: $BACKEND_LB${NC}"
else
    echo -e "${YELLOW}⚠️  Backend LoadBalancer not ready yet${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 5: Backend database connectivity
echo "5️⃣  Checking backend database connectivity..."
BACKEND_POD=$(kubectl get pod -n airbnb-lab -l app=backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$BACKEND_POD" ]; then
    echo "Checking backend pod: $BACKEND_POD"
    
    # Check logs for database connection
    if kubectl logs -n airbnb-lab "$BACKEND_POD" --tail=50 2>/dev/null | grep -q "Database connected successfully"; then
        echo -e "${GREEN}✅ MySQL connection successful${NC}"
    else
        echo -e "${RED}❌ MySQL connection failed${NC}"
        ERRORS=$((ERRORS + 1))
        echo "Recent logs:"
        kubectl logs -n airbnb-lab "$BACKEND_POD" --tail=20 | grep -i "database\|error" || echo "No relevant logs"
    fi
    
    if kubectl logs -n airbnb-lab "$BACKEND_POD" --tail=50 2>/dev/null | grep -q "MongoDB Connected"; then
        echo -e "${GREEN}✅ MongoDB connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB connection status unclear${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ No backend pod found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 6: Local databases
echo "6️⃣  Checking local databases..."
cd /Users/vidushi/PycharmProjects/Airbnb_distributed

if docker ps | grep -q "airbnb-mysql"; then
    echo -e "${GREEN}✅ Local MySQL is running${NC}"
    
    # Check if accessible
    if docker exec airbnb-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo -e "${GREEN}✅ MySQL is responding${NC}"
    else
        echo -e "${RED}❌ MySQL is not responding${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Local MySQL is not running${NC}"
    ERRORS=$((ERRORS + 1))
fi

if docker ps | grep -q "airbnb-mongodb"; then
    echo -e "${GREEN}✅ Local MongoDB is running${NC}"
    
    # Check if accessible
    if docker exec airbnb-mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null | grep -q "ok"; then
        echo -e "${GREEN}✅ MongoDB is responding${NC}"
    else
        echo -e "${RED}❌ MongoDB is not responding${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Local MongoDB is not running${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 7: Kafka
echo "7️⃣  Checking Kafka..."
KAFKA_POD=$(kubectl get pod -n airbnb-lab -l app=kafka -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$KAFKA_POD" ]; then
    KAFKA_STATUS=$(kubectl get pod -n airbnb-lab "$KAFKA_POD" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
    if [ "$KAFKA_STATUS" == "Running" ]; then
        echo -e "${GREEN}✅ Kafka is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Kafka status: $KAFKA_STATUS${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ Kafka pod not found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 8: ConfigMaps
echo "8️⃣  Checking ConfigMaps..."
if kubectl get configmap backend-config -n airbnb-lab &> /dev/null; then
    DB_HOST=$(kubectl get configmap backend-config -n airbnb-lab -o jsonpath='{.data.DB_HOST}' 2>/dev/null || echo "")
    if [ "$DB_HOST" == "YOUR_PUBLIC_IP_HERE" ]; then
        echo -e "${RED}❌ ConfigMap not updated with public IP${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ ConfigMap configured with IP: $DB_HOST${NC}"
    fi
else
    echo -e "${RED}❌ backend-config ConfigMap not found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 9: Test API endpoint
if [ -n "$BACKEND_LB" ]; then
    echo "9️⃣  Testing backend API..."
    HEALTH_RESPONSE=$(curl -s "http://$BACKEND_LB:5000/api/health" 2>/dev/null || echo "")
    
    if [ -n "$HEALTH_RESPONSE" ]; then
        echo -e "${GREEN}✅ Backend API is responding${NC}"
        echo "Response: $HEALTH_RESPONSE"
    else
        echo -e "${YELLOW}⚠️  Backend API not responding (might still be starting)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    echo ""
else
    echo "9️⃣  Skipping API test (LoadBalancer not ready)"
    echo ""
fi

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Perfect! Everything is working correctly!${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) - Deployment mostly working${NC}"
    echo ""
    echo "Some services may still be starting up."
    echo "Wait a few minutes and run this script again."
else
    echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found${NC}"
    echo ""
    echo "Please review the errors above and fix them."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 Access URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$FRONTEND_LB" ]; then
    echo -e "${BLUE}Frontend:${NC} http://$FRONTEND_LB"
else
    echo "Frontend: ⏳ Not ready yet"
fi

if [ -n "$BACKEND_LB" ]; then
    echo -e "${BLUE}Backend API:${NC} http://$BACKEND_LB:5000/api"
    echo -e "${BLUE}Health Check:${NC} http://$BACKEND_LB:5000/api/health"
else
    echo "Backend: ⏳ Not ready yet"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "1. Fix the errors listed above"
    echo "2. Check logs: kubectl logs -l app=backend -n airbnb-lab"
    echo "3. Restart deployments: kubectl rollout restart deployment/backend -n airbnb-lab"
    echo "4. Run this script again to verify"
elif [ $WARNINGS -gt 0 ]; then
    echo "1. Wait 2-3 minutes for services to fully start"
    echo "2. Run this script again: ./verify-deployment.sh"
    echo "3. If warnings persist, check logs: kubectl logs -l app=backend -n airbnb-lab"
else
    echo "1. Access your application at the URLs above"
    echo "2. Test all features (login, search, booking)"
    echo "3. Monitor logs: kubectl logs -f -l app=backend -n airbnb-lab"
    echo "4. Set up monitoring and alerts"
fi

echo ""

exit $ERRORS

