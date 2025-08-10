from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.models import Position, RealizedPnl

def _realize(s: Session, symbol: str, side_closed: str, qty: float, avg_entry: float, price_exit: float) -> float:
    pnl = (price_exit - avg_entry) * qty if side_closed=="buy" else (avg_entry - price_exit) * qty
    s.add(RealizedPnl(symbol=symbol, amount=pnl, side_closed=side_closed, qty=qty, avg_entry=avg_entry, price_exit=price_exit))
    return pnl

def apply_fill_netting(s: Session, symbol: str, side: str, fill_qty: float, fill_price: float) -> dict:
    same = s.execute(select(Position).where(Position.symbol==symbol, Position.side==side, Position.is_open==True)).scalars().first()
    opp_side = "sell" if side=="buy" else "buy"
    opp = s.execute(select(Position).where(Position.symbol==symbol, Position.side==opp_side, Position.is_open==True)).scalars().first()
    realized = 0.0; remaining = fill_qty
    if opp and opp.qty > 0:
        if remaining < opp.qty:
            realized += _realize(s, symbol, opp.side, remaining, opp.avg_price, fill_price)
            opp.qty -= remaining; remaining = 0.0
        elif remaining == opp.qty:
            realized += _realize(s, symbol, opp.side, remaining, opp.avg_price, fill_price)
            opp.qty = 0.0; opp.is_open=False; remaining=0.0
        else:
            realized += _realize(s, symbol, opp.side, opp.qty, opp.avg_price, fill_price)
            remaining -= opp.qty; opp.qty=0.0; opp.is_open=False
    if remaining > 0.0:
        if not same or not same.is_open or same.qty <= 0:
            same = Position(symbol=symbol, side=side, qty=remaining, avg_price=fill_price, is_open=True)
            s.add(same)
        else:
            same.avg_price = (same.avg_price*same.qty + fill_price*remaining) / (same.qty + remaining)
            same.qty += remaining
    return {"realized": float(realized)}
