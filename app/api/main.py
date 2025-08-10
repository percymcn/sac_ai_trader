from fastapi import FastAPI
from app.api.routers.health import router as health_router

app = FastAPI(title="SAC AI Trader")
app.include_router(health_router)
