#!/usr/bin/env bash
# Safe full validation for CI/CD: backend and frontend tests
# Backend: Sets multiprocessing start method to 'spawn' and runs pytest with xdist
# Frontend: Runs npm test in CI mode

set -e

PYTHON_BIN="${VIRTUAL_ENV:-.venv}/bin/python3"
if [ ! -x "$PYTHON_BIN" ]; then
    PYTHON_BIN="python3"
fi

# Backend: Set spawn method for multiprocessing if on macOS and Python >= 3.13
$PYTHON_BIN -c "import sys,platform,multiprocessing;\nif platform.system()=='Darwin' and sys.version_info>=(3,13):\n    multiprocessing.set_start_method('spawn',force=True)" || true


# Backend: Run pytest with xdist and generate JUnit XML report
$PYTHON_BIN -m pytest --maxfail=1 --disable-warnings --dist=loadscope --numprocesses=2 --junitxml=backend_test_report.xml backend

# Frontend: Run npm test in CI mode (no watch), output Jest JSON report
npm test --prefix frontend -- --watchAll=false --json --outputFile=frontend_test_report.json
