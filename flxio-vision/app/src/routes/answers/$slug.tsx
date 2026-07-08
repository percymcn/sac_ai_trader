import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { Prose } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode, faqNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { ANSWERS, ANSWER_CLUSTERS, getAnswer } from '../../data/answers'

export const Route = createFileRoute('/answers/$slug')({
  loader: ({ params }) => {
    if (!getAnswer(params.slug)) throw notFound()
    return { slug: params.slug }
  },
  head: ({ params }) => {
    const a = getAnswer(params.slug)
    if (!a) return { meta: [{ title: pageTitle('Answers') }] }
    return buildHead({
      title: pageTitle(a.question.length > 48 ? a.question.slice(0, 48).replace(/\s+\S*$/, '…') : a.question),
      description: a.answer.slice(0, 158),
      path: `/answers/${a.slug}`,
    })
  },
  component: AnswerPage,
})

function AnswerPage() {
  const { slug } = Route.useLoaderData() as { slug: string }
  const a = getAnswer(slug)!
  const cluster = ANSWER_CLUSTERS.find(c => c.id === a.cluster)
  const siblings = ANSWERS.filter(x => x.cluster === a.cluster && x.slug !== a.slug).slice(0, 5)

  const schema = graph(
    orgGraph(),
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Answers', path: '/answers' },
      { name: a.question, path: `/answers/${a.slug}` },
    ]),
    faqNode([{ q: a.question, a: a.answer }]),
  )

  return (
    <PublicPage>
      <StructuredData json={schema} />
      <article className="mx-auto grid w-full max-w-3xl gap-6">
        <header className="grid gap-3">
          <p className="text-q-caption-sm-medium uppercase tracking-wide text-q-text-tertiary">
            <Link to="/answers" className="hover:text-q-text-secondary">Answers</Link> / {cluster?.label ?? a.cluster}
          </p>
          <h1 className="text-q-headline-sm-semi-bold">{a.question}</h1>
        </header>

        <div className="rounded-lg border border-q-border-primary bg-q-background-secondary p-5">
          <p className="text-q-body-md-regular leading-relaxed text-q-text-primary">{a.answer}</p>
        </div>

        <Prose text={a.detail} />

        <section className="grid gap-2">
          <h2 className="text-q-title-sm-semi-bold">Related</h2>
          <ul className="grid gap-2">
            {a.related.map(path => (
              <li key={path}>
                <Link to={path} className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary">
                  {labelFor(path)}
                </Link>
              </li>
            ))}
            {siblings.map(s => (
              <li key={s.slug}>
                <Link
                  to="/answers/$slug"
                  params={{ slug: s.slug }}
                  className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary"
                >
                  {s.question}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-6 text-center">
          <h2 className="text-q-title-md-semi-bold">See it for yourself</h2>
          <p className="mx-auto max-w-xl text-q-body-md-regular text-q-text-secondary">
            The studio is free — every engine, 20 director presets, and the exact credit cost shown
            before each shot.
          </p>
          <div className="flex justify-center">
            <Link to="/studio">
              <Button variant="marketingSecondary">Open the studio</Button>
            </Link>
          </div>
        </section>
      </article>
    </PublicPage>
  )
}

function labelFor(path: string): string {
  const known: Record<string, string> = {
    '/studio': 'The studio',
    '/presets': 'Director presets',
    '/pricing': 'Pricing',
    '/explore': 'Explore gallery',
    '/boards': 'Boards',
    '/models': 'Model guides',
    '/vs': 'All comparisons',
    '/about': 'About FlxioAI Vision',
    '/use-cases/marketing-agencies': 'AI video for agencies',
    '/use-cases/ecommerce-product-video': 'AI product videos',
    '/use-cases/filmmakers-previz': 'AI previz for filmmakers',
    '/use-cases/social-media-managers': 'AI for social teams',
    '/use-cases/music-artists': 'AI visuals for musicians',
    '/use-cases/youtube-creators': 'AI for YouTube creators',
  }
  if (known[path]) return known[path]
  const last = path.split('/').filter(Boolean).pop() ?? path
  return last.replaceAll('-', ' ').replace(/^\w/, ch => ch.toUpperCase())
}
