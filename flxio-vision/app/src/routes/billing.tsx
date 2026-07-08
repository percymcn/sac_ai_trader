// Billing — current plan, upgrade/downgrade, portal, cancel.
import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { Modal } from '@higgsfield/quanta/modal'
import { Loader } from '@higgsfield/quanta/loader'
import { toast } from '@higgsfield/quanta/sonner'
import { PublicPage } from '../components/public-page'
import { login, useCurrentUser } from '../components/use-current-user'
import { buildHead } from '../lib/seo'
import { pageTitle } from '../data/site'
import {
  cancelSubscription,
  getBillingState,
  openBillingPortal,
} from '../lib/api/billing.functions'

export const Route = createFileRoute('/billing')({
  head: () =>
    buildHead({
      title: pageTitle('Billing'),
      description: 'Manage your FlxioAI Vision subscription.',
      path: '/billing',
      noindex: true,
    }),
  component: BillingPage,
})

interface BillingView {
  plan: string
  planName: string
  interval: string | null
  mode: string | null
  renewsAt: string | null
  stripeEnabled: boolean
}

function BillingPage() {
  const { state: authState } = useCurrentUser()
  const [view, setView] = useState<BillingView | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const res = await getBillingState()
      if (res.ok) {
        setView({
          plan: res.plan,
          planName: res.planName,
          interval: res.interval,
          mode: res.mode,
          renewsAt: res.renewsAt,
          stripeEnabled: res.stripeEnabled,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authState === 'signed-in') void load()
    if (authState === 'signed-out') setLoading(false)
  }, [authState])

  const cancel = async () => {
    setBusy(true)
    try {
      const res = await cancelSubscription()
      if (!res.ok) {
        toast.error('Could not cancel — try again')
        return
      }
      if (res.mode === 'stripe' && 'portalUrl' in res) {
        window.location.href = res.portalUrl
        return
      }
      toast.success('Subscription cancelled — you are on Free')
      setConfirmCancel(false)
      await load()
    } finally {
      setBusy(false)
    }
  }

  const portal = async () => {
    setBusy(true)
    try {
      const res = await openBillingPortal()
      if (res.ok) {
        window.location.href = res.portalUrl
      } else {
        toast.error('The billing portal opens once Stripe live keys are configured')
      }
    } finally {
      setBusy(false)
    }
  }

  if (authState === 'signed-out') {
    return (
      <PublicPage>
        <div className="grid min-h-60 place-items-center rounded-lg border border-q-border-subtle bg-q-background-secondary p-6 text-center">
          <div className="grid max-w-sm gap-3">
            <h1 className="text-q-title-md-semi-bold">Sign in to manage billing</h1>
            <div>
              <Button onClick={() => login('/billing')}>Sign in</Button>
            </div>
          </div>
        </div>
      </PublicPage>
    )
  }

  return (
    <PublicPage>
      <div className="mx-auto grid w-full max-w-3xl gap-6">
        <h1 className="text-q-headline-sm-semi-bold">Billing</h1>

        {loading || !view ? (
          <div className="grid place-items-center rounded-lg border border-q-border-subtle bg-q-background-secondary p-10">
            <Loader variant="stars" />
          </div>
        ) : (
          <>
            <section className="grid gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
              <h2 className="text-q-label-lg-semi-bold">Current plan</h2>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-q-display-md-bold">{view.planName}</p>
                {view.plan !== 'free' ? (
                  <p className="text-q-body-sm-regular text-q-text-secondary">
                    {view.interval === 'annual' ? 'Annual' : 'Monthly'} ·{' '}
                    {view.mode === 'test' ? 'test mode (no card on file)' : 'Stripe'}
                    {view.renewsAt ? ` · renews ${new Date(view.renewsAt).toLocaleDateString()}` : ''}
                  </p>
                ) : (
                  <p className="text-q-body-sm-regular text-q-text-secondary">
                    Free forever · every engine included
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {view.plan === 'free' ? (
                  <Link to="/pricing">
                    <Button variant="marketingSecondary" size="sm">
                      Upgrade
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/pricing">
                      <Button variant="tertiary" size="sm">
                        Change plan
                      </Button>
                    </Link>
                    {view.mode === 'stripe' ? (
                      <Button variant="tertiary" size="sm" disabled={busy} onClick={() => void portal()}>
                        Open billing portal
                      </Button>
                    ) : null}
                    <Button variant="dangerSoft" size="sm" onClick={() => setConfirmCancel(true)}>
                      Cancel subscription
                    </Button>
                  </>
                )}
              </div>
            </section>

            <section className="grid gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">
              <h2 className="text-q-label-lg-semi-bold">How billing works</h2>
              <ul className="grid list-disc gap-1 pl-5 text-q-body-sm-regular text-q-text-secondary">
                <li>Plans gate workflow features (batch, presets, boards) — never model access.</li>
                <li>Generation compute is billed per shot on your connected account, with the cost shown before every run.</li>
                <li>
                  {view.stripeEnabled
                    ? 'Payments are processed by Stripe; use the billing portal to manage cards and invoices.'
                    : 'Payments are in test mode — upgrades work without a card, and switch to live Stripe billing when launch keys are configured.'}
                </li>
                <li>Cancelling drops you to Free at once (test mode) or at period end (Stripe).</li>
              </ul>
            </section>
          </>
        )}
      </div>

      <Modal.Root open={confirmCancel} onOpenChange={setConfirmCancel}>
        <Modal.Content>
          <Modal.Header title="Cancel subscription?" />
          <Modal.Body>
        <div className="grid gap-4">
          <p className="text-q-body-sm-regular text-q-text-secondary">
            You’ll keep Free-plan access to the full studio and every engine. Batch mode, the full
            preset library, and unlimited boards will lock.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="tertiary" onClick={() => setConfirmCancel(false)}>
              Keep my plan
            </Button>
            <Button variant="danger" disabled={busy} onClick={() => void cancel()}>
              {busy ? <Loader size="xs" color="neutral" /> : 'Cancel subscription'}
            </Button>
          </div>
        </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </PublicPage>
  )
}
