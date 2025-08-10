from fastapi import APIRouter
router = APIRouter()
@router.get("/z")
def z():
    return {"ok": True}
