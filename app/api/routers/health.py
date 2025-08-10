from fastapi import APIRouter
router = APIRouter(tags=["health"])
@router.get("/health/z")
def healthz(): return {"ok": True}
