import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand, PageIntro } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { PRESETS, PRESET_CATEGORIES } from '../../data/presets'
import { getModel } from '../../data/models'

const SCHEMA = graph(
  orgGraph(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Director presets', path: '/presets' },
  ]),
  {
    '@type': 'ItemList',
    name: 'FlxioAI Vision director presets',
    numberOfItems: PRESETS.length,
    itemListElement: PRESETS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://flxiovision.higgsfield.app/presets/${p.slug}`,
    })),
  },
)

export const Route = createFileRoute('/presets/')({
  head: () =>
    buildHead({
      title: pageTitle('Director Presets — Cinematic AI Recipes'),
      description:
        '37 director presets for AI video and images: camera moves, lighting, film looks, ad formats, social formats, portraits, worlds, and FX — each a transparent, editable recipe.',
      path: '/presets',
    }),
  component: PresetsPage,
})

function PresetsPage() {
  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-10">
        <PageIntro
          eyebrow="Director presets"
          title="Cinematography as a recipe"
          lede="Every preset is a professional prompt pattern with the right engine and settings pre-tuned. Type a one-line subject and generate — then read the recipe and learn the craft. Core presets are free; the full library unlocks on Pro."
        />

        {PRESET_CATEGORIES.map(cat => {
          const items = PRESETS.filter(p => p.category === cat.id)
          return (
            <section key={cat.id} className="grid gap-4">
              <div className="grid gap-1">
                <h2 className="text-q-title-md-semi-bold">{cat.label}</h2>
                <p className="text-q-body-sm-regular text-q-text-secondary">{cat.blurb}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(p => {
                  const model = getModel(p.modelId)
                  return (
                    <Link
                      key={p.slug}
                      to="/presets/$slug"
                      params={{ slug: p.slug }}
                      className="grid content-start gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4 hover:border-q-border-primary"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-q-title-sm-semi-bold text-q-text-primary">{p.name}</span>
                        <span className="rounded-full border border-q-border-subtle px-2 py-0.5 text-q-caption-sm-medium text-q-text-tertiary">
                          {p.core ? 'Free' : 'Pro'}
                        </span>
                      </div>
                      <p className="text-q-body-sm-regular text-q-text-secondary">{p.description}</p>
                      <p className="text-q-caption-sm-medium text-q-text-tertiary">
                        {p.kind === 'video' ? 'Video' : 'Image'} · {model?.name ?? p.modelId}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}

        <CtaBand
          title="Pick a preset, type one line, direct the shot"
          body="20 core presets are free — the composer shows the credit cost before anything runs."
          to="/studio"
          cta="Open the studio"
        />
      </div>
    </PublicPage>
  )
}
