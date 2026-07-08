# FlxioAI Vision — cinematic AI studio (full SaaS)

**Live app:** https://flxiovision.higgsfield.app
**Brand:** FlxioAI Vision — “Direct every frame.”

A production-ready SaaS in the AI video/image generation category (the
higgsfield.ai market), built as an original product on the Higgsfield app
platform (React 19 + TanStack Start, SSR, one Cloudflare Worker, D1, Quanta
design system, Sign in with Higgsfield, fnf generation SDK).

## What's inside

### Product (working tool)
- **Studio** (`/studio`) — multi-engine composer over 9 frontier models
  (Seedance 2.0, Kling 3.0, Veo 3.1 Lite, Wan 2.7, Grok Imagine, GPT Image 2,
  Nano Banana 2, Seedream 4.5, Soul V2), live credit **cost preview inside the
  generate button**, confirmation gate, image-to-video reference upload,
  polling feed, remix, plan-gated **batch mode**.
- **Director presets** (37, in 8 packs) — transparent prompt recipes with
  tuned engine + settings; 20 free, all on Pro.
- **Boards** — project collections; **history** enriched with full recipes.
- **Viral loop** — permanent indexable `/r/[id]` share pages with per-result
  OG tags, Web Share API + X/Facebook/LinkedIn/WhatsApp/Reddit/copy/download
  fallbacks, public gallery + vote leaderboard (`/explore`).

### Monetization
- Plans: Free / Pro $12mo·$99yr / Studio $29mo·$249yr (gate batch size,
  presets, boards, history depth — never model access).
- Full upgrade flow + billing page + cancel/manage.
- **Stripe fully wired via REST** (`app/src/lib/stripe.server.ts`,
  checkout, billing portal, signature-verified webhook at
  `/api/billing/webhook`). With no keys set it runs an honest **test-mode
  checkout** (real plan changes in D1, no card) — drop in keys to go live.

### SEO / growth engine (~230 indexable pages)
- Money pages: home, features, pricing (+FAQ), 8 use-case pages, 9 model
  guides, 36 preset pages.
- **/vs/[competitor]** — 12 honest versus pages (Higgsfield, Runway, Kling,
  Luma, Pika, Sora, Hailuo, Veo/Flow, Freepik, Krea, LTX, Pollo).
- **/best/[category]** — 6 ranking hubs; **/answers/** — 27 GEO-optimized
  long-tail Q&A pages; **blog** — 12 full 800–1500-word posts
  (pillar+cluster, TL;DR, bylines, internal links, CTAs).
- Technical SEO: per-page title/meta/canonical/OG/Twitter, JSON-LD
  (Organization, WebSite, SoftwareApplication, Article, BreadcrumbList,
  FAQPage, ItemList, Offer), dynamic `sitemap.xml` (includes published share
  pages), `robots.txt`, clean slugs, trailing-slash 301s.

## Go-live: Stripe keys
Set website secrets (platform `website_secrets` tool), then redeploy:
```
STRIPE_SECRET_KEY            sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET        whsec_...   (endpoint: POST /api/billing/webhook)
STRIPE_PRICE_PRO_MONTHLY     price_...
STRIPE_PRICE_PRO_ANNUAL      price_...
STRIPE_PRICE_STUDIO_MONTHLY  price_...
STRIPE_PRICE_STUDIO_ANNUAL   price_...
```
Create the 4 prices in Stripe ($12/mo, $99/yr, $29/mo, $249/yr) and add the
webhook with events: `checkout.session.completed`,
`customer.subscription.updated`, `customer.subscription.deleted`.

## Deploying this tree
The platform repo (apps-repos.higgsfield.ai) hosts the app template this tree
overlays. From an environment that can reach it:
1. Read `PLATFORM_PATCHES.md` (two small edits to template files).
2. Run `scripts/sync-to-platform.sh` with `PLATFORM_REPO_URL` + `PLATFORM_TOKEN`.
3. `cd app && bun run typecheck && bun run qa:fill -- --strict`, fix drift, push.
4. Deploy via the platform (`deploy_website`).
