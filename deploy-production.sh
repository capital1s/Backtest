#!/bin/bash
set -e

# Load production environment variables
if [ -f .env.production ]; then
  echo "Loading production environment variables from .env.production..."
  set -a
  source .env.production
  set +a
fi

# Set scaling defaults if not provided
BACKEND_SCALE="${BACKEND_SCALE:-1}"
FRONTEND_SCALE="${FRONTEND_SCALE:-1}"

# Detect SSL certs
SSL_CERT="ssl/server.crt"
SSL_KEY="ssl/server.key"
DOCKER_OVERRIDE="docker-compose.override.yml"
if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
  echo "SSL certificates detected. Enabling HTTPS for backend."
  cat > "$DOCKER_OVERRIDE" <<EOF
version: '3.8'
services:
  backend:
    volumes:
  - ./ssl/server.crt:/app/server.crt
  - ./ssl/server.key:/app/server.key
    command: uvicorn backend.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile /app/server.key --ssl-certfile /app/server.crt
EOF
else
  echo "No SSL certificates found. Backend will run without HTTPS."
  rm -f "$DOCKER_OVERRIDE"
fi

# Build and start all services with Docker Compose and scaling
export COMPOSE_PROJECT_NAME="backtest_prod"
# export COMPOSE_FILE=docker-compose.yml  # Ignored as requested

echo "Starting production deployment with Docker Compose..."
docker compose --env-file .env.production up -d --build --scale backend="$BACKEND_SCALE" --scale frontend="$FRONTEND_SCALE"

echo "Production deployment complete."
echo "Backend: https://prod-backend:8000 (if certs present) or http://prod-backend:8000"
echo "Frontend: https://prod-frontend:3100"
echo "Grafana: http://localhost:3001"
echo "Prometheus: http://localhost:9190"
echo "Nginx: http://localhost (HTTP) or https://localhost (HTTPS)"
