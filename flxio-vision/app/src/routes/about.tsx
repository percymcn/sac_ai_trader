import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicPage } from '../components/public-page'
import { StructuredData } from '../components/structured-data'
import { CtaBand, PageIntro } from '../components/marketing'
import { buildHead, graph, orgGraph, softwareAppNode, breadcrumbNode } from '../lib/seo'
import { pageTitle, SITE } from '../data/site'

const SCHEMA = graph(
  orgGraph(),
  softwareAppNode(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]),
)

export const Route = createFileRoute('/about')({
  head: () =>
    buildHead({
      title: pageTitle('About'),
      description:
        'FlxioAI Vision is a cinematic AI studio built on three principles: transparent costs, teachable craft, and results that are made to be shared.',
      path: '/about',
    }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="mx-auto grid w-full max-w-3xl gap-10">
        <PageIntro
          eyebrow="About"
          title={`Why ${SITE.name} exists`}
          lede="AI generation platforms got the models right and the product wrong. We built the studio we wanted to use."
        />

        <section className="grid gap-4">
          <h2 className="text-q-title-md-semi-bold">Three principles</h2>
          <div className="grid gap-4">
            <div className="grid gap-1 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
              <h3 className="text-q-title-sm-semi-bold">1. Transparent costs</h3>
              <p className="text-q-body-md-regular text-q-text-secondary">
                The industry norm is learning what a shot costs by paying for it. We think that is a dark
                pattern, not a pricing model. Every generation in {SITE.name} shows its exact credit cost
                before you run it — in the button you press. Plans gate workflow power, never model
                access, and there are no expiring credit packs.
              </p>
            </div>
            <div className="grid gap-1 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
              <h3 className="text-q-title-sm-semi-bold">2. Teachable craft</h3>
              <p className="text-q-body-md-regular text-q-text-secondary">
                Black-box effect buttons produce results you can’t reproduce or grow from. Our director
                presets are transparent recipes — you can read the exact prompt pattern behind every
                camera move and film look, edit it, and learn cinematography vocabulary while you create.
                Remix carries that craft across your whole body of work.
              </p>
            </div>
            <div className="grid gap-1 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
              <h3 className="text-q-title-sm-semi-bold">3. Made to be shared</h3>
              <p className="text-q-body-md-regular text-q-text-secondary">
                Work trapped in a private history builds nothing. Every result can become a permanent,
                beautiful public page with one-tap sharing and a remix button — so your best shots
                recruit your audience for you, and viewers become creators.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-q-title-md-semi-bold">What {SITE.name} is</h2>
          <p className="text-q-body-md-regular text-q-text-secondary">
            A cinematic AI studio over nine frontier engines — Seedance 2.0, Kling 3.0, Veo 3.1 Lite,
            Wan 2.7, Grok Imagine for video; GPT Image 2, Nano Banana 2, Seedream 4.5, Soul V2 for
            images — with 36 director presets, live cost previews, boards, batch mode, remix, and a
            community gallery. It runs entirely in the browser, renders on the edge, and starts free.
          </p>
          <p className="text-q-body-md-regular text-q-text-secondary">
            Compare us honestly against anything on the{' '}
            <Link to="/vs" className="text-q-text-primary underline underline-offset-4">versus pages</Link>, read the{' '}
            <Link to="/blog" className="text-q-text-primary underline underline-offset-4">blog</Link> for the craft, or just{' '}
            <Link to="/studio" className="text-q-text-primary underline underline-offset-4">open the studio</Link> — the product is the pitch.
          </p>
        </section>

        <CtaBand
          title="The product is the pitch"
          body="One preset, one line, one shot — see whether we live up to this page."
          to="/studio"
          cta="Open the studio"
        />
      </div>
    </PublicPage>
  )
}
