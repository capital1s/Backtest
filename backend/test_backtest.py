# pylint: skip-file
"""
Test /backtest and /backtest/detailed POST endpoints for valid response and error handling.
"""

import os

from fastapi.testclient import TestClient

from backend.main import app

os.environ["TEST_MODE"] = "1"
client = TestClient(app)

valid_payload = {
    "ticker": "AAPL",
    "shares": 10,
    "grid_up": 1.0,
    "grid_down": 1.0,
    "grid_increment": 0.1,
    "timeframe": "1 D",
    "interval": "1 min",
}


def test_backtest_success():
    """Test successful POST request to /backtest with valid params."""
    resp = client.post("/backtest", json=valid_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["result"] == "success"
    assert "trades" in data
    assert "performance" in data
    assert "heldShares" in data
    assert isinstance(data["trades"], list)
    assert len(data["trades"]) > 0


def test_backtest_missing_ticker():
    """Test POST /backtest with missing required ticker param returns 422."""
    payload = valid_payload.copy()
    del payload["ticker"]
    resp = client.post("/backtest", json=payload)
    assert resp.status_code == 422


def test_backtest_invalid_method():
    """Test GET request to /backtest returns 405 Method Not Allowed."""
    resp = client.get("/backtest")
    assert resp.status_code == 405


def test_backtest_detailed_success():
    """Test successful POST request to /backtest/detailed with valid params."""
    resp = client.post("/backtest/detailed", json=valid_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["result"] == "success"
    assert "trades" in data
    assert "performance" in data
    assert "heldShares" in data
    assert "summary" in data
    assert isinstance(data["trades"], list)
    assert len(data["trades"]) > 0


def test_backtest_detailed_missing_ticker():
    """Test POST /backtest/detailed with missing required ticker param returns 422."""
    payload = valid_payload.copy()
    del payload["ticker"]
    resp = client.post("/backtest/detailed", json=payload)
    assert resp.status_code == 422


def test_backtest_detailed_invalid_method():
    """Test GET request to /backtest/detailed returns 405 Method Not Allowed."""
    resp = client.get("/backtest/detailed")
    assert resp.status_code == 405
