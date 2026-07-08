import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode, faqNode } from '../../lib/seo'
import { pageTitle, absUrl } from '../../data/site'
import { CATEGORY_PAGES, getCategoryPage } from '../../data/categories'

export const Route = createFileRoute('/best/$slug')({
  loader: ({ params }) => {
    if (!getCategoryPage(params.slug)) throw notFound()
    return { slug: params.slug }
  },
  head: ({ params }) => {
    const page = getCategoryPage(params.slug)
    if (!page) return { meta: [{ title: pageTitle('Best tools') }] }
    return buildHead({
      title: pageTitle(page.metaTitle),
      description: page.description,
      path: `/best/${page.slug}`,
    })
  },
  component: CategoryPageComponent,
})

function CategoryPageComponent() {
  const { slug } = Route.useLoaderData() as { slug: string }
  const page = getCategoryPage(slug)!
  const others = CATEGORY_PAGES.filter(c => c.slug !== page.slug)

  const schema = graph(
    orgGraph(),
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: page.metaTitle, path: `/best/${page.slug}` },
    ]),
    faqNode(page.faq),
    {
      '@type': 'ItemList',
      name: page.title,
      itemListElement: page.ranked.map((r, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: r.name,
        url: r.to ? absUrl(r.to) : undefined,
      })),
    },
  )

  return (
    <PublicPage>
      <StructuredData json={schema} />
      <article className="mx-auto grid w-full max-w-4xl gap-8">
        <header className="grid gap-3">
          <h1 className="text-q-headline-md-semi-bold">{page.title}</h1>
          {page.intro.map(p => (
            <p key={p.slice(0, 24)} className="max-w-3xl text-q-body-md-regular text-q-text-secondary">
              {p}
            </p>
          ))}
        </header>

        <section className="grid gap-4">
          <h2 className="text-q-title-md-semi-bold">The ranking</h2>
          <ol className="grid gap-3">
            {page.ranked.map((r, i) => (
              <li
                key={r.name}
                className="grid gap-1 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-q-title-sm-semi-bold text-q-text-tertiary tabular-nums">{i + 1}.</span>
                  {r.to ? (
                    <Link to={r.to} className="text-q-title-sm-semi-bold text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary">
                      {r.name}
                    </Link>
                  ) : (
                    <span className="text-q-title-sm-semi-bold text-q-text-primary">{r.name}</span>
                  )}
                </div>
                <p className="text-q-body-sm-regular text-q-text-secondary">{r.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
          <h2 className="text-q-title-sm-semi-bold">The verdict</h2>
          <p className="text-q-body-md-regular text-q-text-secondary">{page.verdict}</p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">Frequently asked questions</h2>
          <div className="grid gap-3">
            {page.faq.map(f => (
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
          <h2 className="text-q-title-md-semi-bold">More rankings</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {others.map(o => (
              <li key={o.slug}>
                <Link
                  to="/best/$slug"
                  params={{ slug: o.slug }}
                  className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary"
                >
                  {o.metaTitle}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/studio">
            <Button variant="marketingSecondary">Try the #1 pick free</Button>
          </Link>
          <Link to="/vs">
            <Button variant="tertiary">All head-to-heads</Button>
          </Link>
        </div>

        <CtaBand
          title="Rankings are opinions. Prompts are proof."
          body="Run your own three-prompt shootout on the Free plan and let the output decide."
          to="/studio"
          cta="Open the studio"
        />
      </article>
    </PublicPage>
  )
}
