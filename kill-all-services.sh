#!/bin/bash

# Kill All Airbnb Services
# This script stops all running services for the Airbnb application

echo "🛑 Stopping All Airbnb Services"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Stop Kubernetes Services
echo -e "${YELLOW}1. Stopping Kubernetes services...${NC}"
if kubectl get namespace airbnb-lab &> /dev/null; then
    echo "   Deleting Kubernetes namespace 'airbnb-lab'..."
    kubectl delete namespace airbnb-lab
    echo -e "${GREEN}   ✅ Kubernetes services stopped${NC}"
else
    echo "   ℹ️  No Kubernetes services running"
fi
echo ""

# 2. Stop Docker Compose Services
echo -e "${YELLOW}2. Stopping Docker Compose services...${NC}"
if [ -f "docker-compose.yml" ]; then
    docker-compose down -v
    echo -e "${GREEN}   ✅ Docker Compose services stopped${NC}"
else
    echo "   ℹ️  docker-compose.yml not found"
fi
echo ""

# 3. Stop All Docker Containers
echo -e "${YELLOW}3. Stopping all Docker containers...${NC}"
CONTAINERS=$(docker ps -q)
if [ -n "$CONTAINERS" ]; then
    docker stop $CONTAINERS
    docker rm $CONTAINERS
    echo -e "${GREEN}   ✅ All Docker containers stopped and removed${NC}"
else
    echo "   ℹ️  No Docker containers running"
fi
echo ""

# 4. Kill Node.js Processes
echo -e "${YELLOW}4. Killing Node.js processes...${NC}"
NODE_PIDS=$(pgrep -f "node.*server.js|npm.*start|react-scripts")
if [ -n "$NODE_PIDS" ]; then
    kill -9 $NODE_PIDS 2>/dev/null
    echo -e "${GREEN}   ✅ Node.js processes killed${NC}"
else
    echo "   ℹ️  No Node.js processes running"
fi
echo ""

# 5. Kill Python/FastAPI Processes
echo -e "${YELLOW}5. Killing Python/FastAPI processes...${NC}"
PYTHON_PIDS=$(pgrep -f "uvicorn|simple_main|fastapi")
if [ -n "$PYTHON_PIDS" ]; then
    kill -9 $PYTHON_PIDS 2>/dev/null
    echo -e "${GREEN}   ✅ Python processes killed${NC}"
else
    echo "   ℹ️  No Python processes running"
fi
echo ""

# 6. Kill MySQL Processes (if running locally)
echo -e "${YELLOW}6. Stopping MySQL...${NC}"
if pgrep -f "mysqld" > /dev/null; then
    # Don't kill system MySQL, just note it
    echo "   ⚠️  MySQL is running (system service - not killing)"
    echo "   To stop MySQL manually:"
    echo "   macOS: brew services stop mysql"
    echo "   Linux: sudo systemctl stop mysql"
else
    echo "   ℹ️  MySQL not running locally"
fi
echo ""

# 7. Kill MongoDB Processes (if running locally)
echo -e "${YELLOW}7. Stopping MongoDB...${NC}"
if pgrep -f "mongod" > /dev/null; then
    echo "   ⚠️  MongoDB is running (system service - not killing)"
    echo "   To stop MongoDB manually:"
    echo "   macOS: brew services stop mongodb-community"
    echo "   Linux: sudo systemctl stop mongod"
else
    echo "   ℹ️  MongoDB not running locally"
fi
echo ""

# 8. Kill processes on specific ports
echo -e "${YELLOW}8. Freeing up ports...${NC}"
for PORT in 3000 5000 8000 3306 27017 9092 2181; do
    PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ -n "$PID" ]; then
        kill -9 $PID 2>/dev/null
        echo "   ✅ Killed process on port $PORT (PID: $PID)"
    fi
done
echo ""

# 9. Clean up Docker volumes (optional)
read -p "Do you want to remove Docker volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}9. Removing Docker volumes...${NC}"
    docker volume prune -f
    echo -e "${GREEN}   ✅ Docker volumes removed${NC}"
else
    echo "   ℹ️  Skipping volume cleanup"
fi
echo ""

# 10. Clean up Docker networks (optional)
read -p "Do you want to remove Docker networks? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}10. Removing Docker networks...${NC}"
    docker network prune -f
    echo -e "${GREEN}   ✅ Docker networks removed${NC}"
else
    echo "   ℹ️  Skipping network cleanup"
fi
echo ""

# Summary
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ All services stopped!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Summary of what was stopped:"
echo "  - Kubernetes namespace 'airbnb-lab' (if running)"
echo "  - Docker Compose services (if running)"
echo "  - All Docker containers"
echo "  - Node.js processes (frontend/backend)"
echo "  - Python/FastAPI processes (AI agent)"
echo "  - Processes on ports 3000, 5000, 8000, 3306, 27017, 9092, 2181"
echo ""
echo "Note: System services (MySQL, MongoDB) were not stopped."
echo "      Use brew/systemctl commands if you need to stop them."
echo ""

# Check if anything is still running
echo "Checking for remaining processes..."
REMAINING=$(docker ps -q | wc -l | tr -d ' ')
if [ "$REMAINING" -eq "0" ]; then
    echo -e "${GREEN}✅ No Docker containers running${NC}"
else
    echo -e "${YELLOW}⚠️  $REMAINING Docker container(s) still running${NC}"
    docker ps
fi
echo ""

# Check ports
echo "Checking ports..."
for PORT in 3000 5000 8000; do
    if lsof -ti:$PORT &> /dev/null; then
        echo -e "${YELLOW}⚠️  Port $PORT still in use${NC}"
    else
        echo -e "${GREEN}✅ Port $PORT is free${NC}"
    fi
done
echo ""

echo "Done! You can now start fresh with ./deploy.sh or docker-compose up"

