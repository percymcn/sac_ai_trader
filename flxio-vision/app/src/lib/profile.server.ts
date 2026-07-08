// App-level user profile stored in D1 (plan, billing linkage). fnf owns
// identity; this table is FlxioAI Vision's product layer on top of it.
import { getDb } from './db.server'
import { getPlan, type Plan, type PlanId } from '../data/plans'

export interface ProfileRow {
  user_id: string
  plan: PlanId
  billing_interval: 'monthly' | 'annual' | null
  billing_mode: 'test' | 'stripe' | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_renews_at: string | null
  created_at: string
  updated_at: string
}

export async function getOrCreateProfile(userId: string): Promise<ProfileRow> {
  const db = getDb()
  const existing = await db
    .prepare('SELECT * FROM profiles WHERE user_id = ?')
    .bind(userId)
    .first<ProfileRow>()
  if (existing) return existing

  const now = new Date().toISOString()
  await db
    .prepare(
      'INSERT INTO profiles (user_id, plan, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO NOTHING',
    )
    .bind(userId, 'free', now, now)
    .run()
  const created = await db
    .prepare('SELECT * FROM profiles WHERE user_id = ?')
    .bind(userId)
    .first<ProfileRow>()
  if (!created) throw new Error('failed to create profile')
  return created
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const profile = await getOrCreateProfile(userId)
  return getPlan(profile.plan)
}

export async function setUserPlan(
  userId: string,
  plan: PlanId,
  opts: {
    interval?: 'monthly' | 'annual' | null
    mode?: 'test' | 'stripe' | null
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    renewsAt?: string | null
  } = {},
): Promise<void> {
  const db = getDb()
  await getOrCreateProfile(userId)
  await db
    .prepare(
      `UPDATE profiles SET plan = ?, billing_interval = ?, billing_mode = ?,
       stripe_customer_id = COALESCE(?, stripe_customer_id),
       stripe_subscription_id = ?,
       plan_renews_at = ?, updated_at = ?
       WHERE user_id = ?`,
    )
    .bind(
      plan,
      opts.interval ?? null,
      opts.mode ?? null,
      opts.stripeCustomerId ?? null,
      opts.stripeSubscriptionId ?? null,
      opts.renewsAt ?? null,
      new Date().toISOString(),
      userId,
    )
    .run()
}
