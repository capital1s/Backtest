#!/bin/bash

# Grid Trading Dashboard Server Startup Script
# This script ensures both frontend and backend servers start properly and stay running

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="/Users/michaelpennell/Backtest"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
VENV_PATH="$PROJECT_ROOT/.venv"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✓ $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠ $1${NC}"
}

# Function to kill existing processes
cleanup_existing() {
    print_status "Cleaning up existing processes..."
    
    # Kill existing servers
    pkill -f "uvicorn.*main:app" 2>/dev/null || true
    pkill -f "python.*main.py" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    # Wait for processes to terminate
    sleep 3
    
    # Force kill if still running
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to wait for port to be available
wait_for_port_free() {
    local port=$1
    local timeout=30
    local count=0
    
    while ! check_port $port && [ $count -lt $timeout ]; do
        print_status "Waiting for port $port to be available..."
        sleep 1
        ((count++))
    done
    
    if [ $count -eq $timeout ]; then
        print_error "Timeout waiting for port $port to be available"
        return 1
    fi
    
    return 0
}

# Function to start backend server
start_backend() {
    print_status "Starting backend server..."
    
    if ! wait_for_port_free 8000; then
        return 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Activate virtual environment
    if [ ! -f "$VENV_PATH/bin/activate" ]; then
        print_error "Virtual environment not found at $VENV_PATH"
        return 1
    fi
    
    source "$VENV_PATH/bin/activate"
    
    # Start backend server in background
    nohup python main.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    local count=0
    while [ $count -lt 30 ]; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            print_success "Backend server started successfully (PID: $BACKEND_PID)"
            return 0
        fi
        sleep 1
        ((count++))
    done
    
    print_error "Backend server failed to start"
    return 1
}

# Function to start frontend server
start_frontend() {
    print_status "Starting frontend server..."
    
    if ! wait_for_port_free 3000; then
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $FRONTEND_DIR"
        return 1
    fi
    
    # Start frontend server in background
    nohup npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    local count=0
    while [ $count -lt 30 ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200\|404"; then
            print_success "Frontend server started successfully (PID: $FRONTEND_PID)"
            return 0
        fi
        sleep 1
        ((count++))
    done
    
    print_error "Frontend server failed to start"
    return 1
}

# Function to verify servers are running
verify_servers() {
    print_status "Verifying servers..."
    
    # Check backend
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200\|404"; then
        print_success "Frontend is responding"
    else
        print_error "Frontend is not responding"
        return 1
    fi
    
    return 0
}

# Function to display server status
show_status() {
    echo
    print_status "=== SERVER STATUS ==="
    echo
    
    # Backend status
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        print_success "Backend: http://localhost:8000/ (RUNNING)"
    else
        print_error "Backend: http://localhost:8000/ (NOT RUNNING)"
    fi
    
    # Frontend status
    if curl -s -o /dev/null http://localhost:3000/ 2>&1; then
        print_success "Frontend: http://localhost:3000/ (RUNNING)"
    else
        print_error "Frontend: http://localhost:3000/ (NOT RUNNING)"
    fi
    
    echo
    print_status "=== ACCESS YOUR DASHBOARD ==="
    echo -e "${GREEN}🌐 Open Safari and navigate to: http://localhost:3000/${NC}"
    echo
    print_status "=== LOGS ==="
    echo "Backend logs: tail -f $PROJECT_ROOT/backend.log"
    echo "Frontend logs: tail -f $PROJECT_ROOT/frontend.log"
    echo
}

# Main execution
main() {
    print_status "Starting Grid Trading Dashboard servers..."
    echo
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Cleanup existing processes
    cleanup_existing
    
    # Start backend
    if ! start_backend; then
        print_error "Failed to start backend server"
        exit 1
    fi
    
    # Start frontend
    if ! start_frontend; then
        print_error "Failed to start frontend server"
        exit 1
    fi
    
    # Verify both servers
    sleep 5
    if ! verify_servers; then
        print_error "Server verification failed"
        exit 1
    fi
    
    # Show final status
    show_status
    
    print_success "All servers started successfully!"
    print_status "Press Ctrl+C to stop monitoring (servers will continue running)"
    
    # Optional: Monitor servers
    while true; do
        sleep 30
        if ! verify_servers >/dev/null 2>&1; then
            print_warning "Server health check failed, attempting restart..."
            cleanup_existing
            start_backend && start_frontend
        fi
    done
}

# Handle Ctrl+C
trap 'print_status "Monitoring stopped. Servers are still running."; exit 0' INT

# Run main function
main "$@"