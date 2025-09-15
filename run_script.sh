#!/bin/zsh
# Activate the Python virtual environment and run the specified script

if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "Error: .venv directory not found. Please set up your Python virtual environment."
    exit 1
fi

if [ -z "$1" ]; then
    echo "Usage: $0 <script.py> [args...]"
    exit 1
fi

python "$@"
