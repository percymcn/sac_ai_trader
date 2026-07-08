# Deploy FlxioAI Vision live (one command, any terminal)

The app is fully built on branch `claude/saas-product-rebuild-sy45qb`. This
sandbox can't reach the Higgsfield platform git server (egress policy), and
GitHub Actions isn't executing on this repo — so the reliable path is to run
the deploy from **any machine with internet + `git` + `python3`** (your laptop,
a GitHub Codespace, Cloud Shell, etc.). `bun` is optional but recommended so
the typecheck runs before you push.

## Copy-paste this block

```bash
set -e
TOKEN=fea0666aa800c5ba5b28ba51c20242b553e9a008
PLATFORM=apps-repos.higgsfield.ai/hfu-user3EBuQb4r6RDvs1kC4Tr4FwmRtWL/flxiovision-39028a4b-2ab6-4c44-aacd-835176a0c151.git

# 1) overlay source (public)
git clone --depth 1 -b claude/saas-product-rebuild-sy45qb \
  https://github.com/percymcn/sac_ai_trader.git flxio-overlay

# 2) the platform repo (your website)
git -c http.extraHeader="Authorization: token $TOKEN" \
  clone "https://$PLATFORM" platform

# 3) overlay the app + apply template patches
python3 flxio-overlay/flxio-vision/scripts/ci-overlay.py \
  flxio-overlay/flxio-vision/app platform/app

# 4) OPTIONAL but recommended — verify types against the real SDK
#    (fixes here, if any, are usually 1-2 SDK export names)
if command -v bun >/dev/null; then
  ( cd platform/app && bun install && bun run typecheck && bun run qa:fill -- --strict )
fi

# 5) push -> the platform CI builds the live site
cd platform
git add -A
git -c user.name="FlxioAI Vision" -c user.email="deploy@flxiovision.local" \
  commit -m "FlxioAI Vision: full product overlay (studio, billing, SEO, share pages)"
git -c http.extraHeader="Authorization: token $TOKEN" push origin main
echo "Pushed. The platform will build and deploy to https://flxiovision.higgsfield.app"
```

Then tell me **"pushed"** and I poll the deploy via the Higgsfield tools and
verify the live site (homepage, sitemap, robots, schema, pricing, share page,
mobile) and hand you the confirmed URL. If step 4's typecheck flags anything,
paste me the errors — they'll be small SDK export-name fixes and I'll patch the
branch, then you re-run steps 1–5.

## Faster if you can: enable the GitHub Actions bridge
1. Repo **Settings → Actions → General →** "Allow all actions and reusable
   workflows" → Save.
2. **Settings → Secrets and variables → Actions → New repository secret:**
   `PLATFORM_TOKEN` = the token above.
3. Tell me "actions on" — I trigger `platform-sync` and drive it to a verified
   live deploy from here (it overlays, typechecks against the real SDK, and
   pushes, all on GitHub's runner).

## Or the network route
Add `apps-repos.higgsfield.ai` to this environment's network allowlist
(claude.ai → Code → environment settings) and say "unlocked" — I deploy
directly from a fresh worker.

Any one of the three ships it. The one-command block is the most reliable
because it depends on neither the sandbox egress nor GitHub Actions.
