from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # accept extra env vars so old SAC keys don't crash startup
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENV: str = "dev"
    API_TITLE: str = "SAC AI Trader"
    API_SECRET: str = "change_me"
    API_KEY_HEADER: str = "X-API-Key"
    ADMIN_API_KEY: str = "admin_key"

    SQLALCHEMY_DATABASE_URI: str
    REDIS_URL: AnyUrl = "redis://redis:6379/0"
    PUBLIC_HOST: str = "http://localhost:8010"

settings = Settings()
