# pylint: skip-file
"""
IBKR API integration using ib_insync
"""

from ib_insync import IB, ScannerSubscription, Stock


class IBKRClient:
    """Client for Interactive Brokers API using ib_insync."""

    def __init__(self):
        """Initialize IBKRClient and set up connection state."""
        self.ib = IB()
        self.connected = False

    def get_us_stock_tickers(self, scan_code="TOP_PERC_GAIN", limit=50):
        """Fetch a list of US stock tickers using IBKR's market scanner."""
        if not self.connected:
            self.connect()
        subscription = ScannerSubscription(
            limit,  # numberOfRows
            scan_code,  # scanCode
            "STK",  # instrument
            "STK.US.MAJOR",  # locationCode
        )
        scan_results = self.ib.reqScannerData(subscription)
        tickers = [row.contract.symbol for row in scan_results]
        return tickers

    def connect(self, host="127.0.0.1", port=4002, client_id=1):
        """Connect to the Interactive Brokers API using the specified host, port, and client ID."""
        self.connected = False
        try:
            self.ib.connect(host, port, client_id)  # ib.connect returns None
            print(f"Connected to IBKR on {host}:{port}")
            self.connected = True
            # No return value needed, ib.connect returns None
        except (OSError, ConnectionError) as e:
            print(f"Failed to connect on {host}:{port}: {e}")
            alt_port = 7496 if port == 7497 else 7497
            try:
                self.ib.connect(host, alt_port, client_id)
                print(f"Connected to IBKR on {host}:{alt_port}")
                self.connected = True
            except (OSError, ConnectionError) as e2:
                print(f"Failed to connect on {host}:{alt_port}: {e2}")
                print(
                    "Make sure TWS or IB Gateway is running, "
                    "API access is enabled, "
                    "and the port is correct."
                )
                self.connected = False

    def is_connected(self):
        """Return True if currently connected to IBKR, False otherwise."""
        return self.connected

    def get_historical_data(self, ticker, duration, bar_size):
        """
        Retrieve historical market data for the given ticker using the specified
        duration and bar size.
        """
        if not self.connected:
            print("Not connected to IBKR. " "Call connect() first.")
            return None
        stock = Stock(ticker, "SMART", "USD")
        bars = self.ib.reqHistoricalData(
            stock,
            endDateTime="",
            durationStr=duration,
            barSizeSetting=bar_size,
            whatToShow="TRADES",
            useRTH=True,
            formatDate=1,
        )
        return bars

    def disconnect(self):
        """Disconnect from the Interactive Brokers API."""
        if self.connected:
            self.ib.disconnect()
            self.connected = False
            print("Disconnected from IBKR.")
        else:
            print("Already disconnected.")
