// Home — the live product first, then the pitch.
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import ArrowIcon from '@material-symbols/svg-400/outlined/arrow_forward.svg?react'
import { PublicPage } from '../components/public-page'
import { Composer } from '../components/composer'
import { StructuredData } from '../components/structured-data'
import { FaqBlock } from '../components/faq-block'
import { SocialProofStrip, FeatureRow, CtaBand } from '../components/marketing'
import { buildHead, graph, orgGraph, softwareAppNode, faqNode } from '../lib/seo'
import { HOME_FAQ } from '../data/faqs'
import { SITE, pageTitle } from '../data/site'
import { PRESET_CATEGORIES, PRESETS } from '../data/presets'
import { MODELS } from '../data/models'
import { PLANS } from '../data/plans'

const SCHEMA = graph(orgGraph(), softwareAppNode(), faqNode(HOME_FAQ))

export const Route = createFileRoute('/')({
  head: () => buildHead({ title: pageTitle(), description: SITE.description, path: '/' }),
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />

      <section className="grid gap-8 py-4 md:py-8">
        <div className="grid max-w-3xl gap-4">
          <h1 className="text-q-display-lg-bold text-q-text-primary">
            {SITE.name} — the cinematic AI studio. {SITE.tagline}
          </h1>
          <p className="text-q-body-md-regular text-q-text-secondary">
            {SITE.name} is an AI video and image generator with the best frontier engines — Seedance 2.0,
            Kling 3.0, Veo 3.1 Lite, GPT Image 2 and more — wrapped in 36 director presets, a live credit
            cost preview on every shot, boards, remix, batch mode, and shareable public results.
          </p>
        </div>

        <Composer onSubmitted={() => void navigate({ to: '/studio' })} compact />
        <p className="text-q-caption-sm-medium text-q-text-tertiary">
          Free plan · every engine included · the cost of each shot is shown before you run it
        </p>
      </section>

      <div className="grid gap-14">
        <SocialProofStrip />

        <FeatureRow
          title="One composer, nine frontier engines"
          body="No single model wins every shot type. Camera language, physics, native audio, and speed live in different engines — so the engine should be a per-shot decision, not a platform commitment."
          points={[
            'Seedance 2.0, Kling 3.0, Veo 3.1 Lite, Wan 2.7, Grok Imagine for video',
            'GPT Image 2, Nano Banana 2, Seedream 4.5, Soul V2 for images',
            'Re-run any prompt on a different engine with one click',
          ]}
          to="/models"
          linkLabel="Read the model guides"
          aside={
            <ul className="grid gap-2">
              {MODELS.map(m => (
                <li key={m.id} className="flex items-center justify-between gap-3">
                  <Link to="/models/$slug" params={{ slug: m.slug }} className="text-q-body-md-regular text-q-text-primary hover:underline">
                    {m.name}
                  </Link>
                  <span className="truncate text-q-caption-sm-medium text-q-text-tertiary">{m.bestFor.split(',')[0]}</span>
                </li>
              ))}
            </ul>
          }
        />

        <FeatureRow
          flip
          title="Director presets: cinematography as a recipe"
          body="Dolly-ins, neon noir, 35mm film, product hero spins — 36 presets across 8 packs encode professional prompt craft. Unlike effect buttons, every preset is a transparent recipe you can read, edit, and learn from."
          points={[
            'Camera moves, lighting, film looks, ads, social, portraits, worlds, FX',
            'Each preset picks the right engine and settings automatically',
            'Type a one-line subject, get a cinematic shot',
          ]}
          to="/presets"
          linkLabel="Browse all presets"
          aside={
            <div className="grid gap-2">
              {PRESET_CATEGORIES.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-3">
                  <span className="text-q-body-md-regular text-q-text-primary">{c.label}</span>
                  <span className="text-q-caption-sm-medium text-q-text-tertiary tabular-nums">
                    {PRESETS.filter(p => p.category === c.id).length} presets
                  </span>
                </div>
              ))}
            </div>
          }
        />

        <FeatureRow
          title="Transparent costs. Zero credit anxiety."
          body="The generate button shows the exact credit cost of every shot — before you run it, at every resolution, on every engine. Plans gate workflow power, never model access."
          points={[
            'Live cost preview inside the generate button',
            'Every engine available on the Free plan',
            'No expiring credit packs, no surprise multipliers',
          ]}
          to="/pricing"
          linkLabel="See pricing"
          aside={
            <div className="grid gap-3">
              {PLANS.map(p => (
                <div key={p.id} className="flex items-baseline justify-between gap-3">
                  <span className="text-q-body-md-regular text-q-text-primary">{p.name}</span>
                  <span className="text-q-title-sm-semi-bold text-q-text-primary tabular-nums">
                    {p.monthlyUsd === 0 ? 'Free' : `$${p.monthlyUsd}/mo`}
                  </span>
                </div>
              ))}
              <p className="text-q-caption-sm-medium text-q-text-tertiary">Annual saves ~30%.</p>
            </div>
          }
        />

        <FeatureRow
          flip
          title="Built to be shared"
          body="Publish any result to a permanent page with a branded social card, one-tap sharing, and a remix button that turns viewers into creators. Climb the gallery leaderboard while your best work markets itself."
          points={[
            'Permanent /r/... pages that unfurl beautifully everywhere',
            'X, Facebook, LinkedIn, WhatsApp, Reddit, copy link, download',
            'Public gallery with community votes',
          ]}
          to="/explore"
          linkLabel="Explore the gallery"
          aside={
            <div className="grid gap-2 text-q-body-sm-regular text-q-text-secondary">
              <p className="rounded-lg bg-q-background-primary p-3">
                “Slow dolly-in on a detective studying a wall of clues…” → a permanent share page with the
                clip, the recipe, and a make-your-own button.
              </p>
              <Link to="/explore" className="text-q-text-primary underline underline-offset-4">
                See what people are making →
              </Link>
            </div>
          }
        />

        <section className="grid gap-4">
          <h2 className="text-q-title-md-semi-bold text-q-text-primary">Who uses {SITE.shortName} Vision</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: '/use-cases/youtube-creators', label: 'YouTube creators', blurb: 'Custom B-roll and thumbnails' },
              { to: '/use-cases/ecommerce-product-video', label: 'E-commerce brands', blurb: 'Product videos that sell' },
              { to: '/use-cases/marketing-agencies', label: 'Agencies', blurb: 'Moving pitches in hours' },
              { to: '/use-cases/filmmakers-previz', label: 'Filmmakers', blurb: 'Previz that looks like dailies' },
            ].map(u => (
              <Link
                key={u.to}
                to={u.to}
                className="grid gap-1 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4 hover:border-q-border-primary"
              >
                <span className="text-q-label-lg-semi-bold text-q-text-primary">{u.label}</span>
                <span className="text-q-body-sm-regular text-q-text-secondary">{u.blurb}</span>
              </Link>
            ))}
          </div>
          <div>
            <Link to="/use-cases">
              <Button variant="ghost" size="sm">
                All use cases <ArrowIcon width={16} height={16} aria-hidden />
              </Button>
            </Link>
          </div>
        </section>

        <FaqBlock items={HOME_FAQ} />

        <CtaBand
          title="Direct your first shot in the next two minutes"
          body="Pick a preset, type one line, and watch a cinematic clip render — with the cost shown before you commit a single credit."
          to="/studio"
          cta="Open the studio"
        />
      </div>
    </PublicPage>
  )
}
