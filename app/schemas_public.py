from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime

class OrderCreate(BaseModel):
    symbol: str = Field(..., examples=["AAPL"])
    side: str = Field(..., pattern="^(buy|sell)$", examples=["buy"])
    qty: float = Field(..., gt=0, examples=[10])
    type: str = Field("market", examples=["market","limit"])
    limit_price: Optional[float] = Field(None, gt=0)

class Order(BaseModel):
    id: str
    created_at: datetime
    status: str = "accepted"
    symbol: str
    side: str
    qty: float
    type: str = "market"
    limit_price: Optional[float] = None

class Position(BaseModel):
    symbol: str
    qty: float
    avg_price: float
    market_price: float
    unrealized_pl: float

class ModelInfo(BaseModel):
    name: str
    version: str
    status: str
    metrics: Dict[str, float] = {}

class TrainRequest(BaseModel):
    model: str = Field(..., examples=["sac_torch"])
    symbol: Optional[str] = None
    epochs: int = 1

class RiskConfig(BaseModel):
    max_global_drawdown_pct: float = 20.0
    vol_target_annual: float = 0.20
    kelly_fraction: float = 0.25
    initial_balance: float = 100000

class Signal(BaseModel):
    ts: datetime
    symbol: str
    action: str = Field(..., pattern="^(buy|sell|hold)$")
    confidence: float = Field(..., ge=0, le=1)

class BacktestRequest(BaseModel):
    symbol: str
    start: datetime
    end: datetime
    model: str = "sac_torch"

class BacktestResult(BaseModel):
    symbol: str
    model: str
    start: datetime
    end: datetime
    trades: int
    return_pct: float
    sharpe: float
    equity_curve: List[float]

class MetricPoint(BaseModel):
    ts: datetime
    name: str
    value: float
