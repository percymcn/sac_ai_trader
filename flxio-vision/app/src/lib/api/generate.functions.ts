// Generation server functions: cost preview, submit (single + batch), poll.
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireCurrentUser } from '../auth.server'
import { createFnfClients, createFnfReaders, toSafeGeneration, type SafeGeneration } from '../fnf.server'
import { getDb } from '../db.server'
import { getUserPlan } from '../profile.server'
import { getModel } from '../../data/models'
import { getPreset } from '../../data/presets'

const settingsSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))

const generateInput = z.object({
  prompt: z.string().min(1).max(4000),
  model: z.string().min(1),
  settings: settingsSchema,
  presetSlug: z.string().optional(),
  subject: z.string().max(500).optional(),
  mediaRef: z.unknown().optional(),
  confirmed: z.literal(true),
})

type SubmitInput = {
  model: string
  prompt: { instruction: string }
  settings: Record<string, unknown>
  media?: { image: unknown }
}

function buildSubmitInput(data: {
  model: string
  prompt: string
  settings: Record<string, unknown>
  mediaRef?: unknown
}): SubmitInput {
  const input: SubmitInput = {
    model: data.model,
    prompt: { instruction: data.prompt },
    settings: data.settings,
  }
  if (data.mediaRef) input.media = { image: data.mediaRef }
  return input
}

export const previewCost = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      prompt: z.string().min(1).max(4000),
      model: z.string().min(1),
      settings: settingsSchema,
      mediaRef: z.unknown().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    if (!getModel(data.model)) return { ok: false as const, code: 'unknown_model' as const }
    try {
      const { jobs } = createFnfReaders()
      const cost = await jobs.cost(buildSubmitInput(data) as never)
      return { ok: true as const, credits: (cost as { credits?: number }).credits ?? null }
    } catch (error) {
      console.info('[api/cost] failed', { model: data.model, code: (error as { code?: string }).code })
      return { ok: false as const, code: 'cost_unavailable' as const }
    }
  })

export const submitGeneration = createServerFn({ method: 'POST' })
  .inputValidator(generateInput)
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }

    const model = getModel(data.model)
    if (!model) return { ok: false as const, code: 'unknown_model' as const }

    if (data.presetSlug) {
      const preset = getPreset(data.presetSlug)
      const plan = await getUserPlan(auth.user.id)
      if (preset && !preset.core && !plan.limits.allPresets) {
        return { ok: false as const, code: 'preset_locked' as const }
      }
    }

    const { jobs } = createFnfClients(data.confirmed)
    const result = await jobs.safeSubmit(buildSubmitInput(data) as never)
    if (!result.ok) {
      const code = (result.error as { code?: string }).code ?? 'job_failed'
      console.info('[api/generate] submit failed', { model: data.model, code })
      return { ok: false as const, code }
    }

    const generations = (result as unknown as { generations?: unknown[] }).generations
      ?? (result as unknown as { value?: { generations?: unknown[] } }).value?.generations
      ?? []
    const safe = generations.map(toSafeGeneration)

    // Log the recipe (our product layer) for history/remix.
    try {
      const db = getDb()
      const now = new Date().toISOString()
      for (const gen of safe) {
        await db
          .prepare(
            `INSERT INTO recipes (id, user_id, generation_id, job_set_id, prompt, subject, model, preset_slug, settings_json, media_type, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            crypto.randomUUID(),
            auth.user.id,
            gen.id || null,
            gen.jobSetId ?? null,
            data.prompt,
            data.subject ?? null,
            data.model,
            data.presetSlug ?? null,
            JSON.stringify(data.settings),
            model.kind,
            now,
          )
          .run()
      }
    } catch (error) {
      console.info('[api/generate] recipe log failed', { message: (error as Error).message })
    }

    return { ok: true as const, generations: safe }
  })

export const submitBatch = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      prompts: z.array(z.string().min(1).max(4000)).min(1).max(10),
      model: z.string().min(1),
      settings: settingsSchema,
      presetSlug: z.string().optional(),
      confirmed: z.literal(true),
    }),
  )
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }

    const plan = await getUserPlan(auth.user.id)
    if (data.prompts.length > plan.limits.batchSize) {
      return {
        ok: false as const,
        code: 'batch_limit' as const,
        limit: plan.limits.batchSize,
        plan: plan.id,
      }
    }
    const model = getModel(data.model)
    if (!model) return { ok: false as const, code: 'unknown_model' as const }

    const { jobs } = createFnfClients(true)
    const db = getDb()
    const now = new Date().toISOString()
    const results: { prompt: string; ok: boolean; code?: string; generations: SafeGeneration[] }[] = []

    for (const prompt of data.prompts) {
      const result = await jobs.safeSubmit(
        buildSubmitInput({ model: data.model, prompt, settings: data.settings }) as never,
      )
      if (!result.ok) {
        const code = (result.error as { code?: string }).code ?? 'job_failed'
        results.push({ prompt, ok: false, code, generations: [] })
        if (code === 'out_of_credits') break
        continue
      }
      const generations = ((result as unknown as { generations?: unknown[] }).generations
        ?? (result as unknown as { value?: { generations?: unknown[] } }).value?.generations
        ?? []).map(toSafeGeneration)
      results.push({ prompt, ok: true, generations })
      for (const gen of generations) {
        await db
          .prepare(
            `INSERT INTO recipes (id, user_id, generation_id, job_set_id, prompt, subject, model, preset_slug, settings_json, media_type, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            crypto.randomUUID(),
            auth.user.id,
            gen.id || null,
            gen.jobSetId ?? null,
            prompt,
            null,
            data.model,
            data.presetSlug ?? null,
            JSON.stringify(data.settings),
            model.kind,
            now,
          )
          .run()
      }
    }

    return { ok: true as const, results }
  })

export const pollGeneration = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    try {
      const { jobs } = createFnfReaders()
      const gen = await jobs.get(data.id as never)
      return { ok: true as const, generation: toSafeGeneration(gen) }
    } catch (error) {
      console.info('[api/poll] failed', { code: (error as { code?: string }).code })
      return { ok: false as const, code: 'not_found' as const }
    }
  })
