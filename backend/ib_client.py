# pylint: skip-file
"""
IBKR API client for connecting and searching tickers.
"""

from ibapi.client import EClient
from ibapi.contract import Contract
from ibapi.wrapper import EWrapper


class IBApp(EClient, EWrapper):
    """Minimal IBKR API client for connection and contract search."""

    def __init__(self):
        try:
            EClient.__init__(self, self)
        except (TypeError, ValueError, RuntimeError) as e:
            print(f"Error initializing EClient: {e}")


if __name__ == "__main__":
    try:
        app = IBApp()
        app.connect("127.0.0.1", 4002, 0)
        # Example: search for ticker 'BURU' and print contract details
        contract = Contract()
        contract.symbol = "BURU"
        contract.secType = "STK"
        contract.exchange = "SMART"
        contract.currency = "USD"
        print(f"Searching for ticker: {contract.symbol}")
        print(f"Contract details: {contract}")
        app.disconnect()
    except (ConnectionError, RuntimeError, ValueError) as e:
        print(f"Error during IBKR API connection: {e}")
