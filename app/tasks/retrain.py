from app.core.celery_app import celery_app
from app.tasks.ingest import fetch_ohlcv

@celery_app.task(name="ml.retrain")
def retrain(symbol:str, timeframe:str="1h"):
    from app.ml.train_torch import train_optuna  # lazy
    df=fetch_ohlcv(symbol, timeframe)
    return train_optuna(df, n_trials=12, win=64)
