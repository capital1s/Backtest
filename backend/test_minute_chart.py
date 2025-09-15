# pylint: skip-file
"""
Test /minute_chart POST endpoint for valid response and error handling.
"""

import os

from fastapi.testclient import TestClient

from backend.main import app

os.environ["TEST_MODE"] = "1"
client = TestClient(app)


def test_minute_chart_success():
    """Test successful POST request to /minute_chart with valid params."""
    resp = client.post(
        "/minute_chart",
        json={
            "ticker": "AAPL",
            "duration": "1 D",
            "bar_size": "1 min",
            "frequency": "1min",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["result"] == "success"
    assert "chart" in data
    assert isinstance(data["chart"], list)
    assert len(data["chart"]) > 0


def test_minute_chart_missing_ticker():
    """Test POST /minute_chart with missing required ticker param returns 422."""
    resp = client.post(
        "/minute_chart",
        json={"duration": "1 D", "bar_size": "1 min", "frequency": "1min"},
    )
    assert resp.status_code == 422


def test_minute_chart_invalid_method():
    """Test GET request to /minute_chart returns 405 Method Not Allowed."""
    resp = client.get("/minute_chart")
    assert resp.status_code == 405
