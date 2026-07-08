import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand, PageIntro } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { ANSWERS, ANSWER_CLUSTERS } from '../../data/answers'

const SCHEMA = graph(
  orgGraph(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Answers', path: '/answers' },
  ]),
)

export const Route = createFileRoute('/answers/')({
  head: () =>
    buildHead({
      title: pageTitle('AI Video Answers Hub'),
      description:
        'Direct answers to every AI video and image generation question: credits, costs, model choice, prompt craft, commercial rights, and tool comparisons.',
      path: '/answers',
    }),
  component: AnswersIndexPage,
})

function AnswersIndexPage() {
  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-10">
        <PageIntro
          eyebrow="Answers"
          title="Every AI video question, answered directly"
          lede="No fluff — each page leads with the answer, then the detail. Grouped by topic so you can binge a cluster."
        />
        {ANSWER_CLUSTERS.map(cluster => {
          const items = ANSWERS.filter(a => a.cluster === cluster.id)
          return (
            <section key={cluster.id} className="grid gap-3">
              <h2 className="text-q-title-md-semi-bold">{cluster.label}</h2>
              <ul className="grid gap-2 md:grid-cols-2">
                {items.map(a => (
                  <li key={a.slug}>
                    <Link
                      to="/answers/$slug"
                      params={{ slug: a.slug }}
                      className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary"
                    >
                      {a.question}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
        <CtaBand
          title="The best answer is a generated shot"
          body="Most questions here end the same way: try it, with the cost shown first. The studio is free."
          to="/studio"
          cta="Open the studio"
        />
      </div>
    </PublicPage>
  )
}
