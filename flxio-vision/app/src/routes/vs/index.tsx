import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand, PageIntro } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode } from '../../lib/seo'
import { pageTitle, SITE } from '../../data/site'
import { COMPETITORS } from '../../data/competitors'

const SCHEMA = graph(
  orgGraph(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Comparisons', path: '/vs' },
  ]),
)

export const Route = createFileRoute('/vs/')({
  head: () =>
    buildHead({
      title: pageTitle('Compare AI Video Tools'),
      description:
        'Honest head-to-head comparisons: FlxioAI Vision vs Higgsfield, Runway, Kling, Luma, Pika, Sora, Hailuo, Veo, Freepik, Krea, LTX Studio, and Pollo.',
      path: '/vs',
    }),
  component: VsIndexPage,
})

function VsIndexPage() {
  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-10">
        <PageIntro
          eyebrow="Comparisons"
          title={`${SITE.name} vs. everyone — honestly`}
          lede="Each comparison lists where the other tool genuinely wins before making our case. If a competitor fits your job better, these pages will tell you."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMPETITORS.map(c => (
            <Link
              key={c.slug}
              to="/vs/$slug"
              params={{ slug: c.slug }}
              className="grid content-start gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5 hover:border-q-border-primary"
            >
              <span className="text-q-title-sm-semi-bold text-q-text-primary">
                {SITE.shortName} vs {c.name}
              </span>
              <span className="text-q-body-sm-regular text-q-text-secondary">{c.oneLiner}</span>
              <span className="text-q-caption-sm-medium text-q-text-tertiary">{c.category}</span>
            </Link>
          ))}
        </div>
        <CtaBand
          title="The fastest comparison is running a prompt"
          body="Every engine is on the Free plan — test us against anything with your own shot."
          to="/studio"
          cta="Open the studio"
        />
      </div>
    </PublicPage>
  )
}
