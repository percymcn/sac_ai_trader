from fastapi import APIRouter, Query
from typing import List
from datetime import datetime, timedelta
from app.schemas_public import Signal

router = APIRouter(prefix="/signals", tags=["signals"])

@router.get("", response_model=List[Signal])
def list_signals(symbol: str = Query(..., examples=["AAPL"])):
    now = datetime.utcnow()
    return [
        Signal(ts=now - timedelta(minutes=10), symbol=symbol, action="hold", confidence=0.40),
        Signal(ts=now - timedelta(minutes=5), symbol=symbol, action="buy", confidence=0.71),
    ]
