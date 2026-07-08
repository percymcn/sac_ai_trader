import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode, faqNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { MODELS, getModelBySlug } from '../../data/models'
import { PRESETS } from '../../data/presets'

export const Route = createFileRoute('/models/$slug')({
  loader: ({ params }) => {
    if (!getModelBySlug(params.slug)) throw notFound()
    return { slug: params.slug }
  },
  head: ({ params }) => {
    const model = getModelBySlug(params.slug)
    if (!model) return { meta: [{ title: pageTitle('Model') }] }
    return buildHead({
      title: pageTitle(`${model.name} — online, no waitlist`),
      description: `${model.seoBlurb} Use ${model.name} online in FlxioAI Vision with live cost previews, director presets, and remix.`,
      path: `/models/${model.slug}`,
    })
  },
  component: ModelDetailPage,
})

function ModelDetailPage() {
  const { slug } = Route.useLoaderData() as { slug: string }
  const model = getModelBySlug(slug)!
  const presets = PRESETS.filter(p => p.modelId === model.id)
  const siblings = MODELS.filter(m => m.kind === model.kind && m.id !== model.id)

  const faq = [
    {
      q: `How do I use ${model.name} online?`,
      a: `Sign in to FlxioAI Vision, pick ${model.name} in the composer's engine dropdown, and generate — no waitlist, no separate subscription. The Free plan includes it.`,
    },
    {
      q: `What is ${model.name} best at?`,
      a: `${model.strengths} Best for: ${model.bestFor}.`,
    },
    {
      q: `How much does ${model.name} cost per generation?`,
      a: `Cost depends on your settings (resolution${model.kind === 'video' ? ', duration' : ''}, batch). FlxioAI Vision shows the exact credit cost in the generate button before every run.`,
    },
    {
      q: `Can I use ${model.name} output commercially?`,
      a: 'Generally yes, subject to the provider’s content policies. Keep your generation history as a record of your creative direction — boards do this automatically.',
    },
  ]

  const schema = graph(
    orgGraph(),
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Models', path: '/models' },
      { name: model.name, path: `/models/${model.slug}` },
    ]),
    faqNode(faq),
  )

  return (
    <PublicPage>
      <StructuredData json={schema} />
      <article className="mx-auto grid w-full max-w-4xl gap-8">
        <header className="grid gap-3">
          <p className="text-q-caption-sm-medium uppercase tracking-wide text-q-text-tertiary">
            <Link to="/models" className="hover:text-q-text-secondary">Model guides</Link> /{' '}
            {model.kind === 'video' ? 'Video engine' : 'Image engine'}
          </p>
          <h1 className="text-q-headline-md-semi-bold">{model.name}: the practical guide</h1>
          <p className="max-w-2xl text-q-body-md-regular text-q-text-secondary">{model.seoBlurb}</p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">What {model.name} is best at</h2>
          <p className="text-q-body-md-regular text-q-text-secondary">{model.strengths}</p>
          <p className="text-q-body-md-regular text-q-text-secondary">
            Reach for it when the job is: {model.bestFor.toLowerCase()}. Speed class:{' '}
            {model.speed === 'fast'
              ? 'fast — great for drafts and volume.'
              : model.speed === 'balanced'
                ? 'balanced — everyday production work.'
                : 'slower — save it for finals where its strengths matter.'}
            {model.acceptsImageInput ? ' It accepts reference images, so you can anchor generations to real products, characters, or locations.' : ''}
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">Settings that matter</h2>
          <div className="overflow-x-auto rounded-lg border border-q-border-subtle">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-q-border-subtle bg-q-background-secondary">
                  <th className="p-3 text-q-label-lg-semi-bold">Setting</th>
                  <th className="p-3 text-q-label-lg-semi-bold">Options</th>
                  <th className="p-3 text-q-label-lg-semi-bold">Default</th>
                </tr>
              </thead>
              <tbody>
                {model.settings.map(s => (
                  <tr key={s.key} className="border-b border-q-border-subtle last:border-0">
                    <td className="p-3 text-q-body-sm-regular text-q-text-primary">{s.label}</td>
                    <td className="p-3 text-q-body-sm-regular text-q-text-secondary">{s.values.join(', ')}</td>
                    <td className="p-3 text-q-body-sm-regular text-q-text-secondary">{String(s.default)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {presets.length > 0 ? (
          <section className="grid gap-3">
            <h2 className="text-q-title-md-semi-bold">Director presets built on {model.name}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {presets.map(p => (
                <li key={p.slug}>
                  <Link
                    to="/presets/$slug"
                    params={{ slug: p.slug }}
                    className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary"
                  >
                    {p.name}
                  </Link>{' '}
                  <span className="text-q-body-sm-regular text-q-text-tertiary">— {p.description}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {siblings.length > 0 ? (
          <section className="grid gap-3">
            <h2 className="text-q-title-md-semi-bold">When to pick a different engine</h2>
            <ul className="grid gap-2">
              {siblings.map(s => (
                <li key={s.id} className="text-q-body-md-regular text-q-text-secondary">
                  <Link
                    to="/models/$slug"
                    params={{ slug: s.slug }}
                    className="text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary"
                  >
                    {s.name}
                  </Link>{' '}
                  — {s.strengths.toLowerCase()}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">Frequently asked questions</h2>
          <div className="grid gap-3">
            {faq.map(f => (
              <details key={f.q} className="rounded-lg border border-q-border-subtle bg-q-background-secondary p-4">
                <summary className="cursor-pointer list-none text-q-label-lg-semi-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                </summary>
                <p className="mt-2 text-q-body-md-regular text-q-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/studio">
            <Button variant="marketingSecondary">Use {model.name} now</Button>
          </Link>
          <Link to="/models">
            <Button variant="tertiary">All model guides</Button>
          </Link>
        </div>

        <CtaBand
          title={`${model.name} with a cost preview on every shot`}
          body="Free plan, no waitlist — pick the engine, type a prompt, see the price, generate."
          to="/studio"
          cta="Open the studio"
        />
      </article>
    </PublicPage>
  )
}
