#!/bin/zsh
# Automated workspace cache and dependency cleanup, then run Vitest

set -e

# Remove node_modules, lock files, Vite cache
rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml .vite

# Reinstall dependencies with legacy peer deps
npm install --legacy-peer-deps

# Run Vitest on the crosslayer test file
npx vitest run frontend/src/__tests__/GridForm.crosslayer.test.jsx
