from pydantic import BaseSettings, AnyUrl

class Settings(BaseSettings):
    ENV: str = "dev"
    API_TITLE: str = "SAC AI Trader"
    API_SECRET: str = "change_me"
    API_KEY_HEADER: str = "X-API-Key"
    ADMIN_API_KEY: str = "admin_key"

    SQLALCHEMY_DATABASE_URI: str

    REDIS_URL: AnyUrl = "redis://redis:6379/0"
    CELERY_BROKER_URL: AnyUrl = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: AnyUrl = "redis://redis:6379/1"

    PUBLIC_HOST: str = "http://localhost:8000"
    ALPHA_VANTAGE_KEY: str = ""
    POLYGON_API_KEY: str = ""

    TL_API_KEY: str = ""
    TL_ACCOUNT_ID: str = "live_1"
    TL_HUB_WEBHOOK_SECRET: str = "change_me_webhook_secret"
    MT5_BRIDGE_URL: str = ""

    MAX_GLOBAL_DRAWDOWN_PCT: float = 20.0
    VOL_TARGET_ANNUAL: float = 0.20
    KELLY_FRACTION: float = 0.25
    INITIAL_BALANCE: float = 100000.0

    class Config:
        env_file = ".env"

settings = Settings()
