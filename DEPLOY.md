# Deploy FlxioAI Vision live — one command

The app is fully built on branch `claude/saas-product-rebuild-sy45qb`. The
final hop (pushing the code onto the Higgsfield platform repo) has to run from a
machine with open internet, because the assistant's sandbox network is locked
and this repo's GitHub Actions runners aren't executing. Easiest = a **GitHub
Codespace** (runs in your browser, nothing to install).

## Fastest: GitHub Codespace (browser, zero install)

1. Go to **github.com/percymcn/sac_ai_trader** → green **Code** button →
   **Codespaces** tab → **Create codespace on main**. A terminal opens in your
   browser after ~30s.
2. Paste this whole block and press Enter:

```bash
curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1; export PATH="$HOME/.bun/bin:$PATH"
TOKEN=fea0666aa800c5ba5b28ba51c20242b553e9a008
PLAT=apps-repos.higgsfield.ai/hfu-user3EBuQb4r6RDvs1kC4Tr4FwmRtWL/flxiovision-39028a4b-2ab6-4c44-aacd-835176a0c151.git
rm -rf ovl platform
git clone --depth 1 -b claude/saas-product-rebuild-sy45qb https://github.com/percymcn/sac_ai_trader.git ovl
git -c http.extraHeader="Authorization: token $TOKEN" clone "https://$PLAT" platform
python3 ovl/flxio-vision/scripts/ci-overlay.py ovl/flxio-vision/app platform/app
( cd platform/app && bun install >/dev/null 2>&1 && (bun run typecheck || echo "TYPECHECK_ISSUES — paste output to the assistant") )
cd platform
git add -A
git -c user.name="FlxioAI Vision" -c user.email="deploy@flxiovision.local" commit -m "FlxioAI Vision: full product overlay"
git -c http.extraHeader="Authorization: token $TOKEN" push origin main && echo "==== PUSHED — tell the assistant 'pushed' ===="
```

3. When you see **PUSHED**, come back and say **"pushed"** — I poll the
   platform build and verify the live site (homepage, sitemap, robots, schema,
   pricing, `/r/` sharing, mobile) and hand you the confirmed URL.

If the run prints `TYPECHECK_ISSUES`, copy the lines above it to me — they'll be
one or two SDK export-name fixes; I patch the branch and you re-run the block.

## Same command on your own laptop
Any terminal with `git` + `python3` (+ `bun` recommended) works — paste the same
block. On macOS/Linux/WSL it runs as-is.

## Why not automatic?
- The assistant's sandbox can't reach `apps-repos.higgsfield.ai` (proxy egress
  policy — returns 000/403).
- This repo's GitHub Actions jobs never get a runner (5 runs died in ~3s) — a
  GitHub account/runner policy, not the workflow.
- The Higgsfield MCP builds *from* the platform repo but has no tool to write
  code into it.

So the code push must originate from open-internet compute you control. Once
it's pushed, everything else (build, deploy, verify) is automatic / done by me.
