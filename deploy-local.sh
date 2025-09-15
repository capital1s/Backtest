#!/bin/bash
set -e

# Load environment variables from .env if present
if [ -f .env ]; then
  echo "Loading environment variables from .env..."
  set -a
  source .env
  set +a
fi

# Detect python and pip
PYTHON_BIN=""
PIP_BIN=""
if command -v python3 &>/dev/null; then
  PYTHON_BIN="python3"
else
  PYTHON_BIN="python"
fi
if command -v pip3 &>/dev/null; then
  PIP_BIN="pip3"
elif command -v pip &>/dev/null; then
  PIP_BIN="pip"
else
  echo "Error: pip is not installed. Please install pip or pip3."
  exit 1
fi

# Build and run backend
echo "Starting backend..."
$PIP_BIN install -r requirements.txt
nohup $PYTHON_BIN -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Health check backend
echo "Checking backend health..."
if curl -sSf http://localhost:8000/docs > /dev/null; then
  echo "Backend is healthy."
else
  echo "Backend health check failed! See backend.log for details."
  kill $BACKEND_PID
  exit 1
fi

echo "Backend running with PID $BACKEND_PID (logs: backend.log)"

# Build and run frontend
cd frontend
npm install
npm run build
nohup VITE_API_URL="$VITE_API_URL" VITE_THEME="$VITE_THEME" npx serve dist --listen 3000 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

# Health check frontend
echo "Checking frontend health..."
if curl -sSf http://localhost:3000 > /dev/null; then
  echo "Frontend is healthy."
else
  echo "Frontend health check failed! See frontend.log for details."
  kill $FRONTEND_PID
  exit 1
fi

cd ..
echo "Frontend running with PID $FRONTEND_PID (logs: frontend.log)"

echo "Deployment complete."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "To stop, run: kill $BACKEND_PID $FRONTEND_PID"
echo "Check backend.log and frontend.log for server output."
