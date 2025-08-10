# SAC AI Trader – minimal stack

## Bring up (AutoOps will handle this)
- API: FastAPI on 0.0.0.0:8000 (host: 8010)
- DB: Postgres 16 (internal)
- Redis: 7 (internal)

### Health
curl http://localhost:8010/health/z
