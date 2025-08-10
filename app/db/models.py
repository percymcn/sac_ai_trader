from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Trade(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True)
    symbol = Column(String, index=True)
    side = Column(String)
    qty = Column(Float)
    status = Column(String, default="pending")
    broker = Column(String, default="tradelocker")
    client_order_id = Column(String, index=True, unique=True, nullable=True)
    broker_order_id = Column(String, index=True, nullable=True)
    avg_price = Column(Float, nullable=True)
    filled_qty = Column(Float, default=0.0)
    meta = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Candle(Base):
    __tablename__ = "candles"
    id = Column(Integer, primary_key=True)
    symbol = Column(String, index=True)
    timeframe = Column(String, index=True)
    ts = Column(DateTime(timezone=True), index=True)
    open = Column(Float); high = Column(Float); low = Column(Float); close = Column(Float); volume = Column(Float)

class Position(Base):
    __tablename__ = "positions"
    id = Column(Integer, primary_key=True)
    symbol = Column(String, index=True)
    side = Column(String)
    qty = Column(Float, default=0.0)
    avg_price = Column(Float, default=0.0)
    is_open = Column(Boolean, default=True)
    opened_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
    pnl = Column(Float, default=0.0)
    __table_args__ = (UniqueConstraint("symbol","side","is_open", name="uix_symbol_side_open"),)

class Fill(Base):
    __tablename__ = "fills"
    id = Column(Integer, primary_key=True)
    trade_id = Column(Integer, ForeignKey("trades.id"), nullable=True)
    broker = Column(String, default="tradelocker")
    client_order_id = Column(String, index=True, nullable=True)
    broker_order_id = Column(String, index=True, nullable=True)
    exec_id = Column(String, index=True, nullable=True)
    symbol = Column(String, index=True)
    side = Column(String)
    qty = Column(Float)
    price = Column(Float)
    meta = Column(JSON)
    ts = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class RealizedPnl(Base):
    __tablename__ = "realized_pnl"
    id = Column(Integer, primary_key=True)
    symbol = Column(String, index=True)
    amount = Column(Float)
    side_closed = Column(String)
    qty = Column(Float)
    avg_entry = Column(Float)
    price_exit = Column(Float)
    ts = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class PnLSnapshot(Base):
    __tablename__ = "pnl_snapshots"
    id = Column(Integer, primary_key=True)
    ts = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    equity = Column(Float)
    balance = Column(Float)
    dd_pct = Column(Float)
