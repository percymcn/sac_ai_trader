// FlxioAI Vision plans. Generation compute is billed in Higgsfield credits on
// the signed-in account; these plans gate FlxioAI's own product features.
// Stripe price IDs are injected via website secrets at go-live (see
// lib/stripe.server.ts) — the plan definitions here drive UI + gates.

export type PlanId = 'free' | 'pro' | 'studio'

export interface Plan {
  id: PlanId
  name: string
  monthlyUsd: number
  annualUsd: number
  blurb: string
  features: string[]
  limits: {
    batchSize: number
    boards: number
    historyPageSize: number
    remix: boolean
    allPresets: boolean
    shareBranding: boolean // can hide "made with" badge on share pages
    prioritySupport: boolean
  }
  cta: string
  highlight: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyUsd: 0,
    annualUsd: 0,
    blurb: 'Everything you need to direct your first shots.',
    features: [
      'Full studio with every model',
      'Live credit cost preview on every shot',
      '20 core director presets',
      '1 board, 50 saved shots',
      'Public share pages with OG cards',
      'Community gallery + voting',
    ],
    limits: {
      batchSize: 1,
      boards: 1,
      historyPageSize: 50,
      remix: true,
      allPresets: false,
      shareBranding: false,
      prioritySupport: false,
    },
    cta: 'Start free',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyUsd: 12,
    annualUsd: 99,
    blurb: 'For creators shipping content every week.',
    features: [
      'Everything in Free',
      'All 35+ director presets',
      'Batch mode — queue 4 prompts at once',
      'Unlimited boards and saved history',
      'Remix any shot with one click',
      'Clean share pages (no badge)',
    ],
    limits: {
      batchSize: 4,
      boards: 1_000,
      historyPageSize: 200,
      remix: true,
      allPresets: true,
      shareBranding: true,
      prioritySupport: false,
    },
    cta: 'Go Pro',
    highlight: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    monthlyUsd: 29,
    annualUsd: 249,
    blurb: 'For teams and heavy pipelines.',
    features: [
      'Everything in Pro',
      'Batch mode — queue 10 prompts at once',
      'Priority support',
      'Early access to new presets and models',
      'Commercial usage guidance',
    ],
    limits: {
      batchSize: 10,
      boards: 10_000,
      historyPageSize: 500,
      remix: true,
      allPresets: true,
      shareBranding: true,
      prioritySupport: true,
    },
    cta: 'Go Studio',
    highlight: false,
  },
]

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find(p => p.id === id) ?? PLANS[0]
}

export const ANNUAL_SAVINGS: Record<PlanId, number> = {
  free: 0,
  pro: Math.round((1 - 99 / (12 * 12)) * 100),
  studio: Math.round((1 - 249 / (29 * 12)) * 100),
}
