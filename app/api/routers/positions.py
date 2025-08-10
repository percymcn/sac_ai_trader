from fastapi import APIRouter
from typing import List
from app.schemas_public import Position

router = APIRouter(prefix="/positions", tags=["positions"])
_POSITIONS: List[Position] = [
    Position(symbol="AAPL", qty=10, avg_price=180.0, market_price=182.5, unrealized_pl=25.0),
    Position(symbol="MSFT", qty=-5, avg_price=410.0, market_price=405.0, unrealized_pl=25.0),
]

@router.get("", response_model=List[Position])
def list_positions(): return _POSITIONS
