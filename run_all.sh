#!/bin/bash
# Auto environment setup and run helper for Backtest project
#!/bin/bash
# Optimized environment setup and workflow for Backtest project
set -e

# Activate virtual environment only if not already active
if [[ -z "$VIRTUAL_ENV" ]]; then
  source /Users/michaelpennell/Backtest/.venv/bin/activate
fi

# Change to backend directory if not already there
if [[ "$(pwd)" != "/Users/michaelpennell/Backtest/backend" ]]; then
  cd /Users/michaelpennell/Backtest/backend
fi

# Start FastAPI backend (in background, only if not running)
if ! pgrep -f "uvicorn main:app" > /dev/null; then
  nohup uvicorn main:app --reload &> uvicorn.log &
  echo "FastAPI backend started. Logs: backend/uvicorn.log"
else
  echo "FastAPI backend already running."
fi

# Run all Python scripts in parallel for efficiency
for script in grid_bot.py backtest.py test_ibkr_client.py; do
  source /Users/michaelpennell/Backtest/.venv/bin/activate
  ./.venv/bin/python "$script" &
done

wait
