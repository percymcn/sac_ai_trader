from fastapi import APIRouter
router = APIRouter()

@router.get("/health/z")
def healthz():
    return {"ok": True}
