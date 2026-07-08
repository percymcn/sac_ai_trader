// Billing: full Stripe flow when secrets are configured; otherwise a real,
// clearly-labeled test-mode flow (upgrades persist in D1, no card) so the
// entire upgrade/manage/cancel loop works end-to-end before go-live.
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireCurrentUser } from '../auth.server'
import { getDb } from '../db.server'
import { getOrCreateProfile, setUserPlan } from '../profile.server'
import { getPlan, PLANS, type PlanId } from '../../data/plans'
import { createBillingPortalSession, createCheckoutSession, stripeEnabled } from '../stripe.server'
import { SITE } from '../../data/site'

const planIdSchema = z.enum(['pro', 'studio'])
const intervalSchema = z.enum(['monthly', 'annual'])

export const getBillingState = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = await requireCurrentUser()
  if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
  const profile = await getOrCreateProfile(auth.user.id)
  const plan = getPlan(profile.plan)
  return {
    ok: true as const,
    plan: plan.id,
    planName: plan.name,
    interval: profile.billing_interval,
    mode: profile.billing_mode,
    renewsAt: profile.plan_renews_at,
    stripeEnabled: stripeEnabled(),
    limits: plan.limits,
    plans: PLANS.map(p => ({ id: p.id, name: p.name, monthlyUsd: p.monthlyUsd, annualUsd: p.annualUsd })),
  }
})

export const startUpgrade = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ plan: planIdSchema, interval: intervalSchema }))
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    const profile = await getOrCreateProfile(auth.user.id)

    if (stripeEnabled()) {
      try {
        const session = await createCheckoutSession({
          userId: auth.user.id,
          customerId: profile.stripe_customer_id,
          plan: data.plan,
          interval: data.interval,
          successUrl: `${SITE.url}/billing?status=success`,
          cancelUrl: `${SITE.url}/pricing?status=cancelled`,
        })
        return { ok: true as const, mode: 'stripe' as const, checkoutUrl: session.url }
      } catch (error) {
        console.info('[billing] stripe checkout failed', { message: (error as Error).message })
        return { ok: false as const, code: 'stripe_error' as const }
      }
    }

    // Test mode: apply the plan immediately, recorded as a test subscription.
    const renewsAt = new Date(
      Date.now() + (data.interval === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000,
    ).toISOString()
    await setUserPlan(auth.user.id, data.plan, {
      interval: data.interval,
      mode: 'test',
      renewsAt,
    })
    await logBillingEvent(auth.user.id, 'test_upgrade', { plan: data.plan, interval: data.interval })
    return { ok: true as const, mode: 'test' as const, plan: data.plan }
  })

export const cancelSubscription = createServerFn({ method: 'POST' }).handler(async () => {
  const auth = await requireCurrentUser()
  if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
  const profile = await getOrCreateProfile(auth.user.id)

  if (profile.billing_mode === 'stripe' && stripeEnabled() && profile.stripe_customer_id) {
    // Stripe subscriptions are managed via the billing portal.
    try {
      const portal = await createBillingPortalSession(profile.stripe_customer_id, `${SITE.url}/billing`)
      return { ok: true as const, mode: 'stripe' as const, portalUrl: portal.url }
    } catch (error) {
      console.info('[billing] portal failed', { message: (error as Error).message })
      return { ok: false as const, code: 'stripe_error' as const }
    }
  }

  await setUserPlan(auth.user.id, 'free', { interval: null, mode: null, renewsAt: null })
  await logBillingEvent(auth.user.id, 'test_cancel', {})
  return { ok: true as const, mode: 'test' as const }
})

export const openBillingPortal = createServerFn({ method: 'POST' }).handler(async () => {
  const auth = await requireCurrentUser()
  if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
  const profile = await getOrCreateProfile(auth.user.id)
  if (!stripeEnabled() || !profile.stripe_customer_id) {
    return { ok: false as const, code: 'portal_unavailable' as const }
  }
  try {
    const portal = await createBillingPortalSession(profile.stripe_customer_id, `${SITE.url}/billing`)
    return { ok: true as const, portalUrl: portal.url }
  } catch (error) {
    console.info('[billing] portal failed', { message: (error as Error).message })
    return { ok: false as const, code: 'stripe_error' as const }
  }
})

async function logBillingEvent(userId: string | null, kind: string, payload: Record<string, unknown>) {
  try {
    const db = getDb()
    await db
      .prepare('INSERT INTO billing_events (id, user_id, kind, payload_json, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, kind, JSON.stringify(payload), new Date().toISOString())
      .run()
  } catch (error) {
    console.info('[billing] event log failed', { message: (error as Error).message })
  }
}

export type { PlanId }
