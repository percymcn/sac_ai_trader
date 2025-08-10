from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import List
from app.schemas_public import Order, OrderCreate

router = APIRouter(prefix="/orders", tags=["orders"])
_ORDERS: List[Order] = []
_COUNTER = 1

@router.get("", response_model=List[Order])
def list_orders(): return _ORDERS

@router.post("", response_model=Order)
def create_order(body: OrderCreate):
    global _COUNTER
    o = Order(
        id=str(_COUNTER), created_at=datetime.utcnow(), status="accepted",
        symbol=body.symbol, side=body.side, qty=body.qty, type=body.type, limit_price=body.limit_price
    )
    _COUNTER += 1
    _ORDERS.append(o)
    return o

@router.get("/{order_id}", response_model=Order)
def get_order(order_id: str):
    for o in _ORDERS:
        if o.id == order_id: return o
    raise HTTPException(status_code=404, detail="Order not found")
