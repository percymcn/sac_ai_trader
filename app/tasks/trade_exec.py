from app.core.celery_app import celery_app
from app.tasks.ingest import fetch_ohlcv
from app.execution.router import OrderRouter
from app.risk.manager import RiskManager

@celery_app.task(name="exec.run_model")
def run_model(symbol:str, timeframe:str="1h"):
    # lazy import ML inference
    from app.ml.infer_torch import predict_proba_torch
    df=fetch_ohlcv(symbol, timeframe)
    p_buy=predict_proba_torch(df); side="buy" if p_buy>=0.5 else "sell"
    risk=RiskManager(); qty=risk.size(symbol, side, p_buy, None); risk.assert_limits(symbol, side, qty)
    out=OrderRouter().route(symbol=symbol, side=side, qty=qty, order_type="market", price=None, meta={"model_p":p_buy})
    return {"symbol":symbol,"p_buy":p_buy,"side":side,"qty":qty,"exec":out}
