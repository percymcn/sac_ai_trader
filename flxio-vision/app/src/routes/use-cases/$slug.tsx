import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import CheckIcon from '@material-symbols/svg-400/outlined/check.svg?react'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode, faqNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { getUseCase, USE_CASES } from '../../data/use-cases'
import { getPreset } from '../../data/presets'

export const Route = createFileRoute('/use-cases/$slug')({
  loader: ({ params }) => {
    if (!getUseCase(params.slug)) throw notFound()
    return { slug: params.slug }
  },
  head: ({ params }) => {
    const uc = getUseCase(params.slug)
    if (!uc) return { meta: [{ title: pageTitle('Use case') }] }
    return buildHead({
      title: pageTitle(uc.title),
      description: `${uc.headline}. ${uc.intro.slice(0, 110)}`,
      path: `/use-cases/${uc.slug}`,
    })
  },
  component: UseCaseDetailPage,
})

function UseCaseDetailPage() {
  const { slug } = Route.useLoaderData() as { slug: string }
  const uc = getUseCase(slug)!
  const presets = uc.presetSlugs.map(getPreset).filter(Boolean)
  const others = USE_CASES.filter(u => u.slug !== uc.slug).slice(0, 4)

  const schema = graph(
    orgGraph(),
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Use cases', path: '/use-cases' },
      { name: uc.title, path: `/use-cases/${uc.slug}` },
    ]),
    faqNode(uc.faq),
  )

  return (
    <PublicPage>
      <StructuredData json={schema} />
      <article className="mx-auto grid w-full max-w-4xl gap-8">
        <header className="grid gap-3">
          <p className="text-q-caption-sm-medium uppercase tracking-wide text-q-text-tertiary">
            <Link to="/use-cases" className="hover:text-q-text-secondary">Use cases</Link> / {uc.audience}
          </p>
          <h1 className="text-q-headline-md-semi-bold">{uc.title}</h1>
          <p className="text-q-title-sm-semi-bold text-q-text-secondary">{uc.headline}</p>
          <p className="max-w-2xl text-q-body-md-regular text-q-text-secondary">{uc.intro}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="grid content-start gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
            <h2 className="text-q-title-sm-semi-bold">The problem today</h2>
            <ul className="grid gap-2">
              {uc.pains.map(p => (
                <li key={p} className="text-q-body-sm-regular text-q-text-secondary">
                  — {p}
                </li>
              ))}
            </ul>
          </section>
          <section className="grid content-start gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
            <h2 className="text-q-title-sm-semi-bold">With {`FlxioAI Vision`}</h2>
            <ul className="grid gap-2">
              {uc.wins.map(w => (
                <li key={w} className="flex items-start gap-2 text-q-body-sm-regular text-q-text-secondary">
                  <CheckIcon width={16} height={16} aria-hidden className="mt-0.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {presets.length > 0 ? (
          <section className="grid gap-3">
            <h2 className="text-q-title-md-semi-bold">The presets for this job</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {presets.map(p => (
                <Link
                  key={p!.slug}
                  to="/presets/$slug"
                  params={{ slug: p!.slug }}
                  className="grid gap-1 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4 hover:border-q-border-primary"
                >
                  <span className="text-q-label-lg-semi-bold text-q-text-primary">{p!.name}</span>
                  <span className="text-q-body-sm-regular text-q-text-secondary">{p!.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">Frequently asked questions</h2>
          <div className="grid gap-3">
            {uc.faq.map(f => (
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
          <h2 className="text-q-title-md-semi-bold">Other workflows</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {others.map(o => (
              <li key={o.slug}>
                <Link
                  to="/use-cases/$slug"
                  params={{ slug: o.slug }}
                  className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary"
                >
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/studio">
            <Button variant="marketingSecondary">Start this workflow</Button>
          </Link>
          <Link to="/pricing">
            <Button variant="tertiary">See pricing</Button>
          </Link>
        </div>

        <CtaBand
          title="Run the first shot now"
          body="The Free plan covers the whole workflow — presets, cost previews, boards, and share pages included."
          to="/studio"
          cta="Open the studio"
        />
      </article>
    </PublicPage>
  )
}
