#!/bin/bash
# Clean up test artifacts, temp files, and caches
find backend/ -type f -name '*.pyc' -delete
find backend/ -type d -name '__pycache__' -exec rm -rf {} +
rm -rf backend/.pytest_cache
rm -rf frontend/.vitest
rm -rf frontend/coverage
rm -rf frontend/node_modules/.cache
