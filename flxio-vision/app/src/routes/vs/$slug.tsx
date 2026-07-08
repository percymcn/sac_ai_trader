import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import CheckIcon from '@material-symbols/svg-400/outlined/check.svg?react'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode, faqNode, softwareAppNode } from '../../lib/seo'
import { pageTitle, SITE } from '../../data/site'
import { COMPETITORS, getCompetitor } from '../../data/competitors'

export const Route = createFileRoute('/vs/$slug')({
  loader: ({ params }) => {
    if (!getCompetitor(params.slug)) throw notFound()
    return { slug: params.slug }
  },
  head: ({ params }) => {
    const c = getCompetitor(params.slug)
    if (!c) return { meta: [{ title: pageTitle('Comparison') }] }
    return buildHead({
      title: pageTitle(`${SITE.shortName} vs ${c.name} (2026)`),
      description: `${c.name} alternative? An honest ${SITE.shortName} Vision vs ${c.name} comparison: where ${c.name} is strong, where we win, features, and pricing.`,
      path: `/vs/${c.slug}`,
    })
  },
  component: VsDetailPage,
})

const FLXIO_COLUMN = {
  entryPrice: 'Free plan; Pro $12/mo, Studio $29/mo',
  freeTier: 'Full studio, every engine, 20 presets',
  engines: '9 frontier engines (video + image)',
  costPreview: 'Exact cost shown before every shot',
  presets: '37 transparent director presets',
  workflow: 'Boards, remix, batch, history',
  sharing: 'Permanent share pages + gallery',
}

function VsDetailPage() {
  const { slug } = Route.useLoaderData() as { slug: string }
  const c = getCompetitor(slug)!
  const others = COMPETITORS.filter(x => x.slug !== c.slug).slice(0, 5)

  const schema = graph(
    orgGraph(),
    softwareAppNode(),
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Comparisons', path: '/vs' },
      { name: `${SITE.shortName} vs ${c.name}`, path: `/vs/${c.slug}` },
    ]),
    faqNode(c.faq),
  )

  return (
    <PublicPage>
      <StructuredData json={schema} />
      <article className="mx-auto grid w-full max-w-4xl gap-10">
        <header className="grid gap-3">
          <p className="text-q-caption-sm-medium uppercase tracking-wide text-q-text-tertiary">
            <Link to="/vs" className="hover:text-q-text-secondary">Comparisons</Link>
          </p>
          <h1 className="text-q-headline-md-semi-bold">
            {SITE.shortName} Vision vs {c.name}: which should you use in 2026?
          </h1>
          <p className="max-w-3xl text-q-body-md-regular text-q-text-secondary">
            {c.name} is a {c.category} — {c.oneLiner.toLowerCase()} This is an honest comparison: where{' '}
            {c.name} genuinely wins, where {SITE.name} wins, and a straight feature and pricing table so
            you can decide in two minutes.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="grid content-start gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
            <h2 className="text-q-title-sm-semi-bold">Where {c.name} is strong</h2>
            <ul className="grid gap-2">
              {c.strengths.map(s => (
                <li key={s} className="text-q-body-sm-regular text-q-text-secondary">
                  — {s}
                </li>
              ))}
            </ul>
          </section>
          <section className="grid content-start gap-3 rounded-lg border border-q-border-primary bg-q-background-secondary p-5">
            <h2 className="text-q-title-sm-semi-bold">Where {SITE.shortName} wins</h2>
            <ul className="grid gap-2">
              {c.flxioWins.map(w => (
                <li key={w} className="flex items-start gap-2 text-q-body-sm-regular text-q-text-secondary">
                  <CheckIcon width={16} height={16} aria-hidden className="mt-0.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">Why people switch from {c.name}</h2>
          <ul className="grid gap-2">
            {c.weaknesses.map(w => (
              <li key={w} className="text-q-body-md-regular text-q-text-secondary">
                — {w}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">Feature &amp; pricing table</h2>
          <div className="overflow-x-auto rounded-lg border border-q-border-subtle">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-q-border-subtle bg-q-background-secondary">
                  <th className="p-3 text-q-label-lg-semi-bold"> </th>
                  <th className="p-3 text-q-label-lg-semi-bold">{SITE.shortName} Vision</th>
                  <th className="p-3 text-q-label-lg-semi-bold">{c.name}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Entry price', FLXIO_COLUMN.entryPrice, c.entryPrice],
                  ['Free tier', FLXIO_COLUMN.freeTier, c.freeTier],
                  ['Engines', FLXIO_COLUMN.engines, c.category.includes('multi') || c.slug === 'higgsfield' || c.slug === 'freepik' || c.slug === 'krea' || c.slug === 'pollo' ? 'Multiple (varies by tier)' : 'Single vendor'],
                  ['Cost transparency', FLXIO_COLUMN.costPreview, 'Costs learned by spending credits'],
                  ['Cinematic presets', FLXIO_COLUMN.presets, c.slug === 'higgsfield' || c.slug === 'pollo' ? 'Effect templates (fixed)' : 'Limited / none'],
                  ['Pipeline workflow', FLXIO_COLUMN.workflow, 'Varies; generally thinner'],
                  ['Shareable result pages', FLXIO_COLUMN.sharing, 'Not a core feature'],
                ].map(([label, ours, theirs]) => (
                  <tr key={label as string} className="border-b border-q-border-subtle last:border-0">
                    <td className="p-3 text-q-body-sm-regular text-q-text-tertiary">{label}</td>
                    <td className="p-3 text-q-body-sm-regular text-q-text-primary">{ours}</td>
                    <td className="p-3 text-q-body-sm-regular text-q-text-secondary">{theirs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-q-caption-sm-medium text-q-text-tertiary">
            Competitor pricing is the published entry tier as of mid-2026 — verify current terms with the
            vendor before purchasing.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">Frequently asked questions</h2>
          <div className="grid gap-3">
            {c.faq.map(f => (
              <details key={f.q} className="rounded-lg border border-q-border-subtle bg-q-background-secondary p-4">
                <summary className="cursor-pointer list-none text-q-label-lg-semi-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                </summary>
                <p className="mt-2 text-q-body-md-regular text-q-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">More comparisons</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {others.map(o => (
              <li key={o.slug}>
                <Link
                  to="/vs/$slug"
                  params={{ slug: o.slug }}
                  className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary"
                >
                  {SITE.shortName} vs {o.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/best/$slug" params={{ slug: 'higgsfield-alternative' }} className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary">
                Best Higgsfield alternatives
              </Link>
            </li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/studio">
            <Button variant="marketingSecondary">Try {SITE.shortName} free</Button>
          </Link>
          <Link to="/pricing">
            <Button variant="tertiary">See pricing</Button>
          </Link>
        </div>

        <CtaBand
          title={`The two-minute ${c.name} comparison`}
          body="Take the prompt you last ran there and run it here — same shot, live cost preview, and a share page when it lands."
          to="/studio"
          cta="Run the test shot"
        />
      </article>
    </PublicPage>
  )
}
