"""
Module to check IBKR API connection status.
"""

from .ibkr_client import IBKRClient

if __name__ == "__main__":
    client = IBKRClient()
    client.connect()
    print("Connected to IBKR:", client.is_connected())
    client.disconnect()
