#!/bin/bash

echo "🚀 Starting Airbnb Application..."
echo ""

# Get the project directory
PROJECT_DIR="<folder>/Airbnb"

# Open Terminal and run all services in separate tabs
osascript <<EOF

tell application "Terminal"
    activate
    
    -- Tab 1: Backend
    do script "cd '$PROJECT_DIR/backend' && echo '🔧 Starting Backend...' && npm run dev"
    delay 2
    
    -- Tab 2: Frontend
    tell application "System Events" to keystroke "t" using command down
    delay 1
    do script "cd '$PROJECT_DIR/frontend' && echo '⚛️  Starting Frontend...' && npm start" in front window
    delay 2
    
    -- Tab 3: Ollama
    tell application "System Events" to keystroke "t" using command down
    delay 1
    do script "echo '🤖 Starting Ollama AI Server...' && ollama serve" in front window
    delay 2
    
    -- Tab 4: AI Agent
    tell application "System Events" to keystroke "t" using command down
    delay 1
    do script "cd '$PROJECT_DIR/ai-agent' && source venv/bin/activate && echo '🧠 Starting AI Agent...' && python app/main.py" in front window
    
end tell

EOF

echo ""
echo "✅ All services are starting in separate Terminal tabs!"
echo ""
echo "📱 Access the application at:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000/api-docs"
echo "   AI Agent:  http://localhost:8000/docs"
echo ""
echo "🔑 Login with:"
echo "   Traveler: traveler@test.com / password123"
echo "   Owner:    owner@test.com / password123"
echo ""
echo "💡 To stop all services: Press Ctrl+C in each tab"
echo ""

