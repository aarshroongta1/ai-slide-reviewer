#!/bin/bash

# AI Slide Reviewer - Service Startup Script
# This script starts all services on their correct ports to avoid conflicts

echo "🚀 Starting AI Slide Reviewer Services..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Check all required ports
echo -e "${BLUE}🔍 Checking port availability...${NC}"
check_port 3000 || exit 1
check_port 4111 || exit 1
check_port 4112 || exit 1

echo ""
echo -e "${GREEN}✅ All ports are available!${NC}"
echo ""

# Start services in background
echo -e "${BLUE}🚀 Starting services...${NC}"
echo ""

# Start Frontend (Next.js) on port 3000
echo -e "${YELLOW}📱 Starting Frontend (Next.js) on port 3000...${NC}"
npm run dev &
FRONTEND_PID=$!

# Start Main Backend (Mastra) on port 4111
echo -e "${YELLOW}🔧 Starting Main Backend (Mastra) on port 4111...${NC}"
cd mastra-backend
npm run dev &
MAIN_BACKEND_PID=$!
cd ..

# Start Slide AI Backend on port 4112
echo -e "${YELLOW}🤖 Starting Slide AI Backend on port 4112...${NC}"
cd mastra/slide-ai
npm run dev &
SLIDE_AI_PID=$!
cd ../..

echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Service URLs:${NC}"
echo -e "  Frontend (Next.js):     ${GREEN}http://localhost:3000${NC}"
echo -e "  Main Backend (Mastra):  ${GREEN}http://localhost:4111${NC}"
echo -e "  Slide AI Backend:       ${GREEN}http://localhost:4112${NC}"
echo ""
echo -e "${BLUE}🔍 Health Checks:${NC}"
echo -e "  Main Backend:  ${GREEN}http://localhost:4111/health${NC}"
echo -e "  Slide AI:      ${GREEN}http://localhost:4112/health${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    kill $MAIN_BACKEND_PID 2>/dev/null
    kill $SLIDE_AI_PID 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup SIGINT

echo -e "${BLUE}💡 Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for all background processes
wait
