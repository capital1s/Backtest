# pylint: skip-file
"""
Grid trading bot logic for U.S. stocks under $1
"""

from decimal import ROUND_DOWN, Decimal


class GridBot:
    """
    Implements dynamic grid trading logic for U.S. stocks under $1.
    """

    positions: dict
    trades: list

    def __init__(
        self, ticker: str, shares: int, grid_config: dict, decimal_places: int = 2
    ):
        """
        Initialize the grid trading bot with ticker, shares, grid config dict,
        and decimal precision.
        grid_config should contain keys: grid_up, grid_down, grid_increment.
        """
        self.ticker = ticker
        self.shares = shares
        self.decimal_places = decimal_places
        self.grid_up = self.round_to(grid_config["grid_up"])
        self.grid_down = self.round_to(grid_config["grid_down"])
        self.grid_increment = self.round_to(grid_config["grid_increment"])
        self.positions = {}
        self.trades = []

    def round_to(self, value: float) -> float:
        """Round a value to the specified number of decimal places."""
        format_str = "0." + "0" * self.decimal_places
        return float(Decimal(value).quantize(Decimal(format_str), rounding=ROUND_DOWN))

    def place_order(self, price: float, side: str):
        """
        Execute a limit buy or sell order at the given price and side.
        Avoids duplicate grid positions and enforces max shares per grid.
        Places the opposite order automatically.
        """
        grid_price = self.round_to(price)
        # Check if grid is occupied and max shares not exceeded
        if grid_price in self.positions:
            # If already at max shares, do not place order
            existing = self.positions.get(grid_price)
            if isinstance(existing, dict):
                total_shares = existing.get("shares", 0)
            else:
                total_shares = self.shares  # fallback for legacy
            if total_shares >= self.shares:
                return None  # Max shares reached at this grid
        # Record position with shares
        self.positions[grid_price] = {"side": side, "shares": int(self.shares)}
        trade_obj = {
            "ticker": self.ticker,
            "shares": int(self.shares),
            "price": grid_price,
            "side": side,
        }
        self.trades.append(trade_obj)
        # Place opposite order automatically
        if side == "buy":
            self.place_order(grid_price + self.grid_increment, "sell")
        elif side == "sell":
            self.place_order(grid_price - self.grid_increment, "buy")
        return trade_obj

    def get_trades(self):
        """
        Return the list of executed trades.
        """
        return self.trades

    def get_positions(self):
        """
        Return the current grid positions.
        """
        return self.positions
