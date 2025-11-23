#!/bin/bash

# Setup Environment Variables Script
# This script creates all necessary .env files with your API keys

echo "🔧 Setting up environment files..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Keys
OPENAI_KEY="YOUR_OPENAI_API_KEY"
TAVILY_KEY="YOUR_TAVILY_API_KEY"
SESSION_SECRET="distributed_key"

# 1. Create AI Agent .env
echo -e "${YELLOW}📝 Creating ai-agent/.env...${NC}"
cat > ai-agent/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=airbnb_db
DB_PORT=3306

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# OpenAI API Key (Required - for intelligent travel recommendations)
OPENAI_API_KEY=${OPENAI_KEY}

# OpenAI Model Configuration
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000

# Tavily API Key (For Real Web Search Data - Required for Lab)
TAVILY_API_KEY=${TAVILY_KEY}

# Backend Configuration
BACKEND_URL=http://localhost:5000
INTERNAL_API_KEY=airbnb_internal_key_2024
EOF
echo -e "${GREEN}✅ ai-agent/.env created${NC}"

# 2. Create Backend .env
echo -e "${YELLOW}📝 Creating backend/.env...${NC}"
cat > backend/.env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=airbnb_db
DB_PORT=3306

# MongoDB Configuration (Lab 2 Part 3)
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=admin
MONGO_PASSWORD=airbnb_mongo_2024
MONGO_DATABASE=airbnb_db

# Session Secret
SESSION_SECRET=${SESSION_SECRET}

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Internal API Key (for AI Agent)
INTERNAL_API_KEY=airbnb_internal_key_2024

# Kafka Configuration (Lab 2 Part 2)
KAFKA_BROKER=localhost:9092
EOF
echo -e "${GREEN}✅ backend/.env created${NC}"

# 3. Create Frontend .env
echo -e "${YELLOW}📝 Creating frontend/.env...${NC}"
cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_API_URL=http://localhost:8000
EOF
echo -e "${GREEN}✅ frontend/.env created${NC}"

# 4. Export environment variables for current session
echo ""
echo -e "${YELLOW}📤 Exporting environment variables...${NC}"
export OPENAI_API_KEY="${OPENAI_KEY}"
export TAVILY_API_KEY="${TAVILY_KEY}"
echo -e "${GREEN}✅ Environment variables exported${NC}"

echo ""
echo "========================================"
echo -e "${GREEN}🎉 All environment files created successfully!${NC}"
echo "========================================"
echo ""
echo "Files created:"
echo "  ✅ ai-agent/.env"
echo "  ✅ backend/.env"
echo "  ✅ frontend/.env"
echo ""
echo "API Keys configured:"
echo "  ✅ OpenAI API Key"
echo "  ✅ Tavily API Key"
echo "  ✅ Session Secret: distributed_key"
echo ""
echo "Kubernetes secret also updated:"
echo "  ✅ k8s/ai-agent-secret.yaml"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. For Docker Compose: docker-compose up -d"
echo "  2. For Kubernetes: ./deploy.sh"
echo "  3. For Development: ./run-guide/start-all.sh"
echo ""

