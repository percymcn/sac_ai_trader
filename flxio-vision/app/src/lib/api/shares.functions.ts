// Public share pages + gallery + votes — the viral loop.
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireCurrentUser } from '../auth.server'
import { getDb } from '../db.server'

export interface ShareRow {
  id: string
  user_id: string
  generation_id: string
  title: string
  prompt: string | null
  model: string
  preset_slug: string | null
  media_type: string
  preview_url: string | null
  raw_url: string
  thumbnail_url: string | null
  in_gallery: number
  vote_count: number
  created_at: string
}

// Short, URL-safe, unguessable id (crypto-random, ~57 bits).
function shortId(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(11))
  return [...bytes].map(b => alphabet[b % alphabet.length]).join('')
}

export const publishShare = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      generationId: z.string().min(1),
      title: z.string().min(1).max(120),
      prompt: z.string().max(4000).optional(),
      model: z.string().min(1),
      presetSlug: z.string().optional(),
      mediaType: z.enum(['image', 'video']),
      previewUrl: z.string().url().optional(),
      rawUrl: z.string().url(),
      thumbnailUrl: z.string().url().optional(),
      inGallery: z.boolean().default(true),
    }),
  )
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    const db = getDb()

    const existing = await db
      .prepare('SELECT id FROM shares WHERE generation_id = ? AND user_id = ?')
      .bind(data.generationId, auth.user.id)
      .first<{ id: string }>()
    if (existing) return { ok: true as const, id: existing.id, existed: true }

    const id = shortId()
    await db
      .prepare(
        `INSERT INTO shares (id, user_id, generation_id, title, prompt, model, preset_slug, media_type, preview_url, raw_url, thumbnail_url, in_gallery, vote_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      )
      .bind(
        id,
        auth.user.id,
        data.generationId,
        data.title,
        data.prompt ?? null,
        data.model,
        data.presetSlug ?? null,
        data.mediaType,
        data.previewUrl ?? null,
        data.rawUrl,
        data.thumbnailUrl ?? null,
        data.inGallery ? 1 : 0,
        new Date().toISOString(),
      )
      .run()
    return { ok: true as const, id, existed: false }
  })

export const getShare = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(4).max(40) }))
  .handler(async ({ data }) => {
    const db = getDb()
    const share = await db.prepare('SELECT * FROM shares WHERE id = ?').bind(data.id).first<ShareRow>()
    if (!share) return { ok: false as const, code: 'not_found' as const }
    return { ok: true as const, share }
  })

export const listGallery = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      sort: z.enum(['top', 'new']).default('top'),
      mediaType: z.enum(['image', 'video', 'all']).default('all'),
      limit: z.number().int().min(1).max(60).default(24),
      offset: z.number().int().min(0).default(0),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb()
    const order = data.sort === 'top' ? 'vote_count DESC, created_at DESC' : 'created_at DESC'
    const typeFilter = data.mediaType === 'all' ? '' : 'AND media_type = ?'
    const stmt = db.prepare(
      `SELECT * FROM shares WHERE in_gallery = 1 ${typeFilter} ORDER BY ${order} LIMIT ? OFFSET ?`,
    )
    const bound =
      data.mediaType === 'all'
        ? stmt.bind(data.limit, data.offset)
        : stmt.bind(data.mediaType, data.limit, data.offset)
    const res = await bound.all<ShareRow>()
    return { ok: true as const, shares: res.results }
  })

export const voteShare = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ shareId: z.string().min(4).max(40) }))
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    const db = getDb()
    const share = await db.prepare('SELECT id FROM shares WHERE id = ?').bind(data.shareId).first<{ id: string }>()
    if (!share) return { ok: false as const, code: 'not_found' as const }

    const existing = await db
      .prepare('SELECT share_id FROM votes WHERE share_id = ? AND user_id = ?')
      .bind(data.shareId, auth.user.id)
      .first<{ share_id: string }>()

    if (existing) {
      await db.prepare('DELETE FROM votes WHERE share_id = ? AND user_id = ?').bind(data.shareId, auth.user.id).run()
      await db.prepare('UPDATE shares SET vote_count = MAX(vote_count - 1, 0) WHERE id = ?').bind(data.shareId).run()
      return { ok: true as const, voted: false }
    }

    await db
      .prepare('INSERT INTO votes (share_id, user_id, created_at) VALUES (?, ?, ?)')
      .bind(data.shareId, auth.user.id, new Date().toISOString())
      .run()
    await db.prepare('UPDATE shares SET vote_count = vote_count + 1 WHERE id = ?').bind(data.shareId).run()
    return { ok: true as const, voted: true }
  })

export const deleteShare = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(4).max(40) }))
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    const db = getDb()
    await db.prepare('DELETE FROM votes WHERE share_id = ?').bind(data.id).run()
    await db.prepare('DELETE FROM shares WHERE id = ? AND user_id = ?').bind(data.id, auth.user.id).run()
    return { ok: true as const }
  })
