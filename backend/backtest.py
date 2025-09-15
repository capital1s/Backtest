"""
Backtest module for grid trading bot. Contains BacktestEngine class and IBKR API logic.
"""

# pylint: skip-file

import random
import threading
import time

from ibapi.client import EClient
from ibapi.contract import Contract
from ibapi.wrapper import EWrapper


class BacktestEngine:
    """
    Engine for running backtests on grid trading strategies.
    """

    def __init__(self, *args, **kwargs):
        """
        Initialize BacktestEngine with either legacy positional arguments or a config dict.
        Legacy: ticker, shares, grid_up, grid_down, grid_increment, timeframe, interval
        New: cfg dict with same keys
        """
        if len(args) == 7:
            self.ticker = args[0]
            self.shares = args[1]
            self.grid_up = args[2]
            self.grid_down = args[3]
            self.grid_increment = args[4]
            self.timeframe = args[5]
            self.interval = args[6]
        elif len(args) == 1 and isinstance(args[0], dict):
            cfg = args[0]
            self.ticker = cfg["ticker"]
            self.shares = cfg["shares"]
            self.grid_up = cfg["grid_up"]
            self.grid_down = cfg["grid_down"]
            self.grid_increment = cfg["grid_increment"]
            self.timeframe = cfg["timeframe"]
            self.interval = cfg["interval"]
        else:
            raise TypeError(
                "BacktestEngine requires either 7 positional args or a config dict"
            )

    def run(self) -> dict:
        """
        Simulate grid trading using historical data.
        Returns a dictionary with trade and performance metrics.
        """
        # Placeholder for actual historical data and simulation logic
        trades = []
        pnl = 0.0
        wins = 0
        losses = 0
        total_trades = len(trades)
        win_rate = wins / max(wins + losses, 1)
        return {
            "ticker": self.ticker,
            "shares": self.shares,
            "grid_up": self.grid_up,
            "grid_down": self.grid_down,
            "grid_increment": self.grid_increment,
            "timeframe": self.timeframe,
            "interval": self.interval,
            "trades": trades,
            "performance": {
                "total_trades": total_trades,
                "pnl": round(pnl, 2),
                "win_rate": round(win_rate, 2),
                "wins": wins,
                "losses": losses,
            },
            "result": "success",
        }

    @staticmethod
    def _frange(start, stop, step):
        """Range generator for floats."""
        while start <= stop:
            yield start
            start += step

    @staticmethod
    def request_historical_data_ibkr(cfg: dict):
        """Request historical data from IBKR API. Returns a list of bars.
        cfg should contain: app_instance, contract_instance, end_date_time, duration_str, bar_size_setting, what_to_show, use_rth, max_retries.
        """
        app_instance = cfg["app_instance"]
        contract_instance = cfg["contract_instance"]
        end_date_time = cfg.get("end_date_time", "")
        duration_str = cfg.get("duration_str", "1 D")
        bar_size_setting = cfg.get("bar_size_setting", "1 min")
        what_to_show = cfg.get("what_to_show", "TRADES")
        use_rth = cfg.get("use_rth", 1)
        max_retries = cfg.get("max_retries", 3)
        req_id = 1
        for attempt in range(max_retries):
            try:
                app_instance.historical_data = []
                if hasattr(app_instance, "reset_historical_done"):
                    app_instance.reset_historical_done()
                else:
                    app_instance.historical_done = False
                app_instance.reqHistoricalData(
                    req_id,
                    contract_instance,
                    end_date_time,
                    duration_str,
                    bar_size_setting,
                    what_to_show,
                    use_rth,
                    1,
                    False,
                    [],
                )
                timeout = 10
                start = time.time()
                while (
                    not getattr(app_instance, "historical_done", False)
                    and time.time() - start < timeout
                ):
                    app_instance.run()
                if app_instance.historical_data:
                    result = app_instance.historical_data
                    app_instance.historical_data = []
                    return result
                print(
                    f"No historical data received, retrying ({attempt + 1}/{max_retries})..."
                )
            except (ValueError, RuntimeError) as e:
                print(f"Error requesting historical data (attempt {attempt + 1}): {e}")
                time.sleep(2)
        print("Failed to retrieve historical data after retries.")
        return []

    @staticmethod
    def request_realtime_data_ibkr(app_instance, contract_instance, max_retries=3):
        """Request real-time market data from IBKR API. Returns a list of tick data."""
        req_id = 2
        for attempt in range(max_retries):
            try:
                app_instance.realtime_data = []
                if hasattr(app_instance, "reset_realtime_done"):
                    app_instance.reset_realtime_done()
                else:
                    app_instance.realtime_done = False
                app_instance.reqMktData(req_id, contract_instance, "", False, False, [])
                timeout = 10
                start = time.time()
                while (
                    len(app_instance.realtime_data) < 5
                    and time.time() - start < timeout
                ):
                    app_instance.run()
                app_instance.cancelMktData(req_id)
                if app_instance.realtime_data:
                    result = app_instance.realtime_data
                    app_instance.realtime_data = []
                    return result
                print(
                    f"No real-time data received, retrying ({attempt + 1}/{max_retries})..."
                )
            except (ValueError, RuntimeError) as e:
                print(f"Error requesting real-time data (attempt {attempt + 1}): {e}")
                time.sleep(2)
        print("Failed to retrieve real-time data after retries.")
        return []


class IBApp(EClient, EWrapper):
    """
    IBKR API client and wrapper for historical and real-time data.
    """

    _active_connection = False
    _used_client_ids = set()
    _client_id_lock = threading.Lock()

    def __init__(self):
        super().__init__(self)
        self.historical_data = []
        self.realtime_data = []
        self.historical_done = False
        self.realtime_done = False

    def wait_for_disconnect(self, timeout: float = 2.0):
        """Wait for IBKR socket disconnect with timeout."""
        start = time.time()
        while self.isConnected() and time.time() - start < timeout:
            time.sleep(0.1)

    def historicalData(self, reqId, bar):
        """Callback for historical data bar from IBKR API."""
        self.historical_data.append(
            {
                "date": bar.date,
                "open": bar.open,
                "high": bar.high,
                "low": bar.low,
                "close": bar.close,
                "volume": bar.volume,
            }
        )

    def historicalDataEnd(self, reqId, start, end):
        """Callback for end of historical data from IBKR API."""
        self.historical_done = True

    def tickPrice(self, reqId, tickType, price, attrib):
        """Callback for tick price from IBKR API."""
        self.realtime_data.append({"tickType": tickType, "price": price})

    def tickSize(self, reqId, tickType, size):
        """Callback for tick size from IBKR API."""
        self.realtime_data.append({"tickType": tickType, "size": size})

    def tickString(self, reqId, tickType, value):
        """Callback for tick string from IBKR API."""
        self.realtime_data.append({"tickType": tickType, "value": value})

    def tickGeneric(self, reqId, tickType, value):
        """Callback for generic tick from IBKR API."""
        self.realtime_data.append({"tickType": tickType, "value": value})

    @classmethod
    def get_next_client_id(cls):
        """Get next available IBKR client ID (1-31)."""
        with cls._client_id_lock:
            for _ in range(31):
                cid = random.randint(1, 31)
                if cid not in cls._used_client_ids:
                    cls._used_client_ids.add(cid)
                    return cid
            for cid in range(1, 32):
                if cid not in cls._used_client_ids:
                    cls._used_client_ids.add(cid)
                    return cid
            raise RuntimeError("No available client IDs (1-31)")

    @classmethod
    def release_client_id(cls, cid):
        """Release a previously used IBKR client ID."""
        with cls._client_id_lock:
            cls._used_client_ids.discard(cid)

    def auto_connect(self, mode="gateway", account_type="paper", max_retries=3):
        """Auto-connect to IBKR API using default ports and client ID."""
        IBApp._active_connection = False
        if IBApp._active_connection:
            print(
                "A socket connection is already active. Only one connection allowed at a time."
            )
            return None, None
        port_map = {
            "gateway": {"live": 4001, "paper": 4002},
            "tws": {"live": 7496, "paper": 7497},
        }
        ports_to_try = [port_map[mode][account_type], 4001, 4002, 7496, 7497]
        client_id_local = self.get_next_client_id()
        for port_local in ports_to_try:
            for attempt in range(max_retries):
                try:
                    print(
                        f"Connecting to IBKR {mode.upper()} ({account_type}) on port {port_local} "
                        f"with client_id {client_id_local} (attempt {attempt + 1}/{max_retries})"
                    )
                    self.connect("127.0.0.1", port_local, client_id_local)
                    if self.isConnected():
                        IBApp._active_connection = True
                        print(f"Connected to IBKR on port {port_local}")
                        return port_local, client_id_local
                    print("Connection failed, retrying...")
                except (ValueError, RuntimeError) as e:
                    print(f"Error connecting to IBKR: {e}")
                    time.sleep(2)
        print("Failed to connect to IBKR after trying all default ports and retries.")
        return None, client_id_local

    def disconnect(self):
        """Disconnect from IBKR API and release client ID."""
        super().disconnect()
        IBApp._active_connection = False
        if hasattr(self, "clientId"):
            IBApp.release_client_id(self.clientId)


if __name__ == "__main__":
    # Example usage and test
    app = IBApp()
    port, client_id = app.auto_connect()
    if port:
        contract = Contract()
        contract.symbol = "AAPL"
        contract.secType = "STK"
        contract.exchange = "SMART"
        contract.currency = "USD"
        config = {
            "app_instance": app,
            "contract_instance": contract,
        }
        bars = BacktestEngine.request_historical_data_ibkr(config)
        print("IBKR historical bars:", bars)
        app.disconnect()
