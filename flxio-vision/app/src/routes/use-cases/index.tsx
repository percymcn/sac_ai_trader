import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand, PageIntro } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { USE_CASES } from '../../data/use-cases'

const SCHEMA = graph(
  orgGraph(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Use cases', path: '/use-cases' },
  ]),
)

export const Route = createFileRoute('/use-cases/')({
  head: () =>
    buildHead({
      title: pageTitle('Use Cases'),
      description:
        'How creators use FlxioAI Vision: YouTube B-roll, e-commerce product videos, agency pitches, film previz, social content, music visuals, real estate, and game cinematics.',
      path: '/use-cases',
    }),
  component: UseCasesPage,
})

function UseCasesPage() {
  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-10">
        <PageIntro
          eyebrow="Use cases"
          title="One studio, every content pipeline"
          lede="The same composer powers very different jobs. Each guide below maps the workflow: which presets, which engines, and the pipeline that ships."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {USE_CASES.map(u => (
            <Link
              key={u.slug}
              to="/use-cases/$slug"
              params={{ slug: u.slug }}
              className="grid content-start gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5 hover:border-q-border-primary"
            >
              <span className="text-q-title-sm-semi-bold text-q-text-primary">{u.title}</span>
              <span className="text-q-body-sm-regular text-q-text-secondary">{u.headline}</span>
            </Link>
          ))}
        </div>
        <CtaBand
          title="Your workflow probably fits in an afternoon"
          body="Open the studio and run the first shot of whichever pipeline is yours."
          to="/studio"
          cta="Open the studio"
        />
      </div>
    </PublicPage>
  )
}
