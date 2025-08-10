from fastapi import APIRouter
from typing import List
from datetime import datetime
from app.schemas_public import BacktestRequest, BacktestResult

router = APIRouter(prefix="/backtest", tags=["backtest"])

@router.post("", response_model=BacktestResult)
def run_backtest(req: BacktestRequest):
    # stub: deterministic fake result
    days = max(1, int((req.end - req.start).total_seconds() // 86400))
    equity = [100000 + i*50 for i in range(days)]
    return BacktestResult(
        symbol=req.symbol, model=req.model, start=req.start, end=req.end,
        trades=days//3, return_pct=((equity[-1]-equity[0])/equity[0])*100, sharpe=1.2, equity_curve=equity
    )
