#!/bin/bash

# Server Health Check Script
# Quick script to check if both servers are running

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Checking server health..."
echo

# Check backend
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "Backend (8000): ${GREEN}✓ HEALTHY${NC}"
    BACKEND_OK=true
else
    echo -e "Backend (8000): ${RED}✗ DOWN${NC}"
    BACKEND_OK=false
fi

# Check frontend
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "404" ]]; then
    echo -e "Frontend (3000): ${GREEN}✓ RUNNING${NC}"
    FRONTEND_OK=true
else
    echo -e "Frontend (3000): ${RED}✗ DOWN${NC}"
    FRONTEND_OK=false
fi

echo

# Show running processes
echo "🔧 Running processes:"
lsof -i :8000 | grep LISTEN | head -1 || echo "No process on port 8000"
lsof -i :3000 | grep LISTEN | head -1 || echo "No process on port 3000"

echo

# Overall status
if $BACKEND_OK && $FRONTEND_OK; then
    echo -e "${GREEN}🎉 All servers are running! Access dashboard at: http://localhost:3000/${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some servers are down. Run ./start-servers.sh to restart.${NC}"
    exit 1
fi