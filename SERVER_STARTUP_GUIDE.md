# Grid Trading Dashboard - Server Startup Guide

## 🚀 Quick Start Commands

### Start Both Servers (Recommended)

```bash
cd /Users/michaelpennell/Backtest

# Start backend
source .venv/bin/activate && cd backend && python main.py &

# Start frontend (in new terminal)
cd /Users/michaelpennell/Backtest/frontend && npm run dev
```

### Alternative: Use NPM Scripts

```bash
cd /Users/michaelpennell/Backtest

# Start backend
npm run dev:backend &

# Start frontend
npm run dev:frontend
```

## 🔍 Health Check

```bash
# Quick health check
cd /Users/michaelpennell/Backtest && ./check-health.sh

# Manual checks
curl http://localhost:8000/health  # Backend
curl http://localhost:3000/        # Frontend
```

## 🌐 Access Your Dashboard

Once both servers are running:
**Open Safari and go to: http://localhost:3000/**

## 🛠 Troubleshooting

### If Safari Can't Connect:

1. **Clear Safari cache**: Safari → Develop → Empty Caches
2. **Force refresh**: Cmd+Shift+R
3. **Try Chrome/Firefox** as alternative
4. **Check server status**: Run health check script

### If Servers Keep Stopping:

1. **Check logs**:
   - Backend: `tail -f /Users/michaelpennell/Backtest/backend.log`
   - Frontend: Check terminal output
2. **Restart servers**: Use the quick start commands above
3. **Kill stuck processes**:
   ```bash
   pkill -f "python.*main.py"
   pkill -f "npm.*dev"
   pkill -f "vite"
   ```

### Recent Fixes Applied:

✅ **Added proper server startup code** to backend/main.py
✅ **Improved Vite configuration** for better stability
✅ **Created monitoring scripts** for health checking
✅ **Fixed frontend/backend communication**

## 📝 Server Status Indicators

- **Backend Ready**: "Uvicorn running on http://0.0.0.0:8000"
- **Frontend Ready**: "Local: http://localhost:3000/"
- **Health Check**: Both return successful responses

## 🎯 Dashboard Features

Once connected, you'll have access to:

- Stock ticker selection dropdown
- Interactive price charts with Chart.js
- Grid trading parameter configuration
- Dynamic backtest execution
- Trade results display with buy/sell details
- Performance metrics and statistics

The grid trading algorithm is fully functional and will generate trades based on your configured parameters (grid_up, grid_down, grid_increment).
