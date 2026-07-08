// History (fnf feed + recipe enrichment) and profile/credits reads.
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireCurrentUser } from '../auth.server'
import { createFnfReaders, toSafeGeneration, type SafeGeneration } from '../fnf.server'
import { getDb } from '../db.server'
import { getUserPlan } from '../profile.server'

export interface RecipeRow {
  id: string
  generation_id: string | null
  job_set_id: string | null
  prompt: string
  subject: string | null
  model: string
  preset_slug: string | null
  settings_json: string
  media_type: string
  created_at: string
}

export const getHistory = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ type: z.enum(['image', 'video', 'all']).default('all'), size: z.number().int().min(1).max(50).default(24) }))
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }

    const plan = await getUserPlan(auth.user.id)
    const size = Math.min(data.size, plan.limits.historyPageSize)

    let generations: SafeGeneration[] = []
    try {
      const { jobs } = createFnfReaders()
      const feed = await jobs.list(
        (data.type === 'all' ? { size } : { type: data.type, size }) as never,
      )
      const items = (feed as { items?: unknown[]; results?: unknown[]; data?: unknown[] })
      const list = items.items ?? items.results ?? items.data ?? (Array.isArray(feed) ? (feed as unknown[]) : [])
      generations = list.map(toSafeGeneration)
    } catch (error) {
      console.info('[api/history] feed failed', { code: (error as { code?: string }).code })
    }

    // Enrich with our recipes (preset, subject, settings) for remix.
    let recipes: RecipeRow[] = []
    try {
      const db = getDb()
      const res = await db
        .prepare('SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC LIMIT 200')
        .bind(auth.user.id)
        .all<RecipeRow>()
      recipes = res.results
    } catch (error) {
      console.info('[api/history] recipes failed', { message: (error as Error).message })
    }

    const recipeByGen = new Map(recipes.filter(r => r.generation_id).map(r => [r.generation_id as string, r]))
    return {
      ok: true as const,
      plan: plan.id,
      generations: generations.map(g => ({
        ...g,
        recipe: recipeByGen.get(g.id) ?? null,
      })),
    }
  })

export const getProfileSnapshot = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = await requireCurrentUser()
  if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }

  const plan = await getUserPlan(auth.user.id)
  let credits: number | null = null
  let workspaceName: string | null = null
  try {
    const { profile } = createFnfReaders()
    const c = await profile.getCredits({ includeOnDemand: true } as never)
    const cc = c as { totalAvailableCredits?: number; availableCredits?: number } | null
    credits = cc?.totalAvailableCredits ?? cc?.availableCredits ?? null
  } catch (error) {
    console.info('[api/profile] credits failed', { code: (error as { code?: string }).code })
  }
  return {
    ok: true as const,
    plan: plan.id,
    planName: plan.name,
    limits: plan.limits,
    credits,
    workspaceName,
  }
})
