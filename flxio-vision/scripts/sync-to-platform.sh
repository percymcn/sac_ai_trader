#!/usr/bin/env bash
# Overlay this tree onto the FlxioAI Vision platform repo and push.
# Usage:
#   PLATFORM_REPO_URL=https://apps-repos.higgsfield.ai/<owner>/<repo>.git \
#   PLATFORM_TOKEN=<scoped token from website_repo_access> \
#   ./scripts/sync-to-platform.sh
#
# Requires: git, rsync. Read PLATFORM_PATCHES.md first — two template files
# (__root.tsx, server.ts) need small manual edits that this script checks for.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
: "${PLATFORM_REPO_URL:?set PLATFORM_REPO_URL}"
: "${PLATFORM_TOKEN:?set PLATFORM_TOKEN}"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "Cloning platform repo..."
git -c http.extraHeader="Authorization: token ${PLATFORM_TOKEN}" clone --depth 1 "$PLATFORM_REPO_URL" "$WORK/repo"

echo "Overlaying app tree (new files + intended overwrites)..."
rsync -a \
  --exclude 'app.manifest.json' \
  "$HERE/app/" "$WORK/repo/app/"

echo "Merging app.manifest.json (db: true)..."
python3 - "$WORK/repo/app/app.manifest.json" <<'PY'
import json, sys
path = sys.argv[1]
try:
    with open(path) as f:
        manifest = json.load(f)
except FileNotFoundError:
    manifest = {}
manifest["db"] = True
with open(path, "w") as f:
    json.dump(manifest, f, indent=2)
    f.write("\n")
PY

echo "Checking template patches (see PLATFORM_PATCHES.md)..."
if ! grep -q "FlxioAI Vision" "$WORK/repo/app/src/routes/__root.tsx"; then
  echo "WARNING: app/src/routes/__root.tsx still has template meta — apply patch #3 manually." >&2
fi
if ! grep -q "endsWith('/')" "$WORK/repo/app/src/server.ts"; then
  echo "WARNING: app/src/server.ts missing trailing-slash redirect — apply patch #4 manually." >&2
fi

cd "$WORK/repo"
git add -A
git -c user.name="FlxioAI Vision" -c user.email="deploy@flxiovision.local" \
  commit -m "FlxioAI Vision: full product overlay (studio, billing, SEO, share pages)"
git -c http.extraHeader="Authorization: token ${PLATFORM_TOKEN}" push origin main

echo "Pushed. Now run deploy_website (or the platform deploy) to ship it live."
