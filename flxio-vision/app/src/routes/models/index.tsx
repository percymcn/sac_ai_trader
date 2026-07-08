import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand, PageIntro } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { IMAGE_MODELS, VIDEO_MODELS } from '../../data/models'

const SCHEMA = graph(
  orgGraph(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Models', path: '/models' },
  ]),
)

export const Route = createFileRoute('/models/')({
  head: () =>
    buildHead({
      title: pageTitle('AI Model Guides'),
      description:
        'Guides to every engine in FlxioAI Vision: Seedance 2.0, Kling 3.0, Veo 3.1 Lite, Wan 2.7, Grok Imagine, GPT Image 2, Nano Banana 2, Seedream 4.5, and Soul V2.',
      path: '/models',
    }),
  component: ModelsPage,
})

function ModelsPage() {
  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-10">
        <PageIntro
          eyebrow="Model guides"
          title="Nine engines, each with a specialty"
          lede="No single model wins every shot type. These guides explain what each engine is best at, its settings, and the presets that use it — so the model becomes a per-shot decision."
        />
        {[
          { label: 'Video engines', models: VIDEO_MODELS },
          { label: 'Image engines', models: IMAGE_MODELS },
        ].map(group => (
          <section key={group.label} className="grid gap-4">
            <h2 className="text-q-title-md-semi-bold">{group.label}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.models.map(m => (
                <Link
                  key={m.id}
                  to="/models/$slug"
                  params={{ slug: m.slug }}
                  className="grid content-start gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4 hover:border-q-border-primary"
                >
                  <span className="text-q-title-sm-semi-bold text-q-text-primary">{m.name}</span>
                  <p className="text-q-body-sm-regular text-q-text-secondary">{m.strengths}</p>
                  <p className="text-q-caption-sm-medium text-q-text-tertiary">Best for: {m.bestFor}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <CtaBand
          title="Stop choosing a platform. Choose per shot."
          body="Every engine here is available on the Free plan — run the same prompt on two engines and compare."
          to="/studio"
          cta="Open the studio"
        />
      </div>
    </PublicPage>
  )
}
