// Stripe webhook endpoint. Configure in Stripe: POST <site>/api/billing/webhook
// Events handled: checkout.session.completed, customer.subscription.updated,
// customer.subscription.deleted. Signature verified via STRIPE_WEBHOOK_SECRET.
import { createFileRoute } from '@tanstack/react-router'
import { verifyWebhookSignature } from '../../../lib/stripe.server'
import { setUserPlan } from '../../../lib/profile.server'
import { getDb } from '../../../lib/db.server'
import type { PlanId } from '../../../data/plans'

interface StripeEvent {
  id: string
  type: string
  data: {
    object: {
      id: string
      customer?: string
      client_reference_id?: string
      subscription?: string
      status?: string
      current_period_end?: number
      metadata?: Record<string, string>
      items?: { data?: { price?: { id?: string; recurring?: { interval?: string } } }[] }
    }
  }
}

export const Route = createFileRoute('/api/billing/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await request.text()
        const valid = await verifyWebhookSignature(payload, request.headers.get('stripe-signature'))
        if (!valid) {
          return Response.json({ ok: false, error: 'invalid_signature' }, { status: 400 })
        }

        let event: StripeEvent
        try {
          event = JSON.parse(payload) as StripeEvent
        } catch {
          return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
        }

        const obj = event.data.object
        const userId = obj.metadata?.user_id ?? obj.client_reference_id ?? null
        const plan = (obj.metadata?.plan as PlanId | undefined) ?? null

        try {
          if (event.type === 'checkout.session.completed' && userId && plan) {
            await setUserPlan(userId, plan, {
              interval: obj.metadata?.interval === 'annual' ? 'annual' : 'monthly',
              mode: 'stripe',
              stripeCustomerId: obj.customer ?? null,
              stripeSubscriptionId: obj.subscription ?? null,
              renewsAt: null,
            })
          } else if (event.type === 'customer.subscription.updated' && userId && plan) {
            const active = obj.status === 'active' || obj.status === 'trialing'
            const interval = obj.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly'
            await setUserPlan(userId, active ? plan : 'free', {
              interval: active ? interval : null,
              mode: active ? 'stripe' : null,
              stripeCustomerId: obj.customer ?? null,
              stripeSubscriptionId: active ? obj.id : null,
              renewsAt: obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null,
            })
          } else if (event.type === 'customer.subscription.deleted' && userId) {
            await setUserPlan(userId, 'free', { interval: null, mode: null, renewsAt: null })
          }

          const db = getDb()
          await db
            .prepare('INSERT INTO billing_events (id, user_id, kind, payload_json, created_at) VALUES (?, ?, ?, ?, ?)')
            .bind(crypto.randomUUID(), userId, `stripe:${event.type}`, null, new Date().toISOString())
            .run()
        } catch (error) {
          console.info('[billing/webhook] handler failed', { type: event.type, message: (error as Error).message })
          return Response.json({ ok: false }, { status: 500 })
        }

        return Response.json({ ok: true, received: event.type })
      },
    },
  },
})
