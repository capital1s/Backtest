# Robustness Features

This project implements advanced robustness features for both frontend and backend:

- **Error Boundaries**: Frontend components catch and display errors gracefully, ensuring the UI remains usable even if a component fails.
- **Retry Logic**: API calls automatically retry on transient failures, improving reliability under load and network instability.
- **Input Validation**: All form fields are validated for type, range, and format before submission. Invalid input triggers clear, accessible error messages.
- **Enhanced Diagnostics**: Error and success states are logged and displayed with accessible roles (`role="alert"` for errors, `role="status"` for success/loading). Diagnostic messages are available in the console for debugging.
- **Test Coverage**: Automated test suites (frontend: Vitest, backend: pytest) validate all robustness features, including error handling, loading states, and edge cases. Run `npx vitest run` for frontend and `pytest` for backend.

## How to Test Robustness

1. **Run Automated Tests**: All robustness features are covered by tests. Use:
   - `npx vitest run` (frontend)
   - `pytest` (backend)

2. **Manual Testing**:
   - Submit forms with invalid, missing, or edge-case data to verify error messages and input validation.
   - Simulate API/network failures to confirm retry logic and error boundaries.

3. **Diagnostics**:
   - Check browser console and test output for detailed error/success state logs.

## Accessibility

All error and success messages use proper ARIA roles for screen reader support. Loading spinners and alerts are announced to users with assistive technology.

## CI/CD Integration

Robustness tests are included in the CI pipeline. All pushes and pull requests trigger automated test runs to ensure reliability and code quality.

---

For more details, see the source code and test files in `frontend/src/__tests__` and backend test suite.

# Health Check & Alerting

## Health Check Endpoint

The backend exposes `/health` for health monitoring. Example:

```
GET http://localhost:8000/health
```

Returns `{ "status": "ok" }` if healthy.

## Alerting Setup

Prometheus can be configured with Alertmanager for automated alerts. Example alert rule:

```
groups:
	- name: backend-health
		rules:
			- alert: BackendDown
				expr: up{job="fastapi-backend"} == 0
				for: 1m
				labels:
					severity: critical
				annotations:
					summary: "Backend is down"
```

See `monitoring/prometheus.yml` and Prometheus docs for integration.

# Grid Trading Bot with IBKR Backtesting

![CI](https://github.com/<your-org-or-username>/<your-repo>/actions/workflows/ci.yml/badge.svg)

## Architecture Overview

This project uses a FastAPI backend (Python) and a React/Vite frontend (Node.js). Backend and frontend communicate via REST API. Monitoring is provided by Prometheus and Grafana. Deployment is automated with Docker Compose and CI/CD via GitHub Actions.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository and create a feature branch.
2. Ensure all tests pass locally (`pytest backend`, `npm test -- --run frontend`).
3. Run lint and type checks (`flake8`, `black --check`, `mypy` for backend; `npm run lint` for frontend).
4. Submit a pull request with a clear description of your changes.

### Code Style

- Python: PEP8, checked by flake8 and black
- Type hints required for all public functions/classes
- JavaScript/TypeScript: StandardJS, checked by ESLint

### Issues

If you find a bug or have a feature request, please open an issue in GitHub.

This project is a full-stack application for dynamic grid trading and backtesting U.S. stocks under $1, integrated with Interactive Brokers (IBKR).

## Features

- Dynamic grid trading logic
- Historical backtesting (daily, weekly, monthly)
- IBKR API integration (ib_insync)
- Real-time UI for input and visualization
- Chart of trade activity
- Three sortable columns: bought, sold, held
- Shares held view, sortable by time or grid level

## Structure

- `backend/`: Python FastAPI server, grid logic, IBKR integration, backtesting
- `frontend/`: React UI, chart, tables, input form

## Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm
- pip

### Quickstart

1. Clone the repository and navigate to the project root.
2. Create a `.env` file in the root directory (see example below).
3. Run `bash deploy-local.sh` for local development, or use Docker Compose for production.

### Environment Variables

All services use environment variables for configuration. Documented below:

#### Backend (.env)

- `API_KEY`: Your IBKR or external API key (set in `.env`, never hardcoded)
- `DB_URL`: Database connection string (e.g., `sqlite:///./test.db`, `postgresql://user:pass@host:port/db`)

#### Frontend (.env)

- `VITE_API_URL`: Backend API base URL (default: `http://localhost:8000`)
- `VITE_THEME`: UI theme (`dark` or `light`)

#### Database (Docker Compose)

- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password

#### Monitoring

- Prometheus and Grafana use default ports and auto-import dashboards from `monitoring/`

#### SSL

- Place `server.crt` and `server.key` in `ssl/` for HTTPS support

### Scaling

- To scale services, update `docker-compose.yml` with `replicas` or adjust resource limits
- For production, use environment variables to configure DB, API keys, and frontend URLs
- All environment variables should be documented in `.env.example` for onboarding

### Running Locally

Run the deployment script:

```
bash deploy-local.sh
```

- Backend runs at http://localhost:8000
- Frontend runs at http://localhost:3000
- Logs are saved to `backend.log` and `frontend.log`.

### Running with Docker Compose

```
docker-compose up --build
```

- All services (backend, frontend, db, prometheus, grafana, nginx) are started and monitored with healthchecks.
- Grafana dashboards and Prometheus metrics are auto-imported.

### Stopping Servers

To stop both servers:

```
kill <BACKEND_PID> <FRONTEND_PID>
```

Or use `docker-compose down` for Docker.

### Troubleshooting

- If health checks fail, check `backend.log` or `frontend.log` for errors.
- Ensure Python, pip, Node.js, and npm are installed and available in your PATH.
- If ports 8000 or 3000 are in use, stop other services or change the ports in `deploy-local.sh` or `docker-compose.yml`.
- For environment variable changes, update `.env` and re-run the script.
- For SSL, place certificates in `ssl/` and re-run `deploy-production.sh`.

### Monitoring & Metrics

- Prometheus scrapes backend metrics at `/metrics`.
- Grafana dashboards are auto-imported from `monitoring/grafana-dashboard.json`.
- Access Grafana at http://localhost:3001 (default login: admin/admin).

### Scaling & Environment Variables

- All environment variables are documented in `.env.example`.
- For scaling, update `docker-compose.yml` and environment variables as needed.

### Advanced

- Customize environment variables in `.env` for API keys, database URLs, or frontend config.
- For production, use Docker Compose or a process manager (e.g., PM2, Supervisor).

## API Endpoints & Usage Examples

- `POST /backtest`: Run a grid trading backtest
  Example:

  ```bash
  curl -X POST http://localhost:8000/backtest \
  	-H "Content-Type: application/json" \
  	-d '{
  		"ticker": "AAPL",
  		"shares": 10,
  		"grid_up": 1.05,
  		"grid_down": 0.95,
  		"grid_increment": 0.01,
  		"timeframe": "1 D",
  		"interval": "1 min"
  	}'
  ```

- `GET /api/historical`: Fetch historical data
  Example:

  ```bash
  curl http://localhost:8000/api/historical?ticker=AAPL&timeframe=1D
  ```

- `GET /api/realtime`: Fetch real-time data
  Example:

  ```bash
  curl http://localhost:8000/api/realtime?ticker=AAPL
  ```

- `GET /api/login`: Login endpoint
  Example:

  ```bash
  curl -X GET http://localhost:8000/api/login?user=demo&password=demo
  ```

- `GET /us_stock_tickers`: List US stock tickers
  Example:
  ```bash
  curl http://localhost:8000/us_stock_tickers
  ```

### OpenAPI/Swagger Docs

The backend provides interactive API documentation at:

- [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
- [http://localhost:8000/redoc](http://localhost:8000/redoc) (ReDoc)

All endpoints are documented automatically via FastAPI.

# Backtest Project

## Local Deployment

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm
- pip

### Setup

1. Clone the repository and navigate to the project root.
2. Create a `.env` file in the root directory (see `.env.example` for reference; never commit real credentials).
3. Ensure `requirements.txt` is present in the root directory.

### Environment Variables

Create a `.env` file with the following example content:

```
# Backend environment variables
API_KEY=your_api_key_here
DB_URL=sqlite:///./test.db

# Frontend environment variables
VITE_API_URL=http://localhost:8000
VITE_THEME=dark
```

### Running Locally

Run the deployment script:

```
bash deploy-local.sh
```

- This will install dependencies, start backend and frontend servers, and perform health checks.
- Backend runs at http://localhost:8000
- Frontend runs at http://localhost:3000
- Logs are saved to `backend.log` and `frontend.log`.

### Stopping Servers

To stop both servers:

```
kill <BACKEND_PID> <FRONTEND_PID>
```

PIDs are shown after deployment.

### Troubleshooting

- If health checks fail, check `backend.log` or `frontend.log` for errors.
- Ensure Python, pip, Node.js, and npm are installed and available in your PATH.
- If ports 8000 or 3000 are in use, stop other services or change the ports in `deploy-local.sh`.
- For environment variable changes, update `.env` and re-run the script.

### Advanced

- Customize environment variables in `.env` for API keys, database URLs, or frontend config. Never hardcode credentials; always use environment variables and document them in `.env.example`.
- For production, consider using Docker or a process manager (e.g., PM2, Supervisor).
