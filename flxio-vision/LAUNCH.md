# FlxioAI Vision — launch checklist & punch list

## Current state
- ✅ Website created on the platform: **https://flxiovision.higgsfield.app**
  (deploy pipeline verified — currently serving the blank template until the
  overlay in this directory is pushed to the platform repo).
- ✅ Full product code, content, and SEO engine in this directory (`app/`).
- ✅ Branded cover generated; favicon in `app/public/favicon.svg`.
- ⏳ Final push to the platform repo requires network access to
  `apps-repos.higgsfield.ai` (see below).

## The one unlock needed
This build session's sandbox egress policy allows only GitHub + package
registries, so `git push` to `apps-repos.higgsfield.ai` is blocked (CONNECT
403). Two ways to finish:

**Option A (recommended, 1 minute):** In Claude Code → this environment's
settings → Network access, add the domain `apps-repos.higgsfield.ai` to the
allowed list (also add `d2ol7oe51mr4n9.cloudfront.net` and
`static.higgsfield.ai` for cover-image compositing). Then tell the session
"network unlocked" — it will clone the platform repo, overlay this tree, apply
the two template patches, run typecheck + the placeholder gate, push, deploy,
and verify, fully autonomously.

**Option B (manual):** From any machine with git + rsync, run
`scripts/sync-to-platform.sh` (see its header for env vars; get the repo URL +
token from the platform's website_repo_access tool), then deploy.

## Verification checklist (run after deploy)
- [ ] Home renders with composer; Lighthouse SEO/Perf 95+.
- [ ] Sign-in via `/__auth/login` round-trips; `/api/user` returns profile.
- [ ] Generate 1 image (Nano Banana 2, 1k) — cost preview appears in button,
      confirm modal shows cost, result lands in studio feed.
- [ ] Generate 1 video (Seedance 2.0, 5s 720p std) — polling completes.
- [ ] Remix loads the recipe back into the composer.
- [ ] Create board, add shot, remove shot, delete board.
- [ ] Upgrade to Pro (test mode) on /pricing → /billing shows Pro; batch mode
      shows 4 slots; cancel returns to Free.
- [ ] Publish a share → /r/[id] renders, OG tags present (check with a card
      validator), vote works, sitemap.xml includes the share.
- [ ] robots.txt, sitemap.xml, canonical tags, JSON-LD validate.
- [ ] 375px mobile pass on home, studio, pricing, share page.

## Stripe go-live (when ready for real MRR)
1. Create products/prices: Pro $12/mo + $99/yr, Studio $29/mo + $249/yr.
2. Set the 6 secrets listed in README.md via the platform secrets tool.
3. Add webhook endpoint `https://flxiovision.higgsfield.app/api/billing/webhook`
   (events: checkout.session.completed, customer.subscription.updated,
   customer.subscription.deleted).
4. Redeploy. The same upgrade buttons now route through Stripe Checkout and
   the billing portal handles cards/invoices/cancellation.

## Feature-parity build (during/right after deploy — see FEATURE-PARITY.md)
Wire the SDK-backed tools into the existing studio as new composer modes. They
are documented fnf jobs, so the deploy agent registers them in
`lib/fnf.server.ts` after typechecking exact export/id names against
`app/packages/fnf/ai/AGENTS.md`:
1. **Enhance/upscale** (topaz image/video, sora-enhance) — one-click enhance of
   any history shot; the lowest-risk first parity win.
2. **Remove background** — transparent-PNG cutout action on image results.
3. **Reframe + outpaint** — re-crop to social ratios / expand canvas.
4. **Motion control** — reference-motion transfer, saved as a remixable recipe.
Then the net-new screens (own routes + D1): **Characters** (consistent identity),
**Talking-head + Voice**, **Audio/music**, **3D export**, **Virality predictor**,
**Projects** (multi-shot storyboard→cut). Each ships with the standard twist:
cost preview, editable recipe, board, and share page.

## Punch list (post-launch expansion, in priority order)
1. **OG capsule mask** — compose the stadium-capsule OG variant of the cover
   (scripts in the platform docs; needs CDN egress) and set it as
   `og_image_url`; the plain cover is used for both today.
2. **Dynamic per-share OG images** — a `/api/og/[id]` renderer that frames the
   result media in a branded card (today shares unfurl with the raw media,
   which is good; branded frames are better).
3. **Publish to the Higgsfield community feed** (`publish_website`) once the
   cover video question is answered (video costs credits — owner's call).
4. **Batch cost preview** — per-prompt cost breakdown in the batch confirm.
5. **Weekly leaderboard reset + "shot of the week"** badge on /explore.
6. **Email capture** on blog CTAs (needs an email provider key).
7. **More engines** as the SDK catalog grows (upscalers are already in the
   SDK: topaz image/video — natural Pro features).
8. **Programmatic expansion**: 50+ more /answers entries, per-preset example
   galleries fed by real community shares, /blog category hub pages.
9. **i18n** — the platform SSRs at the edge; localized money pages are cheap
   rank wins (es, pt-BR, de first).
10. **Analytics** — privacy-friendly counter (e.g., self-hosted) for content
    ROI; wire share-page referrer tracking into D1.
