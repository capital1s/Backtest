#!/usr/bin/env bash
# Safe frontend and backend test runner for macOS/Python 3.13+
# Backend: Sets multiprocessing start method to 'spawn' and runs pytest with xdist
# Frontend: Runs npm test in CI mode

PYTHON_BIN="${VIRTUAL_ENV:-.venv}/bin/python3"
if [ ! -x "$PYTHON_BIN" ]; then
    PYTHON_BIN="python3"
fi

# Backend: Set spawn method for multiprocessing if on macOS and Python >= 3.13
$PYTHON_BIN -c "import sys,platform,multiprocessing;\nif platform.system()=='Darwin' and sys.version_info>=(3,13):\n    multiprocessing.set_start_method('spawn',force=True)" || true

# Backend: Run pytest with xdist for safe parallelism
$PYTHON_BIN -m pytest --maxfail=1 --disable-warnings --dist=loadscope --numprocesses=2 backend
BACKEND_STATUS=$?

# Frontend: Run npm test in CI mode (no watch)
npm test --prefix frontend -- --watchAll=false
FRONTEND_STATUS=$?

# Exit with nonzero if either fails
if [ $BACKEND_STATUS -ne 0 ] || [ $FRONTEND_STATUS -ne 0 ]; then
    exit 1
fi
