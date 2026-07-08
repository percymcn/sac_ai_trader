// Pricing — plans, upgrade flow, transparent compute costs, FAQ.
import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { Segmented } from '../components/field-controls'
import { Loader } from '@higgsfield/quanta/loader'
import { toast } from '@higgsfield/quanta/sonner'
import CheckIcon from '@material-symbols/svg-400/outlined/check.svg?react'
import { PublicPage } from '../components/public-page'
import { StructuredData } from '../components/structured-data'
import { FaqBlock } from '../components/faq-block'
import { CtaBand } from '../components/marketing'
import { login, useCurrentUser } from '../components/use-current-user'
import { buildHead, graph, orgGraph, softwareAppNode, faqNode, breadcrumbNode } from '../lib/seo'
import { pageTitle, SITE } from '../data/site'
import { PLANS, ANNUAL_SAVINGS, type PlanId } from '../data/plans'
import { PRICING_FAQ } from '../data/faqs'
import { MODELS } from '../data/models'
import { startUpgrade } from '../lib/api/billing.functions'

const SCHEMA = graph(
  orgGraph(),
  softwareAppNode(),
  faqNode(PRICING_FAQ),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
  ]),
)

export const Route = createFileRoute('/pricing')({
  head: () =>
    buildHead({
      title: pageTitle('Pricing'),
      description:
        'FlxioAI Vision pricing: a genuinely useful Free plan, Pro at $12/mo, Studio at $29/mo. Every engine on every plan, live per-shot cost preview, no expiring credit packs.',
      path: '/pricing',
    }),
  component: PricingPage,
})

function PricingPage() {
  const { state: authState } = useCurrentUser()
  const navigate = useNavigate()
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual')
  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null)

  const upgrade = async (plan: PlanId) => {
    if (plan === 'free') {
      void navigate({ to: '/studio' })
      return
    }
    if (authState !== 'signed-in') {
      login('/pricing')
      return
    }
    setBusyPlan(plan)
    try {
      const res = await startUpgrade({ data: { plan, interval } })
      if (!res.ok) {
        toast.error('Upgrade failed — try again')
        return
      }
      if (res.mode === 'stripe' && 'checkoutUrl' in res) {
        window.location.href = res.checkoutUrl
        return
      }
      toast.success(`You're on ${plan === 'pro' ? 'Pro' : 'Studio'} (test mode — no card charged)`)
      void navigate({ to: '/billing' })
    } finally {
      setBusyPlan(null)
    }
  }

  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-12">
        <header className="grid max-w-3xl gap-3">
          <h1 className="text-q-headline-md-semi-bold">Pricing without the credit anxiety</h1>
          <p className="text-q-body-md-regular text-q-text-secondary">
            Every engine is available on every plan — including Free. Plans gate workflow power (batch
            size, presets, boards), and generation compute is billed per shot with the exact cost shown
            before you run it. No expiring packs. No model paywalls.
          </p>
        </header>

        <div className="grid gap-6">
          <div className="flex items-center gap-3">
            <Segmented
              ariaLabel="Billing interval"
              value={interval}
              onChange={v => setInterval(v as 'monthly' | 'annual')}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'annual', label: `Annual · save ~${ANNUAL_SAVINGS.pro}%` },
              ]}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {PLANS.map(plan => {
              const price = interval === 'annual' && plan.annualUsd > 0 ? plan.annualUsd / 12 : plan.monthlyUsd
              return (
                <div
                  key={plan.id}
                  className={`grid content-start gap-4 rounded-lg border p-5 ${
                    plan.highlight
                      ? 'border-q-border-primary bg-q-background-secondary'
                      : 'border-q-border-subtle bg-q-background-secondary'
                  }`}
                >
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-q-title-md-semi-bold">{plan.name}</h2>
                      {plan.highlight ? (
                        <span className="rounded-full border border-q-border-primary px-2 py-0.5 text-q-caption-sm-medium text-q-text-primary">
                          Most popular
                        </span>
                      ) : null}
                    </div>
                    <p className="text-q-body-sm-regular text-q-text-secondary">{plan.blurb}</p>
                  </div>
                  <p className="text-q-display-md-bold tabular-nums">
                    {plan.monthlyUsd === 0 ? 'Free' : `$${price % 1 === 0 ? price : price.toFixed(2)}`}
                    {plan.monthlyUsd > 0 ? (
                      <span className="text-q-body-sm-regular text-q-text-tertiary"> /mo</span>
                    ) : null}
                  </p>
                  {plan.monthlyUsd > 0 && interval === 'annual' ? (
                    <p className="text-q-caption-sm-medium text-q-text-tertiary">
                      billed ${plan.annualUsd}/year
                    </p>
                  ) : null}
                  <ul className="grid gap-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-q-body-sm-regular text-q-text-secondary">
                        <CheckIcon width={16} height={16} aria-hidden className="mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.highlight ? 'marketingSecondary' : 'tertiary'}
                    disabled={busyPlan !== null}
                    onClick={() => void upgrade(plan.id)}
                  >
                    {busyPlan === plan.id ? <Loader size="xs" color="neutral" /> : plan.cta}
                  </Button>
                </div>
              )
            })}
          </div>
          <p className="text-q-caption-sm-medium text-q-text-tertiary">
            Payments run in Stripe test mode until launch keys are added — upgrades work end to end
            today with no card required, and the same flow switches to live billing at launch. Manage or
            cancel anytime on the <Link to="/billing" className="underline underline-offset-4">Billing page</Link>.
          </p>
        </div>

        <section className="grid gap-4">
          <h2 className="text-q-title-md-semi-bold">What generation compute costs</h2>
          <p className="max-w-3xl text-q-body-md-regular text-q-text-secondary">
            Shots are billed in credits on your connected account, and the composer shows the exact
            cost of every configuration before you confirm it. Rules of thumb across engines:
          </p>
          <div className="overflow-x-auto rounded-lg border border-q-border-subtle">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-q-border-subtle bg-q-background-secondary">
                  <th className="p-3 text-q-label-lg-semi-bold">Engine</th>
                  <th className="p-3 text-q-label-lg-semi-bold">Type</th>
                  <th className="p-3 text-q-label-lg-semi-bold">Speed</th>
                  <th className="p-3 text-q-label-lg-semi-bold">Relative cost</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map(m => (
                  <tr key={m.id} className="border-b border-q-border-subtle last:border-0">
                    <td className="p-3 text-q-body-sm-regular text-q-text-primary">
                      <Link to="/models/$slug" params={{ slug: m.slug }} className="hover:underline">
                        {m.name}
                      </Link>
                    </td>
                    <td className="p-3 text-q-body-sm-regular text-q-text-secondary">{m.kind}</td>
                    <td className="p-3 text-q-body-sm-regular text-q-text-secondary">{m.speed}</td>
                    <td className="p-3 text-q-body-sm-regular text-q-text-secondary">
                      {m.speed === 'fast' ? '$ — draft-friendly' : m.speed === 'balanced' ? '$$ — everyday' : '$$$ — premium finals'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-q-caption-sm-medium text-q-text-tertiary">
            Exact per-shot costs depend on duration and resolution — always shown live in the generate
            button.
          </p>
        </section>

        <FaqBlock items={PRICING_FAQ} title="Pricing FAQ" />

        <CtaBand
          title={`Start free. Stay because it's better.`}
          body={`The Free plan is a real plan — full studio, every engine, 20 director presets. Upgrade only when batch mode and the full preset library start paying for themselves.`}
          to="/studio"
          cta="Open the studio"
        />
      </div>
    </PublicPage>
  )
}
