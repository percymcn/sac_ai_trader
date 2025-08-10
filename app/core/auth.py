from typing import Optional
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse
from app.core.config import settings

SAFE_PATHS = ("/health", "/openapi.json", "/docs", "/redoc")

def _extract_token(request: Request) -> Optional[str]:
    # 1) Prefer 'api_key' (Base44)
    t = request.headers.get("api_key")
    if t: return t.strip()
    # 2) Then 'X-API-Key'
    t = request.headers.get("X-API-Key")
    if t: return t.strip()
    # 3) Then 'Authorization: Bearer <token>'
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()
    # 4) Optional ?api_key=... fallback
    q = request.query_params.get("api_key")
    if q: return q.strip()
    return None

class APIKeyMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, *, required: bool = True) -> None:
        super().__init__(app)
        self.required = required

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        # Bypass preflight and safe endpoints
        if request.method == "OPTIONS" or any(request.url.path.startswith(p) for p in SAFE_PATHS):
            return await call_next(request)

        # If no ADMIN_API_KEY is set, allow all (dev mode)
        admin_key = (settings.ADMIN_API_KEY or "").strip()
        if not admin_key:
            return await call_next(request)

        token = _extract_token(request)
        if token == admin_key:
            return await call_next(request)

        return JSONResponse({"detail": "Unauthorized"}, status_code=401)
