# pylint: skip-file
"""
Test /api/realtime, /api/login, and /us_stock_tickers endpoints for valid response
and error handling.
"""

import os

from fastapi.testclient import TestClient

from backend.main import app

os.environ["TEST_MODE"] = "1"
client = TestClient(app)


def test_realtime_success():
    """Test GET /api/realtime returns valid tick data."""
    resp = client.get(
        "/api/realtime", params={"symbol": "AAPL", "max_ticks": 5})
    assert resp.status_code == 200
    data = resp.json()
    assert data["result"] == "success"
    assert data["symbol"] == "AAPL"
    assert "ticks" in data
    assert isinstance(data["ticks"], list)
    assert len(data["ticks"]) == 5


def test_realtime_invalid_method():
    """Test POST to /api/realtime returns 405 Method Not Allowed."""
    resp = client.post("/api/realtime")
    assert resp.status_code == 405


def test_login_success():
    """Test POST /api/login with valid credentials returns success and token."""
    resp = client.post(
        "/api/login", json={"username": "user", "password": "pass"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["result"] == "success"
    assert "token" in data


def test_login_invalid_credentials():
    """Test POST /api/login with invalid credentials returns error."""
    resp = client.post(
        "/api/login", json={"username": "bad", "password": "wrong"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["result"] == "error"
    assert "message" in data


def test_login_invalid_method():
    """Test GET to /api/login returns 405 Method Not Allowed."""
    resp = client.get("/api/login")
    assert resp.status_code == 405


def test_us_stock_tickers_success():
    """Test GET /us_stock_tickers returns valid ticker list."""
    resp = client.get("/us_stock_tickers")
    assert resp.status_code == 200
    data = resp.json()
    assert data["result"] == "success"
    assert "tickers" in data
    assert isinstance(data["tickers"], list)
    assert "AAPL" in data["tickers"]


def test_us_stock_tickers_invalid_method():
    """Test POST to /us_stock_tickers returns 405 Method Not Allowed."""
    resp = client.post("/us_stock_tickers")
    assert resp.status_code == 405


def test_health_endpoint():
    """Test /health endpoint returns healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint():
    """Test root endpoint returns ok status."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_misc_long_line():
    """Test endpoint with long line split for lint compliance."""
    response = client.get(
        "/api/endpoint?param1=foo&param2=bar&param3=baz&param4=qux&param5=quux"
    )
    assert response.status_code == 200
