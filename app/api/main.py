from fastapi import FastAPI
from app.api.routers.health import router as health_router

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="SAC AI Trader")

# CORS for Base44 + local dev
from app.core.config import settings
origins = [o.strip() for o in (getattr(settings, 'CORS_ALLOW_ORIGINS', '') or '').split(',') if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*']
    )

app.include_router(health_router)

# Global API key middleware (accepts api_key, X-API-Key, Authorization: Bearer)
from app.core.auth import APIKeyMiddleware
app.add_middleware(APIKeyMiddleware)
