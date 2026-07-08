// Server-only fnf SDK wiring — the ONE place SDK clients and job models are
// registered. All generation runs on https://fnf.internal with platform-
// attached identity (no tokens in app code).
import { createJobClient, getPreviewUrl, getRawUrl, getJobPhase } from '@higgsfield/fnf/client'
import { createMediaClient } from '@higgsfield/fnf/media'
import { createProfileClient } from '@higgsfield/fnf/profile'
import { createWorkflowPlatformAdapter } from '@higgsfield/fnf/workflow-platform'
import {
  gptImage2,
  nanoBanana2,
  seedreamV4_5,
  soulV2Image,
  seedance2_0,
  kling3_0,
  veo3_1Lite,
  wan27,
  grokImagine,
} from '@higgsfield/fnf/jobs'

const REGISTERED_JOBS = [
  gptImage2,
  nanoBanana2,
  seedreamV4_5,
  soulV2Image,
  seedance2_0,
  kling3_0,
  veo3_1Lite,
  wan27,
  grokImagine,
]

const observability = {
  onEvent: (name: string, meta?: Record<string, unknown>) => {
    // Safe metadata only: never prompts, params, URLs, or tokens.
    console.info(`[fnf] ${name}`, {
      model: meta?.model,
      status: meta?.status,
      code: meta?.code,
      durationMs: meta?.durationMs,
    })
  },
}

/**
 * Build clients for one request. `confirmed` wires the SDK submission
 * confirmation gate: the browser modal sets it true; unconfirmed submits
 * reject with the typed `confirmation_rejected` error.
 */
export function createFnfClients(confirmed?: boolean) {
  const adapter = createWorkflowPlatformAdapter({
    baseUrl: 'https://fnf.internal',
    confirm: async () => {
      if (!confirmed) throw new Error('user did not confirm the submission')
    },
  })
  const jobs = createJobClient({ adapter, jobs: REGISTERED_JOBS })
  const media = createMediaClient({ mediaAdapter: adapter })
  const profile = createProfileClient({ profileAdapter: adapter })
  return { adapter, jobs, media, profile }
}

/** Read-only clients (feed, cost, profile) — no confirmation gate involved. */
export function createFnfReaders() {
  const adapter = createWorkflowPlatformAdapter({ baseUrl: 'https://fnf.internal', observability })
  const jobs = createJobClient({ adapter, jobs: REGISTERED_JOBS })
  const media = createMediaClient({ mediaAdapter: adapter })
  const profile = createProfileClient({ profileAdapter: adapter })
  return { adapter, jobs, media, profile }
}

export interface SafeGeneration {
  id: string
  jobSetId?: string
  model: string
  status: string
  phase: 'progress' | 'completed' | 'failed'
  mediaType: 'image' | 'video' | 'unknown'
  previewUrl: string | null
  rawUrl: string | null
  thumbnailUrl: string | null
  prompt: string | null
  createdAt: string | null
  failureReason: string | null
}

// Serialize an SDK Generation into a browser-safe shape using SDK selectors.
export function toSafeGeneration(gen: unknown): SafeGeneration {
  const g = gen as Record<string, unknown>
  const results = (g.results ?? {}) as Record<string, unknown>
  const promptObj = g.prompt as Record<string, unknown> | string | undefined
  const prompt =
    typeof promptObj === 'string'
      ? promptObj
      : typeof promptObj?.instruction === 'string'
        ? (promptObj.instruction as string)
        : null
  return {
    id: String(g.id ?? ''),
    jobSetId: g.jobSetId ? String(g.jobSetId) : g.job_set_id ? String(g.job_set_id) : undefined,
    model: String(g.model ?? g.type ?? 'unknown'),
    status: String(g.status ?? 'unknown'),
    phase: getJobPhase(gen),
    mediaType: inferMediaType(g),
    previewUrl: getPreviewUrl(gen) ?? null,
    rawUrl: getRawUrl(gen) ?? null,
    thumbnailUrl: typeof results.thumbnailUrl === 'string' ? (results.thumbnailUrl as string) : null,
    prompt,
    createdAt: typeof g.createdAt === 'string' ? (g.createdAt as string) : typeof g.created_at === 'string' ? (g.created_at as string) : null,
    failureReason:
      typeof g.failureReason === 'string'
        ? (g.failureReason as string)
        : typeof g.failure_reason === 'string'
          ? (g.failure_reason as string)
          : null,
  }
}

function inferMediaType(g: Record<string, unknown>): 'image' | 'video' | 'unknown' {
  const t = String(g.genType ?? g.gen_type ?? g.mediaType ?? '')
  if (t.includes('video')) return 'video'
  if (t.includes('image')) return 'image'
  const raw = ((g.results ?? {}) as Record<string, unknown>).rawUrl
  if (typeof raw === 'string') {
    if (/\.(mp4|webm|mov)(\?|$)/i.test(raw)) return 'video'
    if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(raw)) return 'image'
  }
  return 'unknown'
}
