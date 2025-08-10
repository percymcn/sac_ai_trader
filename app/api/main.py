from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import health, orders, positions, models, risk, signals, backtest, metrics
from app.core.config import settings

app = FastAPI(title=settings.API_TITLE if hasattr(settings,'API_TITLE') else "SAC AI Trader")

# CORS (origins configured via .env CORS_ALLOW_ORIGINS)
origins = [o.strip() for o in (getattr(settings, 'CORS_ALLOW_ORIGINS', '') or '').split(',') if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Global API key middleware (accepts api_key, X-API-Key, Authorization: Bearer)
try:
    from app.core.auth import APIKeyMiddleware
    app.add_middleware(APIKeyMiddleware)
except Exception:
    pass

# Routers
app.include_router(health.router)
app.include_router(orders.router)
app.include_router(positions.router)
app.include_router(models.router)
app.include_router(risk.router)
app.include_router(signals.router)
app.include_router(backtest.router)
app.include_router(metrics.router)
