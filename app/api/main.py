import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.init import init_db
from app.api.routers import health, tasks, orders, brokers, pnl, positions, models, risk

def _parse_origins(val: str | None):
    if not val: return ["*"]
    # split by comma, trim whitespace
    return [o.strip() for o in val.split(",") if o.strip()]

app = FastAPI(title=os.getenv("API_TITLE", "SAC AI Trader"))
allow_origins = _parse_origins(os.getenv("CORS_ALLOW_ORIGINS"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def _startup(): init_db()

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(brokers.router, tags=["brokers"])
app.include_router(pnl.router, prefix="/pnl", tags=["pnl"])
app.include_router(positions.router, prefix="/positions", tags=["positions"])
app.include_router(models.router, prefix="/models", tags=["models"])
app.include_router(risk.router, prefix="/risk", tags=["risk"])
