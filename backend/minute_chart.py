# pylint: skip-file
"""
Utility for processing historical minute chart data and resampling to selectable frequencies.
"""

import pandas as pd

from .ibkr_client import IBKRClient


def get_minute_chart(ticker, duration="1 D", bar_size="1 min", frequency="1min"):
    """
    Fetch historical minute chart data for a ticker and resample to the selected frequency.
    Returns OHLCV data as a list of dicts with timestamp index.
    """
    client = IBKRClient()
    client.connect()
    bars = client.get_historical_data(ticker, duration, bar_size)
    client.disconnect()
    # Convert to DataFrame
    df = pd.DataFrame([b.__dict__ for b in bars])
    # Drop unused columns if present
    allowed_cols = ["date", "open", "high", "low", "close", "volume"]
    unused_cols = [col for col in df.columns if col not in allowed_cols]
    if unused_cols:
        df.drop(columns=unused_cols, inplace=True)
    # Set efficient dtypes
    df["open"] = df["open"].astype("float32")
    df["high"] = df["high"].astype("float32")
    df["low"] = df["low"].astype("float32")
    df["close"] = df["close"].astype("float32")
    df["volume"] = df["volume"].astype("int32")
    df["date"] = pd.to_datetime(df["date"])
    df.set_index("date", inplace=True)
    # Resample to desired frequency
    ohlc = (
        df.resample(frequency)
        .agg(
            {
                "open": "first",
                "high": "max",
                "low": "min",
                "close": "last",
                "volume": "sum",
            }
        )
        .dropna()
    )
    return ohlc.reset_index().to_dict(orient="records")
