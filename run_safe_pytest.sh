#!/usr/bin/env bash
# Safe pytest runner for macOS/Python 3.13+
# Sets multiprocessing start method to 'spawn' and runs pytest with xdist

PYTHON_BIN="${VIRTUAL_ENV:-.venv}/bin/python3"
if [ ! -x "$PYTHON_BIN" ]; then
    PYTHON_BIN="python3"
fi

# Set spawn method for multiprocessing if on macOS and Python >= 3.13
$PYTHON_BIN -c "import sys,platform,multiprocessing;\nif platform.system()=='Darwin' and sys.version_info>=(3,13):\n    multiprocessing.set_start_method('spawn',force=True)" || true

# Run pytest with xdist for safe parallelism
$PYTHON_BIN -m pytest --maxfail=1 --disable-warnings --dist=loadscope --numprocesses=2 backend
