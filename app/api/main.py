from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.init import init_db
from app.api.routers import health as r_health

app = FastAPI(title=settings.API_TITLE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("startup")
def _startup():
    init_db()

app.include_router(r_health.router, prefix="/health", tags=["health"])
