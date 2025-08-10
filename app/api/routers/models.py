from fastapi import APIRouter
from typing import List
from app.schemas_public import ModelInfo, TrainRequest

router = APIRouter(prefix="/models", tags=["models"])
_MODELS: List[ModelInfo] = [ModelInfo(name="sac_torch", version="0.1.0", status="ready", metrics={"val_acc":0.73})]

@router.get("", response_model=List[ModelInfo])
def list_models(): return _MODELS

@router.post("/train")
def train(req: TrainRequest):
    # stub: pretend training was queued
    return {"status":"queued","model":req.model,"symbol":req.symbol,"epochs":req.epochs}
