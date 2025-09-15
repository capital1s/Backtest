# pylint: skip-file
"""
Unit tests for BacktestEngine in backend/backtest.py.
"""

from backend.backtest import BacktestEngine


def test_grid_bot_basic():
    """Test basic grid bot run returns success and valid performance metrics."""
    engine = BacktestEngine("AAPL", 10, 200, 180, 5, "1mo", "1d")
    result = engine.run()
    assert result["result"] == "success"
    assert "performance" in result
    assert result["performance"]["total_trades"] >= 0


def test_grid_bot_edge_case():
    """Test grid bot edge case with single grid level returns success."""
    engine = BacktestEngine("AAPL", 1, 150, 150, 1, "1mo", "1d")
    result = engine.run()
    assert result["result"] == "success"
    assert result["performance"]["total_trades"] >= 0
