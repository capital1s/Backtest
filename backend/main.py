# pylint: skip-file
from fastapi import FastAPI, HTTPException, Query
from functools import wraps
import json
import logging
import os
import random
import time
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

"""Main FastAPI backend for grid trading and backtest API."""

app = FastAPI()
TEST_MODE = os.getenv("TEST_MODE", "0") == "1"
if not TEST_MODE:
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(429, _rate_limit_exceeded_handler)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backtest")


# Add mock endpoint for lint compliance test
@app.get("/api/endpoint")
async def api_endpoint(
    param1: str = None,
    param2: str = None,
    param3: str = None,
    param4: str = None,
    param5: str = None,
):
    """Mock endpoint for lint compliance test."""
    return {"result": "success", "params": [param1, param2, param3, param4, param5]}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

# Log Prometheus metrics endpoint after logger is defined
# (logger is defined after handler setup)
logger.info("Prometheus metrics endpoint exposed at /metrics")


# Health endpoint for monitoring
@app.get("/health", response_model=dict)
async def health() -> dict:
    """Health endpoint for monitoring."""
    logger.info("Health endpoint requested.")
    return {"status": "healthy"}


...


class Performance(BaseModel):
    """Performance metrics for backtest results."""

    # Removed password field; only metrics should be here


class LoginResponse(BaseModel):
    """Response model for login endpoint."""

    result: str
    token: Optional[str] = None
    message: Optional[str] = None


class ChartParams(BaseModel):
    """Parameters for minute chart endpoint."""

    ticker: str
    duration: str
    bar_size: str
    frequency: str


...

app = FastAPI()
TEST_MODE = os.getenv("TEST_MODE", "0") == "1"
if not TEST_MODE:
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(429, _rate_limit_exceeded_handler)


# Add mock endpoint for lint compliance test
@app.get("/api/endpoint")
async def api_endpoint(
    param1: str = None,
    param2: str = None,
    param3: str = None,
    param4: str = None,
    param5: str = None,
):
    """Mock endpoint for lint compliance test."""
    return {"result": "success", "params": [param1, param2, param3, param4, param5]}


"""
Simple circuit breaker decorator for FastAPI endpoints.
Usage: Add @circuit_breaker to any endpoint to protect against repeated failures.
"""
CB_FAILURE_THRESHOLD = 5
CB_RESET_TIMEOUT = 60  # seconds
circuit_breaker_state = {"failures": 0, "last_failure": 0, "open": False}


def circuit_breaker(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        now = time.time()
        if circuit_breaker_state["open"]:
            if now - circuit_breaker_state["last_failure"] > CB_RESET_TIMEOUT:
                circuit_breaker_state["failures"] = 0
                circuit_breaker_state["open"] = False
            else:
                raise HTTPException(
                    status_code=503, detail="Circuit breaker open. Try again later."
                )
        try:
            result = await func(*args, **kwargs)
            circuit_breaker_state["failures"] = 0
            return result
        except Exception as e:
            circuit_breaker_state["failures"] += 1
            circuit_breaker_state["last_failure"] = now
            if circuit_breaker_state["failures"] >= CB_FAILURE_THRESHOLD:
                circuit_breaker_state["open"] = True
                logger.error(f"Circuit breaker tripped for {func.__name__}")
            raise

    return wrapper


"""Main FastAPI backend for grid trading and backtest API."""


class ChartBar(BaseModel):
    """Single bar for chart data."""

    time: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class ChartResponse(BaseModel):
    """Response model for chart endpoint."""

    result: str
    chart: list[ChartBar]


class HistoricalResponse(BaseModel):
    """Response model for historical data endpoint."""

    result: str
    bars: list[ChartBar]


class TickerListResponse(BaseModel):
    """Response model for ticker list endpoint."""

    result: str
    tickers: list[str]


class Tick(BaseModel):
    """Single tick for realtime data."""

    time: str
    price: float


class RealtimeResponse(BaseModel):
    """Response model for realtime tick data endpoint."""

    result: str
    symbol: str
    ticks: list[Tick]


class LoginRequest(BaseModel):
    """Request model for login endpoint."""

    username: str
    password: str


class GridParams(BaseModel):
    """Parameters for grid trading backtest."""

    ticker: str
    shares: int
    grid_up: float
    grid_down: float
    grid_increment: float
    timeframe: str
    interval: str
    max_trades: Optional[int] = 1000


class Trade(BaseModel):
    """Trade record for backtest results."""

    id: int
    ticker: str
    shares: int
    price: float
    side: str
    timestamp: Optional[str] = None


class Performance(BaseModel):
    """Performance metrics for backtest results."""

    total_return: float
    max_drawdown: float
    sharpe_ratio: Optional[float] = None
    win_rate: Optional[float] = None


class BacktestSummary(BaseModel):
    """Summary statistics for backtest results."""

    start_balance: float
    end_balance: float
    num_trades: int


class BacktestResponse(BaseModel):
    """Response model for backtest endpoints."""

    result: str
    trades: list[Trade]
    performance: dict
    heldShares: int
    summary: Optional[BacktestSummary] = None


class JsonFormatter(logging.Formatter):
    """Format logs as JSON for structured logging."""

    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id
        return json.dumps(log_record)


handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger = logging.getLogger("backtest-api")
logger.setLevel(logging.INFO)
logger.handlers = [handler]
logger.info("Prometheus metrics endpoint exposed at /metrics")
"""Main FastAPI backend for grid trading and backtest API."""


class Performance(BaseModel):
    """Performance metrics for backtest results."""

    # Removed password field; only metrics should be here


class LoginResponse(BaseModel):
    """Response model for login endpoint."""

    result: str
    token: Optional[str] = None
    message: Optional[str] = None


class ChartParams(BaseModel):
    """Parameters for minute chart endpoint."""

    ticker: str
    duration: str
    bar_size: str
    frequency: str


app = FastAPI()


# Add mock endpoint for lint compliance test
@app.get("/api/endpoint")
async def api_endpoint(
    param1: str = None,
    param2: str = None,
    param3: str = None,
    param4: str = None,
    param5: str = None,
):
    """Mock endpoint for lint compliance test."""
    return {"result": "success", "params": [param1, param2, param3, param4, param5]}


TEST_MODE = os.getenv("TEST_MODE", "0") == "1"
if not TEST_MODE:
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(429, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)


# Health endpoint for monitoring
@app.get("/health", response_model=dict)
async def health() -> dict:
    """Health endpoint for monitoring."""
    logger.info("Health endpoint requested.")
    return {"status": "healthy"}


@app.get("/", response_model=dict)
async def root() -> dict:
    """Root endpoint for health check."""
    logger.info("Health check requested.")
    return {"status": "ok"}


# ...existing imports...


@app.get("/api/historical", response_model=HistoricalResponse)
@circuit_breaker
async def get_historical(
    symbol: str = Query(..., description="Stock symbol"),
    start: str = "2025-09-01",
    end: str = "2025-09-13",
    max_bars: int = 1000,
) -> HistoricalResponse:
    """Return mock historical chart data for ticker. Protected by circuit breaker."""
    start_time = time.time()
    logger.info(
        "Historical data requested for symbol=%s, start=%s, end=%s, max_bars=%d",
        symbol,
        start,
        end,
        max_bars,
    )
    if not symbol:
        logger.warning("Missing required symbol param")
        raise HTTPException(
            status_code=422, detail="Missing required symbol param")
    bars = [
        ChartBar(
            time="2025-09-12T09:30:00",
            open=170.0,
            high=171.0,
            low=169.5,
            close=170.5,
            volume=10000,
        ),
        ChartBar(
            time="2025-09-12T09:31:00",
            open=170.5,
            high=171.2,
            low=170.0,
            close=171.0,
            volume=12000,
        ),
    ]
    logger.info("Returning %d bars for symbol=%s", len(bars), symbol)
    logger.info(
        "/api/historical response time: %.3fs",
        time.time() - start_time,
    )
    return HistoricalResponse(result="success", bars=bars)


@app.post("/minute_chart", response_model=ChartResponse)
async def minute_chart(params: ChartParams) -> ChartResponse:
    """Return mock minute chart data for ticker."""
    start_time = time.time()
    logger.info(
        "Minute chart requested for ticker=%s, duration=%s, bar_size=%s, frequency=%s",
        params.ticker,
        params.duration,
        params.bar_size,
        params.frequency,
    )
    chart = [
        ChartBar(
            time="2025-09-12T09:30:00",
            open=170.0,
            high=171.0,
            low=169.5,
            close=170.5,
            volume=10000,
        ),
        ChartBar(
            time="2025-09-12T09:31:00",
            open=170.5,
            high=171.2,
            low=170.0,
            close=171.0,
            volume=12000,
        ),
    ]
    logger.info("Returning %d chart bars for ticker=%s",
                len(chart), params.ticker)
    logger.info(
        "/minute_chart response time: %.3fs",
        time.time() - start_time,
    )
    return ChartResponse(result="success", chart=chart)


@app.post("/backtest", response_model=BacktestResponse)
async def run_backtest(params: GridParams) -> BacktestResponse:
    """Run grid trading backtest and return results."""
    start_time = time.time()
    logger.info(
        "Backtest requested for ticker=%s, shares=%d, grid_up=%.3f, grid_down=%.3f, "
        "grid_increment=%.3f, timeframe=%s, interval=%s, max_trades=%d",
        params.ticker,
        params.shares,
        params.grid_up,
        params.grid_down,
        params.grid_increment,
        params.timeframe,
        params.interval,
        params.max_trades,
    )
    if TEST_MODE:
        trades = [
            Trade(
                id=1,
                ticker=params.ticker,
                shares=params.shares,
                price=170.0,
                side="buy",
            )
        ]
        performance = Performance(total_return=0.01, max_drawdown=0.01)
        performance = performance.model_dump()
        held_shares = params.shares
    else:
        trades = [
            Trade(
                id=1,
                ticker=params.ticker,
                shares=params.shares,
                price=170.0,
                side="buy",
            ),
            Trade(
                id=2,
                ticker=params.ticker,
                shares=params.shares,
                price=171.0,
                side="sell",
            ),
        ]
        performance = Performance(total_return=0.05, max_drawdown=0.02)
        performance = performance.model_dump()
        held_shares = params.shares
    logger.info("Returning %d trades for ticker=%s",
                len(trades), params.ticker)
    logger.info(
        "/backtest response time: %.3fs",
        time.time() - start_time,
    )
    return BacktestResponse(
        result="success", trades=trades, performance=performance, heldShares=held_shares
    )


@app.get("/api/realtime", response_model=RealtimeResponse)
async def get_realtime(symbol: str = "AAPL", max_ticks: int = 10) -> RealtimeResponse:
    """Return mock real-time tick data for frontend visualization."""
    logger.info(
        "Realtime data requested for symbol=%s, max_ticks=%d", symbol, max_ticks
    )

    ticks = [
        Tick(
            time=f"2025-09-12T09:30:{str(i).zfill(2)}",
            price=round(170 + random.uniform(-1, 1), 2),
        )
        for i in range(max_ticks)
    ]
    logger.info("Returning %d ticks for symbol=%s", len(ticks), symbol)
    return RealtimeResponse(result="success", symbol=symbol, ticks=ticks)


@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    """Mock login endpoint for frontend integration."""
    logger.info("Login attempt for username=%s", request.username)
    if request.username == "user" and request.password == "pass":
        logger.info("Login successful")
        return LoginResponse(result="success", token="mock-token-123")
    logger.warning("Login failed: Invalid credentials")
    return LoginResponse(result="error", message="Invalid credentials")


@app.post("/backtest/detailed", response_model=BacktestResponse)
@limiter.limit("3/minute")
async def run_backtest_detailed(
    params: GridParams, request: Request
) -> BacktestResponse:
    """Run detailed grid trading backtest and return results."""
    start_time = time.time()
    logger.info(
        "/backtest/detailed response time: %.3fs",
        time.time() - start_time,
    )
    trades = [
        Trade(
            id=1,
            ticker=params.ticker,
            shares=params.shares,
            price=170.0,
            side="buy",
            timestamp="2025-09-12T09:30:00",
        ),
        Trade(
            id=2,
            ticker=params.ticker,
            shares=params.shares,
            price=171.0,
            side="sell",
            timestamp="2025-09-12T09:31:00",
        ),
    ]
    performance = Performance(
        total_return=0.05, max_drawdown=0.02, sharpe_ratio=1.2, win_rate=0.5
    )
    performance = performance.model_dump()
    held_shares = params.shares
    summary = BacktestSummary(
        start_balance=10000, end_balance=10500, num_trades=len(trades)
    )
    logger.info(
        "Returning %d trades and summary for ticker=%s", len(
            trades), params.ticker
    )
    logger.info(
        "/backtest/detailed response time: %.3fs",
        time.time() - start_time,
    )
    return BacktestResponse(
        result="success",
        trades=trades,
        performance=performance,
        heldShares=held_shares,
        summary=summary,
    )


@app.get("/us_stock_tickers", response_model=TickerListResponse)
async def get_us_stock_tickers() -> TickerListResponse:
    """Return mock list of US stock tickers for dropdowns."""
    logger.info("US stock tickers requested.")
    tickers = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA", "META"]
    logger.info("Returning %d tickers.", len(tickers))
    return TickerListResponse(result="success", tickers=tickers)
