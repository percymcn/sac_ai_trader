// Stripe integration via the REST API (no SDK dependency — Workers-safe).
// Activated entirely by website secrets; absent keys => test-mode billing
// (lib/api/billing.functions.ts) keeps the full upgrade flow working.
//
// Secrets (set with the platform's secrets tool, then deploy):
//   STRIPE_SECRET_KEY       sk_test_... or sk_live_...
//   STRIPE_WEBHOOK_SECRET   whsec_...   (endpoint: POST /api/billing/webhook)
//   STRIPE_PRICE_PRO_MONTHLY / STRIPE_PRICE_PRO_ANNUAL
//   STRIPE_PRICE_STUDIO_MONTHLY / STRIPE_PRICE_STUDIO_ANNUAL
import { getSecret } from './db.server'
import type { PlanId } from '../data/plans'

const API = 'https://api.stripe.com/v1'

export function stripeEnabled(): boolean {
  return Boolean(getSecret('STRIPE_SECRET_KEY'))
}

export function priceIdFor(plan: PlanId, interval: 'monthly' | 'annual'): string | undefined {
  if (plan === 'pro') return getSecret(interval === 'monthly' ? 'STRIPE_PRICE_PRO_MONTHLY' : 'STRIPE_PRICE_PRO_ANNUAL')
  if (plan === 'studio') return getSecret(interval === 'monthly' ? 'STRIPE_PRICE_STUDIO_MONTHLY' : 'STRIPE_PRICE_STUDIO_ANNUAL')
  return undefined
}

async function stripeRequest<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = getSecret('STRIPE_SECRET_KEY')
  if (!key) throw new Error('stripe_not_configured')
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  })
  const json = (await res.json()) as T & { error?: { message?: string } }
  if (!res.ok) throw new Error(`stripe_error: ${json.error?.message ?? res.status}`)
  return json
}

export async function createCheckoutSession(opts: {
  userId: string
  customerId?: string | null
  plan: PlanId
  interval: 'monthly' | 'annual'
  successUrl: string
  cancelUrl: string
}): Promise<{ url: string }> {
  const price = priceIdFor(opts.plan, opts.interval)
  if (!price) throw new Error('stripe_price_missing')
  const params: Record<string, string> = {
    mode: 'subscription',
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    client_reference_id: opts.userId,
    'metadata[user_id]': opts.userId,
    'metadata[plan]': opts.plan,
    'metadata[interval]': opts.interval,
    'subscription_data[metadata][user_id]': opts.userId,
    'subscription_data[metadata][plan]': opts.plan,
  }
  if (opts.customerId) params.customer = opts.customerId
  const session = await stripeRequest<{ url: string }>('/checkout/sessions', params)
  return { url: session.url }
}

export async function createBillingPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
  return stripeRequest<{ url: string }>('/billing_portal/sessions', {
    customer: customerId,
    return_url: returnUrl,
  })
}

/** Verify a Stripe webhook signature (v1 scheme, HMAC-SHA256, 5 min tolerance). */
export async function verifyWebhookSignature(payload: string, sigHeader: string | null): Promise<boolean> {
  const secret = getSecret('STRIPE_WEBHOOK_SECRET')
  if (!secret || !sigHeader) return false
  const parts = Object.fromEntries(
    sigHeader.split(',').map(kv => {
      const i = kv.indexOf('=')
      return [kv.slice(0, i), kv.slice(i + 1)] as const
    }),
  )
  const timestamp = parts.t
  const expected = parts.v1
  if (!timestamp || !expected) return false
  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (!Number.isFinite(age) || age > 300) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`))
  const computed = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
  if (computed.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}
