#!/usr/bin/env bash
set -euo pipefail
cd ~/code/sac_ai_trader

# add package markers
for d in \
  app \
  app/api app/api/routers \
  app/core \
  app/db app/db/crud \
  app/data app/data/collectors \
  app/ml \
  app/execution app/execution/adapters \
  app/tasks \
  app/analytics \
  app/risk
do
  mkdir -p "$d"
  [ -f "$d/__init__.py" ] || touch "$d/__init__.py"
done

# more verbose uvicorn logs (optional but helpful)
sed -i 's|uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --proxy-headers|uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --proxy-headers --log-level info|' docker-compose.yml

git add .
git commit -m "Add __init__.py to all packages; enable uvicorn info logs" || true
git push -u origin main || true

# rebuild & restart
docker compose build
docker compose up -d --remove-orphans

# show status
docker compose ps
