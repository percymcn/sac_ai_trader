from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from app.db.base import Base

class Poke(Base):
    __tablename__ = "poke"
    id = Column(Integer, primary_key=True)
    tag = Column(String, index=True)
    at = Column(DateTime(timezone=True), server_default=func.now())
    v = Column(Float, default=1.0)
