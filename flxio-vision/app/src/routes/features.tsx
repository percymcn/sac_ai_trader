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
