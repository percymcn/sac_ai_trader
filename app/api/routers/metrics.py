from fastapi import APIRouter, Query
from typing import List
from datetime import datetime, timedelta
from app.schemas_public import MetricPoint

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("", response_model=List[MetricPoint])
def list_metrics(symbol: str = Query("AAPL"), name: str = Query("equity")):
    now = datetime.utcnow()
    pts: List[MetricPoint] = []
    base = 100000.0
    for i in range(30):
        pts.append(MetricPoint(ts=now - timedelta(days=29-i), name=name, value=base + i*42.0))
    return pts
