# Template-file patches (apply when overlaying onto the platform repo)

This directory tree mirrors the Higgsfield app template layout (`app/...`). All
files here are NEW files safe to copy over the template, with these exceptions
and required manual edits to template-owned files:

## 1. `app/app.manifest.json` — MERGE, don't overwrite
Set `"db": true` in the template's existing manifest (keep any other keys).
The overlay file here contains only `{"db": true}` as a reminder.

## 2. `app/src/routes/index.tsx` — overwrite is intended
The overlay replaces the template's placeholder index with the real home page.

## 3. `app/src/routes/__root.tsx` — EDIT the template file (do not replace)
Keep: `bootstrapScript()`, the design-inspector guarded dynamic import, the
Quanta CSS wiring, `data-theme="default-dark"`.
Change the `head()` to real global meta:

```ts
meta: [
  { charSet: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  { title: 'FlxioAI Vision — Direct every frame.' },
  { name: 'description', content: 'FlxioAI Vision is a cinematic AI studio: generate images and videos with the best AI models, guided by 35+ director presets, transparent per-shot costs, boards, remix, batch mode, and shareable results.' },
  { name: 'author', content: 'FlxioAI Vision' },
  { name: 'theme-color', content: '#0A0A0A' },
  { name: 'robots', content: 'index, follow, max-image-preview:large' },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'FlxioAI Vision' },
  { property: 'og:locale', content: 'en_US' },
  { name: 'twitter:card', content: 'summary_large_image' },
],
```

Also ensure ONE `<Toaster />` (from `@higgsfield/quanta/sonner`) is mounted in
the root shell (the template usually has it — verify).

## 4. `app/src/server.ts` — EDIT the template file (do not replace)
At the TOP of the fetch handler, before `handler.fetch`, add trailing-slash
normalization:

```ts
const url = new URL(request.url)
if (url.pathname !== '/' && url.pathname.endsWith('/')) {
  url.pathname = url.pathname.slice(0, -1)
  return Response.redirect(url.toString(), 301)
}
```

Verify `applySecurityHeaders()` wraps every response (template default).

## 5. `app/src/app-meta.json` — overwrite is intended (real values filled)

## 6. `package.json` — verify only
No new dependencies are required. Confirm the template ships
`@material-symbols/svg-400` (used for icons) and `zod`; if the icon package is
absent, add it to dependencies and run `bun install`.

Icons used (all outlined 400): share, download, link, close, check,
arrow_forward, refresh, add, delete, replay, add_photo_alternate, thumb_up.

## 7. Migrations
`app/migrations/0001_flxio_core.sql` is additive-only and safe on live D1.
If the template already has numbered migrations, renumber ours to the next
free `000N_` prefix.

## 8. After overlay
```bash
cd app
bun install        # only if package.json changed
bun run typecheck  # fix any drift between docs-derived API usage and the real SDK
bun run qa:fill -- --strict
```
Then commit, push to the platform repo main, and run deploy_website.
