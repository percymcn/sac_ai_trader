import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicPage } from '../components/public-page'
import { StructuredData } from '../components/structured-data'
import { CtaBand, PageIntro } from '../components/marketing'
import { buildHead, graph, orgGraph, softwareAppNode, breadcrumbNode } from '../lib/seo'
import { pageTitle } from '../data/site'

const FEATURES: { title: string; body: string; to: string; linkLabel: string }[] = [
  {
    title: 'Multi-engine composer',
    body: 'Nine frontier engines — Seedance 2.0, Kling 3.0, Veo 3.1 Lite, Wan 2.7, Grok Imagine, GPT Image 2, Nano Banana 2, Seedream 4.5, Soul V2 — behind one prompt box. Switch engines per shot; re-run the same prompt anywhere.',
    to: '/models',
    linkLabel: 'Model guides',
  },
  {
    title: 'Live cost preview',
    body: 'The generate button shows the exact credit cost of every configuration before you run it. Change duration, resolution, or engine and watch the number update. No surprise burn, ever.',
    to: '/pricing',
    linkLabel: 'How pricing works',
  },
  {
    title: '37 director presets',
    body: 'Camera moves, lighting setups, film looks, ad formats, social formats, portraits, worlds, and FX — each a transparent prompt recipe with the right engine and settings pre-tuned. Type a subject, get a cinematic shot.',
    to: '/presets',
    linkLabel: 'Browse presets',
  },
  {
    title: 'Remix',
    body: 'Load any past shot’s complete recipe — prompt, engine, settings, preset — back into the composer with one click. Change one variable and re-run. The foundation of consistent campaign looks.',
    to: '/studio',
    linkLabel: 'Try it in the studio',
  },
  {
    title: 'Batch mode',
    body: 'Queue up to 4 prompts (Pro) or 10 (Studio) in one submission: thumbnail options, ad variants, whole shot lists. Compare results side by side instead of anchoring on one output.',
    to: '/pricing',
    linkLabel: 'See plan limits',
  },
  {
    title: 'Boards',
    body: 'Project-level organization: one board per client, campaign, or film. Every saved shot keeps its full recipe, so a board doubles as a campaign look-book with reproducible settings.',
    to: '/boards',
    linkLabel: 'Open boards',
  },
  {
    title: 'Permanent share pages',
    body: 'Publish any result to an indexable /r/… page with a branded social card, one-tap sharing to every network, the full recipe, and a make-your-own button — your work markets itself.',
    to: '/explore',
    linkLabel: 'See shared shots',
  },
  {
    title: 'Community gallery & leaderboard',
    body: 'Opt shots into the public gallery, collect votes, climb the weekly leaderboard. Every gallery visit feeds share pages; every share page recruits remixers.',
    to: '/explore',
    linkLabel: 'Explore the gallery',
  },
  {
    title: 'Image-to-video',
    body: 'Attach a reference image and drive it with any video engine that accepts image input — exact starting frames for products, characters, and real locations.',
    to: '/use-cases/ecommerce-product-video',
    linkLabel: 'Product video workflow',
  },
]

// The full creative suite — capability parity with the category leaders,
// each carrying the FlxioAI twist (cost preview, editable recipe, share page).
const SUITE: { title: string; body: string; status: 'Live' | 'Rolling out' }[] = [
  { title: 'Image generation', status: 'Live', body: 'GPT Image 2, Nano Banana 2, Seedream 4.5, Soul V2 — one composer, cost shown before each shot.' },
  { title: 'Video generation', status: 'Live', body: 'Seedance 2.0, Kling 3.0, Veo 3.1 Lite, Wan 2.7, Grok Imagine — pick the engine per shot.' },
  { title: 'Image-to-video', status: 'Live', body: 'Drive any image-capable engine from a reference frame you upload.' },
  { title: 'Director presets', status: 'Live', body: '37 transparent cinematic recipes across camera, lighting, film looks, ads, social, portraits, worlds, and FX.' },
  { title: 'Batch mode', status: 'Live', body: 'Queue 4–10 prompts at once and compare results side by side.' },
  { title: 'Enhance / upscale', status: 'Rolling out', body: 'Upscale any image or video to 2K/4K — and enhance any past shot from your history in one click.' },
  { title: 'Remove background', status: 'Rolling out', body: 'One-click cutouts to transparent PNG from any image result.' },
  { title: 'Reframe & outpaint', status: 'Rolling out', body: 'Re-crop a clip to every social ratio, or expand the canvas — straight into a share-ready frame.' },
  { title: 'Motion control', status: 'Rolling out', body: 'Recast or transfer motion from a reference clip onto your subject, saved as a remixable recipe.' },
  { title: 'Characters', status: 'Rolling out', body: 'Train a consistent character once and reuse it across shots, scoped to its own board.' },
  { title: 'Talking-head & voice', status: 'Rolling out', body: 'Lip-synced delivery from a portrait + script, with generated or cloned voices and delivery presets.' },
  { title: '3D, audio & virality', status: 'Rolling out', body: 'Turn images into 3D meshes, score clips with matched music, and predict a clip’s hook strength before you post.' },
]

const SCHEMA = graph(
  orgGraph(),
  softwareAppNode(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
  ]),
)

export const Route = createFileRoute('/features')({
  head: () =>
    buildHead({
      title: pageTitle('Features'),
      description:
        'Every FlxioAI Vision feature: multi-engine composer, live cost preview, 37 director presets, remix, batch mode, boards, share pages, and a community gallery.',
      path: '/features',
    }),
  component: FeaturesPage,
})

function FeaturesPage() {
  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-10">
        <PageIntro
          eyebrow="Features"
          title="Everything a cinematic AI studio should have"
          lede="FlxioAI Vision wraps the best generation engines in the workflow working creators actually need: transparent costs, reusable craft, organization, and distribution."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <article key={f.title} className="grid content-start gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
              <h2 className="text-q-title-sm-semi-bold">{f.title}</h2>
              <p className="text-q-body-sm-regular text-q-text-secondary">{f.body}</p>
              <Link to={f.to} className="text-q-body-sm-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary">
                {f.linkLabel} →
              </Link>
            </article>
          ))}
        </div>
        <section className="grid gap-4">
          <div className="grid max-w-3xl gap-2">
            <h2 className="text-q-title-md-semi-bold text-q-text-primary">The full creative suite</h2>
            <p className="text-q-body-md-regular text-q-text-secondary">
              Everything the category leaders offer — generation, enhancement, characters, voice, 3D —
              with the FlxioAI twist on every tool: a live cost preview, an editable recipe, and a
              shareable result page. Live tools are in the studio today; the rest are rolling out on the
              same composer.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SUITE.map(s => (
              <div key={s.title} className="grid content-start gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-q-title-sm-semi-bold text-q-text-primary">{s.title}</h3>
                  <span
                    className={
                      s.status === 'Live'
                        ? 'rounded-full border border-q-border-primary px-2 py-0.5 text-q-caption-sm-medium text-q-text-primary'
                        : 'rounded-full border border-q-border-subtle px-2 py-0.5 text-q-caption-sm-medium text-q-text-tertiary'
                    }
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-q-body-sm-regular text-q-text-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <CtaBand
          title="See every feature in one run"
          body="Open the studio, pick a director preset, and generate — cost preview, recipe transparency, and share pages all show up in your first two minutes."
          to="/studio"
          cta="Open the studio"
        />
      </div>
    </PublicPage>
  )
}
