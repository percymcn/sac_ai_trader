import os, httpx, pandas as pd
AV_BASE="https://www.alphavantage.co/query"; AV_KEY=os.getenv("ALPHA_VANTAGE_KEY","")
def _get(p: dict)->dict:
    with httpx.Client(timeout=30) as c:
        r=c.get(AV_BASE, params=p); r.raise_for_status(); return r.json()
def get_fx_ohlc(symbol="EURUSD", interval="60min")->pd.DataFrame:
    data=_get({"function":"FX_INTRADAY","from_symbol":symbol[:3],"to_symbol":symbol[3:],"interval":interval,"apikey":AV_KEY,"outputsize":"full"})
    key=f"Time Series FX ({interval})"; ts=data.get(key,{})
    df=pd.DataFrame.from_dict(ts, orient="index").rename(columns=lambda s:s.split(". ")[-1].lower())
    df.index=pd.to_datetime(df.index, utc=True)
    df=df.rename(columns={"open":"open","high":"high","low":"low","close":"close"}); df["volume"]=0.0
    return df.sort_index()
def get_equity_ohlc(ticker="AAPL", interval="60min")->pd.DataFrame:
    data=_get({"function":"TIME_SERIES_INTRADAY","symbol":ticker,"interval":interval,"apikey":AV_KEY,"outputsize":"full"})
    key=f"Time Series ({interval})"; ts=data.get(key,{})
    df=pd.DataFrame.from_dict(ts, orient="index").rename(columns=lambda s:s.split(". ")[-1].lower())
    df.index=pd.to_datetime(df.index, utc=True)
    return df.sort_index()
