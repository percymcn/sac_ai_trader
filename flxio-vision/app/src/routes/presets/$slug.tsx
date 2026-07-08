import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { CtaBand } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode, faqNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { PRESETS, PRESET_CATEGORIES, applyPreset, getPreset } from '../../data/presets'
import { getModel } from '../../data/models'

export const Route = createFileRoute('/presets/$slug')({
  loader: ({ params }) => {
    const preset = getPreset(params.slug)
    if (!preset) throw notFound()
    return { slug: params.slug }
  },
  head: ({ params }) => {
    const preset = getPreset(params.slug)
    if (!preset) return { meta: [{ title: pageTitle('Preset') }] }
    return buildHead({
      title: pageTitle(`${preset.name} — AI ${preset.kind} preset`),
      description: `${preset.description} A transparent AI ${preset.kind} recipe: prompt template, recommended engine, tuned settings. Use it free in FlxioAI Vision.`,
      path: `/presets/${preset.slug}`,
    })
  },
  component: PresetDetailPage,
})

function PresetDetailPage() {
  const { slug } = Route.useLoaderData() as { slug: string }
  const preset = getPreset(slug)!
  const model = getModel(preset.modelId)
  const category = PRESET_CATEGORIES.find(c => c.id === preset.category)
  const siblings = PRESETS.filter(p => p.category === preset.category && p.slug !== preset.slug).slice(0, 3)

  const faq = [
    {
      q: `Is the ${preset.name} preset free?`,
      a: preset.core
        ? `Yes — ${preset.name} is one of the 20 core presets included on the Free plan.`
        : `${preset.name} is part of the full preset library, which unlocks on the Pro plan ($12/mo). The 20 core presets are free.`,
    },
    {
      q: `Which engine does ${preset.name} use?`,
      a: `${preset.name} defaults to ${model?.name ?? preset.modelId} (${model?.strengths ?? ''}) — you can switch engines in the composer and keep the recipe.`,
    },
    {
      q: `Can I edit the ${preset.name} recipe?`,
      a: 'Yes. Every preset is a transparent prompt template — the composer shows the assembled prompt before you generate, and remix lets you tweak any part of it.',
    },
  ]

  const schema = graph(
    orgGraph(),
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Presets', path: '/presets' },
      { name: preset.name, path: `/presets/${preset.slug}` },
    ]),
    faqNode(faq),
  )

  return (
    <PublicPage>
      <StructuredData json={schema} />
      <article className="mx-auto grid w-full max-w-4xl gap-8">
        <header className="grid gap-3">
          <p className="text-q-caption-sm-medium uppercase tracking-wide text-q-text-tertiary">
            <Link to="/presets" className="hover:text-q-text-secondary">Director presets</Link>
            {category ? ` / ${category.label}` : ''}
          </p>
          <h1 className="text-q-headline-md-semi-bold">{preset.name}</h1>
          <p className="max-w-2xl text-q-body-md-regular text-q-text-secondary">{preset.description}</p>
          <div className="flex flex-wrap gap-2 text-q-caption-sm-medium text-q-text-tertiary">
            <span className="rounded-full border border-q-border-subtle px-2 py-0.5">
              {preset.kind === 'video' ? 'Video preset' : 'Image preset'}
            </span>
            <span className="rounded-full border border-q-border-subtle px-2 py-0.5">
              Engine: {model?.name ?? preset.modelId}
            </span>
            <span className="rounded-full border border-q-border-subtle px-2 py-0.5">
              {preset.core ? 'Free plan' : 'Pro'}
            </span>
          </div>
        </header>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">The recipe</h2>
          <p className="rounded-lg border border-q-border-subtle bg-q-background-secondary p-4 text-q-body-md-regular text-q-text-secondary">
            {preset.template}
          </p>
          <p className="text-q-body-sm-regular text-q-text-tertiary">
            The <code className="text-q-mono-sm-regular">{'{subject}'}</code> slot is your one-line
            input. Settings: {Object.entries(preset.settings).map(([k, v]) => `${k}=${v}`).join(' · ')}.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">Worked example</h2>
          <p className="text-q-body-md-regular text-q-text-secondary">
            Subject: <em>{preset.exampleSubject}</em>
          </p>
          <p className="rounded-lg bg-q-background-secondary p-4 text-q-body-sm-regular text-q-text-secondary">
            {applyPreset(preset, preset.exampleSubject)}
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/studio">
            <Button variant="marketingSecondary">Use this preset</Button>
          </Link>
          <Link to="/presets">
            <Button variant="tertiary">All presets</Button>
          </Link>
        </div>

        {siblings.length > 0 ? (
          <section className="grid gap-3">
            <h2 className="text-q-title-md-semi-bold">More {category?.label.toLowerCase() ?? 'presets'}</h2>
            <ul className="grid gap-2 sm:grid-cols-3">
              {siblings.map(s => (
                <li key={s.slug}>
                  <Link
                    to="/presets/$slug"
                    params={{ slug: s.slug }}
                    className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary"
                  >
                    {s.name}
                  </Link>
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

        <CtaBand
          title={`Direct “${preset.exampleSubject.slice(0, 40)}…” yourself`}
          body="Open the studio, pick this preset, and swap in your own subject — the cost shows before you run it."
          to="/studio"
          cta="Open the studio"
        />
      </article>
    </PublicPage>
  )
}
