# pylint: skip-file
"""
Pytest test for IBKRClient connection and disconnection.
"""

# ...existing code...

from backend.ibkr_client import IBKRClient


def test_ibkr_connect_disconnect(monkeypatch):
    """Test IBKRClient connect and disconnect logic with monkeypatch."""
    client = IBKRClient()
    # Mock connect to always set connected True
    monkeypatch.setattr(client, "connect", lambda: setattr(client, "connected", True))
    monkeypatch.setattr(
        client, "disconnect", lambda: setattr(client, "connected", False)
    )
    client.connect()
    assert client.is_connected() is True
    client.disconnect()
    assert client.is_connected() is False
