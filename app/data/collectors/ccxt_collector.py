import ccxt, pandas as pd
EXCHANGE = ccxt.binance()
def get_ohlcv_ccxt(symbol: str, timeframe: str="1h", limit: int=1000) -> pd.DataFrame:
    raw = EXCHANGE.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
    df = pd.DataFrame(raw, columns=["ts","open","high","low","close","volume"])
    df["ts"] = pd.to_datetime(df["ts"], unit="ms", utc=True)
    return df.set_index("ts").sort_index()
