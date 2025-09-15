# pylint: skip-file
"""
Test /ibkr/historical GET endpoint for valid response and error handling.
"""

import os

from fastapi.testclient import TestClient

from backend.main import app

os.environ["TEST_MODE"] = "1"
client = TestClient(app)


def test_historical_success():
    """Test successful GET request to /ibkr/historical with valid params."""
    resp = client.get(
        "/api/historical",
        params={"symbol": "AAPL", "duration": "1 D", "bar_size": "1 min"},
    )
    assert resp.status_code == 200
    assert "bars" in resp.json()
    assert resp.json()["result"] == "success"


def test_historical_missing_symbol():
    """Test GET /ibkr/historical with missing required symbol param returns 422."""
    resp = client.get("/api/historical", params={"duration": "1 D"})
    assert resp.status_code == 422


def test_historical_invalid_method():
    """Test POST request to /ibkr/historical returns 405 Method Not Allowed."""
    resp = client.post("/api/historical")
    assert resp.status_code == 405
