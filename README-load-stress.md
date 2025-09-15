# Load/Stress Testing & Robustness

This project is fully instrumented for load, stress, and robustness validation. See below for procedures and scripts:

## Backend

- **Stress/Load Testing:**
  - Run Locust: `locust -f backend/locustfile.py --host=http://localhost:8000`
  - Run pytest-benchmark: `pytest backend/test_benchmark.py --benchmark-only`
- **Parallel Tests:**
  - Run all backend tests in parallel: `pytest`
- **Cleanup:**
  - Run: `bash scripts/cleanup.sh`
- **Security:**
  - Run: `bandit -r backend/`
- **Monitoring:**
  - Prometheus metrics at `/metrics`

## Frontend

- **Stress/Load Testing:**
  - Use `faker.js` factories in `src/testUtils/factories.js` for large datasets
  - Run: `npx vitest run --maxWorkers=16 --coverage`
- **Accessibility:**
  - Use axe-core in tests: see `src/__tests__/GridForm.accessibility.axe.test.jsx`
- **Security:**
  - Run: `npm audit`
- **Cleanup:**
  - Run: `npm run cleanup` (see `frontend/package-cleanup.json`)

## CI/CD

- All scripts and checks are integrated in `.github/workflows/ci.yml` for automated validation.

---

For more details, see individual scripts and config files in `backend/` and `frontend/` folders.
