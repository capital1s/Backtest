# Scaling Backend and Frontend with Docker Compose

## Scale Backend
To run multiple backend containers:
```
docker compose up --scale backend=3 -d
```
This will start 3 backend containers. Adjust the number as needed.

## Scale Frontend
To run multiple frontend containers:
```
docker compose up --scale frontend=2 -d
```
This will start 2 frontend containers. Adjust the number as needed.


## Scale All Services Example
To scale both backend and frontend at once:
```
docker compose up --scale backend=3 --scale frontend=2 -d
```

## Environment Variables for Scaling
- Tune resource limits (CPU, memory) in `docker-compose.yml` for each service as needed.
- Use `.env.production` to set environment variables for each container.

## Notes
- Nginx will route requests to scaled backend/frontend containers.
- Monitor resource usage and adjust scaling based on load.
- For advanced orchestration, consider Kubernetes.
