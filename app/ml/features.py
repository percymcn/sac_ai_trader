import pandas as pd
def rsi(series: pd.Series, period=14):
    delta=series.diff(); up=delta.clip(lower=0).ewm(alpha=1/period, adjust=False).mean()
    down=(-delta.clip(upper=0)).ewm(alpha=1/period, adjust=False).mean(); rs=up/(down+1e-9)
    return 100 - (100/(1+rs))
def make_features(df: pd.DataFrame) -> pd.DataFrame:
    out=pd.DataFrame(index=df.index)
    ret=df["close"].pct_change().fillna(0)
    out["ret_1"]=ret; out["vol_20"]=ret.rolling(20).std().bfill()
    out["ma_20"]=df["close"].rolling(20).mean()
    out["ma_50"]=df["close"].rolling(50).mean()
    out["bb_width"]=(df["close"].rolling(20).std()*2)/df["close"]
    out["rsi_14"]=rsi(df["close"],14)
    return out.fillna(0)
