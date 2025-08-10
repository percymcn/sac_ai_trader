from fastapi import APIRouter
from app.schemas_public import RiskConfig

router = APIRouter(prefix="/risk", tags=["risk"])
_RISK = RiskConfig()

@router.get("/config", response_model=RiskConfig)
def get_risk(): return _RISK

@router.put("/config", response_model=RiskConfig)
def put_risk(cfg: RiskConfig):
    global _RISK; _RISK = cfg; return _RISK
