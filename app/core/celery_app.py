from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "sac_ai_trader",
    broker=str(settings.CELERY_BROKER_URL),
    backend=str(settings.CELERY_RESULT_BACKEND),
)
celery_app.conf.timezone = "UTC"
celery_app.conf.beat_schedule = {
    "ingest-hourly-eurusd": {"task":"ingest.ohlcv","schedule":3600,"args":("EURUSD","1h")},
    "ingest-hourly-btc": {"task":"ingest.ohlcv","schedule":3600,"args":("BTC/USDT","1h")},
    "ingest-hourly-aapl": {"task":"ingest.ohlcv","schedule":3600,"args":("AAPL","1h")},
    "retrain-daily-eurusd": {"task":"ml.retrain","schedule":24*3600,"args":("EURUSD","1h")},
    "exec-5min-eurusd": {"task":"exec.run_model","schedule":300,"args":("EURUSD","1h")},
    "snapshot-5min": {"task":"monitor.snapshot_pnl","schedule":300},
}
