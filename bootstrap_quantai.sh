# --- create, commit, push, deploy quantai ---
set -euo pipefail

# ====== adjust these two if you like ======
GH_USER="${GH_USER:-percymcn}"
REPO_NAME="${REPO_NAME:-quantai}"
# ==========================================

ROOT=~/code/${REPO_NAME}
mkdir -p "$ROOT"/{app/{api/{routes},core,db,schemas,services/{data,ml,exec,risk,portfolio,notify,events,control},workers},scripts,models,data,storage,tests}
cd "$ROOT"

# ---------------- files ----------------
cat > requirements.txt <<'EOF'
fastapi==0.114.2
uvicorn[standard]==0.30.6
pydantic==2.9.0
SQLAlchemy==2.0.36
redis==5.0.8
celery==5.4.0
httpx==0.27.2
pandas==2.2.2
numpy==1.26.4
scikit-learn==1.5.2
optuna==3.6.1
ta==0.11.0
loguru==0.7.2
python-dotenv==1.0.1
PyJWT==2.9.0
EOF

cat > .env <<'EOF'
ENV=prod
API_KEY=change-me
SECRET_KEY=super-secret
DB_URL=sqlite:///./storage/quantai.db
REDIS_URL=redis://redis:6379/0
BROKER_DEFAULT=paper
DATA_PROVIDER=ccxt
EXCHANGE=binance
DEFAULT_TIMEFRAME=1m
ADMIN_KEYS=key_admin_1
TRADER_KEYS=key_trader_1
VIEWER_KEYS=key_viewer_1
JWT_SECRET=change-me
JWT_EXPIRE_HOURS=12
OPTUNA_DB=sqlite:///./storage/optuna.db
ALERT_EMAIL_FROM=
ALERT_EMAIL_TO=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
AUDIT_RETENTION_DAYS=90
REPORT_HOUR_ET=9
EOF

cat > docker-compose.yml <<'EOF'
version: "3.9"
services:
  redis:
    image: redis:7-alpine
    container_name: quantai_redis
    ports: ["6379:6379"]
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: quantai_api
    env_file: .env
    volumes:
      - ./data:/app/data
      - ./models:/app/models
      - ./storage:/app/storage
    ports: ["8000:8000"]
    depends_on: [redis]
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    container_name: quantai_worker
    env_file: .env
    volumes:
      - ./data:/app/data
      - ./models:/app/models
      - ./storage:/app/storage
    depends_on: [redis, api]
    restart: unless-stopped

  beat:
    build:
      context: .
      dockerfile: Dockerfile.worker
    container_name: quantai_beat
    command: celery -A app.workers.celery_app.celery_app beat -l INFO
    env_file: .env
    volumes:
      - ./data:/app/data
      - ./models:/app/models
      - ./storage:/app/storage
    depends_on: [redis, api]
    restart: unless-stopped
EOF

cat > Dockerfile.api <<'EOF'
FROM --platform=linux/arm64 python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn","app.api.main:app","--host","0.0.0.0","--port","8000","--reload"]
EOF

cat > Dockerfile.worker <<'EOF'
FROM --platform=linux/arm64 python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONUNBUFFERED=1
CMD ["celery","-A","app.workers.celery_app.celery_app","worker","-l","INFO","--concurrency","2"]
EOF

# ---- minimal app (healthy skeleton; you can expand later) ----
cat > app/api/main.py <<'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health, signals, trades, risk, admin, dashboard

app = FastAPI(title="QuantAI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(signals.router, prefix="/signals", tags=["signals"])
app.include_router(trades.router,  prefix="/trades",  tags=["trades"])
app.include_router(risk.router,    prefix="/risk",    tags=["risk"])
app.include_router(admin.router,   prefix="/admin",   tags=["admin"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

@app.get("/")
def root(): return {"ok": True, "app": "QuantAI"}
EOF

cat > app/api/routes/health.py <<'EOF'
from fastapi import APIRouter
router = APIRouter()
@router.get("") 
def health(): return {"status":"ok"}
EOF

cat > app/api/routes/signals.py <<'EOF'
from fastapi import APIRouter, Query
from pydantic import BaseModel
from app.services.ml.pipeline import SignalEngine

router = APIRouter()
engine = SignalEngine()

class SignalOut(BaseModel):
    symbol: str; side: str; prob: float; price: float; timeframe: str

@router.get("/latest", response_model=list[SignalOut])
def latest(symbols: str = Query(default="BTCUSDT,ETHUSDT")):
    syms = [s for s in symbols.split(",") if s]
    sigs = engine.latest_signals(syms)
    return [SignalOut(**s) for s in sigs]
EOF

cat > app/api/routes/trades.py <<'EOF'
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.exec.router import ExecRouter
from app.services.risk.engine import RiskEngine

router = APIRouter()
exec_router = ExecRouter()
risk = RiskEngine()

class OrderIn(BaseModel):
    symbol: str; side: str; qty: float
    order_type: str = "market"; sl: float|None=None; tp: float|None=None
    meta: dict|None=None

@router.post("/place")
def place(o: OrderIn):
    chk = risk.check_order(o.symbol, o.side, o.qty)
    if not chk.approved: return {"ok": False, "reason": chk.reason}
    res = exec_router.place_order(o.model_dump())
    return {"ok": True, "broker_ref": res}
EOF

cat > app/api/routes/risk.py <<'EOF'
from fastapi import APIRouter
from app.services.risk.engine import RiskEngine
router = APIRouter(); risk = RiskEngine()
@router.get("/limits") 
def limits(): return risk.snapshot()
EOF

cat > app/api/routes/admin.py <<'EOF'
from fastapi import APIRouter
from app.workers.tasks import retrain_models, run_signal_gen
router = APIRouter()
@router.post("/retrain")
def retrain(): retrain_models.delay(); return {"ok": True}
@router.post("/signals")
def signals(): run_signal_gen.delay(); return {"ok": True}
EOF

cat > app/api/routes/dashboard.py <<'EOF'
from fastapi import APIRouter
from app.services.portfolio.state import portfolio_state
router = APIRouter()
@router.get("/state")
def state(): return portfolio_state()
EOF

# ---- core config/logging ----
cat > app/core/config.py <<'EOF'
import os
class Settings:
    ENV=os.getenv("ENV","dev")
    API_KEY=os.getenv("API_KEY","dev")
    DB_URL=os.getenv("DB_URL","sqlite:///./storage/quantai.db")
    REDIS_URL=os.getenv("REDIS_URL","redis://redis:6379/0")
    BROKER_DEFAULT=os.getenv("BROKER_DEFAULT","paper")
    DATA_PROVIDER=os.getenv("DATA_PROVIDER","ccxt")
    EXCHANGE=os.getenv("EXCHANGE","binance")
    DEFAULT_TIMEFRAME=os.getenv("DEFAULT_TIMEFRAME","1m")
    OPTUNA_DB=os.getenv("OPTUNA_DB","sqlite:///./storage/optuna.db")
settings=Settings()
EOF

# ---- db (sqlite stub so app boots) ----
cat > app/db/base.py <<'EOF'
from sqlalchemy.orm import DeclarativeBase
class Base(DeclarativeBase): pass
EOF

cat > app/db/session.py <<'EOF'
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
engine = create_engine(settings.DB_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
EOF

cat > app/db/models.py <<'EOF'
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from app.db.base import Base
class TradeLog(Base):
    __tablename__="trade_logs"
    id=Column(Integer, primary_key=True)
    symbol=Column(String, index=True); side=Column(String)
    qty=Column(Float); price=Column(Float); broker_ref=Column(String)
    ts=Column(DateTime, default=datetime.utcnow); meta=Column(JSON)
class SignalLog(Base):
    __tablename__="signal_logs"
    id=Column(Integer, primary_key=True)
    symbol=Column(String, index=True); side=Column(String)
    prob=Column(Float); price=Column(Float); timeframe=Column(String)
    ts=Column(DateTime, default=datetime.utcnow)
EOF

# ---- services: data + ML (compact baseline) ----
cat > app/services/data/ohlcv_dummy.py <<'EOF'
import pandas as pd, numpy as np
from datetime import datetime
def fetch(symbol: str, timeframe: str="1m", limit: int=300):
    idx=pd.date_range(end=datetime.utcnow(), periods=limit, freq="1min")
    price=100+np.cumsum(np.random.randn(limit))*0.1
    df=pd.DataFrame({"open":price,"high":price+0.1,"low":price-0.1,"close":price,"volume":1.0}, index=idx)
    df.index.name="ts"; return df.reset_index()
EOF

cat > app/services/data/registry.py <<'EOF'
from .ohlcv_dummy import fetch as dummy_fetch
def get_provider(name: str):
    return type("Prov",(object,),{"fetch": staticmethod(dummy_fetch)})()
EOF

cat > app/services/ml/features.py <<'EOF'
import pandas as pd
def make_features(df: pd.DataFrame)->pd.DataFrame:
    df=df.copy()
    df["ret1"]=df["close"].pct_change()
    df["ema_fast"]=df["close"].ewm(span=12, adjust=False).mean()
    df["ema_slow"]=df["close"].ewm(span=26, adjust=False).mean()
    df["rsi"]=100-100/(1+df["ret1"].clip(lower=-0.1,upper=0.1).rolling(14).mean().abs())
    df["cross"]=(df["ema_fast"]>df["ema_slow"]).astype(int)
    return df.dropna()
EOF

cat > app/services/ml/pipeline.py <<'EOF'
import os, joblib, numpy as np
from app.core.config import settings
from app.services.data.registry import get_provider
from app.services.ml.features import make_features
from sklearn.linear_model import LogisticRegression
MODEL_PATH="models/baseline.joblib"
class SignalEngine:
    def __init__(self, provider_name: str|None=None):
        self.provider=get_provider(provider_name or settings.DATA_PROVIDER)
        os.makedirs("models", exist_ok=True)
    def retrain(self, symbol: str="BTCUSDT", timeframe: str="1m", limit: int=2000):
        df=self.provider.fetch(symbol,timeframe,limit)
        fx=make_features(df); fx["y"]=(fx["close"].shift(-1)>fx["close"]).astype(int); fx=fx.dropna()
        X=fx[["ret1","ema_fast","ema_slow","rsi","cross"]]; y=fx["y"]
        m=LogisticRegression(max_iter=1000).fit(X,y); joblib.dump({"model":m,"feats":X.columns.tolist()}, MODEL_PATH)
        return True
    def latest_signals(self, symbols: list[str]|None=None, timeframe: str|None=None):
        if not os.path.exists(MODEL_PATH): self.retrain()
        bundle=joblib.load(MODEL_PATH); m=bundle["model"]; feats=bundle["feats"]
        out=[]; symbols=symbols or ["BTCUSDT","ETHUSDT"]; tf=timeframe or settings.DEFAULT_TIMEFRAME
        for s in symbols:
            df=self.provider.fetch(s, tf, limit=300); fx=make_features(df); X=fx[feats].tail(1)
            prob=float(m.predict_proba(X)[0,1]); side="buy" if prob>=0.55 else ("sell" if prob<=0.45 else "flat")
            price=float(df["close"].iloc[-1]); out.append({"symbol":s,"side":side,"prob":prob,"price":price,"timeframe":tf})
        return out
EOF

# ---- risk + exec stubs ----
cat > app/services/risk/engine.py <<'EOF'
from dataclasses import dataclass
@dataclass
class RiskDecision: approved: bool; reason: str|None=None
class RiskEngine:
    MAX_POS_PER_SYMBOL=3
    def check_order(self, symbol:str, side:str, qty:float)->RiskDecision:
        if qty<=0: return RiskDecision(False,"qty_must_be_positive")
        return RiskDecision(True)
    def snapshot(self): return {"max_pos_per_symbol": self.MAX_POS_PER_SYMBOL}
EOF

cat > app/services/exec/router.py <<'EOF'
class PaperExec:
    def place_order(self,o:dict)->dict: return {"ok":True,"mode":"paper","echo":o}
class ExecRouter:
    def __init__(self): self.adapters={"paper": PaperExec()}
    def place_order(self, order: dict)->dict: return self.adapters["paper"].place_order(order)
EOF

# ---- portfolio + dashboard state ----
cat > app/services/portfolio/state.py <<'EOF'
from app.db.session import SessionLocal
from app.db.models import TradeLog, SignalLog
from sqlalchemy import select
from datetime import timezone
def _rows(db, M, n): 
    return db.execute(select(M).order_by(M.ts.desc()).limit(n)).scalars().all()
def portfolio_state():
    db=SessionLocal()
    try:
        trades=_rows(db, TradeLog, 100)
        signals=_rows(db, SignalLog, 100)
        t=[{"ts":r.ts.replace(tzinfo=timezone.utc).isoformat(),"symbol":r.symbol,"side":r.side,"qty":r.qty,"price":r.price} for r in trades]
        s=[{"ts":r.ts.replace(tzinfo=timezone.utc).isoformat(),"symbol":r.symbol,"side":r.side,"prob":r.prob,"price":r.price,"tf":r.timeframe} for r in signals]
        return {"recent_trades": t, "recent_signals": s, "equity_curve":[]}
    finally: db.close()
EOF

# ---- workers ----
cat > app/workers/celery_app.py <<'EOF'
from celery import Celery
from app.core.config import settings
celery_app=Celery("quantai", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
celery_app.conf.accept_content=["json"]; celery_app.conf.task_serializer="json"; celery_app.conf.result_serializer="json"
EOF

cat > app/workers/tasks.py <<'EOF'
from .celery_app import celery_app
from app.services.ml.pipeline import SignalEngine
@celery_app.task
def retrain_models(): return SignalEngine().retrain()
@celery_app.task
def run_signal_gen(symbols: list[str]|None=None): return SignalEngine().latest_signals(symbols)
EOF

# ---- scripts ----
cat > scripts/init_db.py <<'EOF'
from app.db.base import Base
from app.db.session import engine
from pathlib import Path
Path("storage").mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)
print("DB initialized")
EOF
chmod +x scripts/init_db.py || true

# ---------------- git + GitHub ----------------
git init
git add .
git commit -m "quantai: initial import"
git branch -M main

REMOTE=https://github.com/${GH_USER}/${REPO_NAME}.git
if git ls-remote --exit-code "$REMOTE" &>/dev/null; then
  git remote add origin "$REMOTE" 2>/dev/null || git remote set-url origin "$REMOTE"
  git push -u origin main
else
  if command -v gh >/dev/null 2>&1; then
    gh repo create "${GH_USER}/${REPO_NAME}" --public --source=. --remote=origin --push
  else
    echo "Repo ${REMOTE} does not exist and gh CLI not found. Create it on GitHub then rerun: git remote add origin ${REMOTE}; git push -u origin main"
  fi
fi

# ---------------- deploy via AutoOps ----------------
# Assumes your AutoApps/AutoOps is listening on 49123 with a /deploy endpoint like your example
curl -sS -X POST http://127.0.0.1:49123/deploy \
  -H 'Content-Type: application/json' -d @- <<JSON
{
  "repo": "https://github.com/${GH_USER}/${REPO_NAME}.git",
  "branch": "main",
  "path": ".",
  "run": [
    "docker compose pull || true",
    "docker compose build",
    "docker compose up -d",
    "docker compose ps",
    "docker exec -it quantai_api python scripts/init_db.py || true",
    "curl -fsS http://localhost:8000/health || true",
    "curl -fsS 'http://localhost:8000/signals/latest?symbols=BTCUSDT,ETHUSDT' || true"
  ]
}
JSON

echo
echo ">>> QuantAI deployed. API: http://<this-host>:8000"
echo "    Health:  curl -s http://localhost:8000/health"
echo "    Signals: curl -s 'http://localhost:8000/signals/latest?symbols=BTCUSDT,ETHUSDT' | jq ."

