// Boards (collections) CRUD — plan-gated by board count.
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireCurrentUser } from '../auth.server'
import { getDb } from '../db.server'
import { getUserPlan } from '../profile.server'

export interface BoardRow {
  id: string
  name: string
  description: string | null
  created_at: string
  item_count?: number
}

export interface BoardItemRow {
  id: string
  board_id: string
  generation_id: string
  prompt: string | null
  model: string | null
  preset_slug: string | null
  media_type: string | null
  preview_url: string | null
  raw_url: string | null
  created_at: string
}

export const listBoards = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = await requireCurrentUser()
  if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
  const db = getDb()
  const res = await db
    .prepare(
      `SELECT b.*, (SELECT COUNT(*) FROM board_items i WHERE i.board_id = b.id) AS item_count
       FROM boards b WHERE b.user_id = ? ORDER BY b.created_at DESC`,
    )
    .bind(auth.user.id)
    .all<BoardRow>()
  return { ok: true as const, boards: res.results }
})

export const createBoard = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ name: z.string().min(1).max(80), description: z.string().max(300).optional() }))
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    const db = getDb()
    const plan = await getUserPlan(auth.user.id)
    const count = await db
      .prepare('SELECT COUNT(*) AS n FROM boards WHERE user_id = ?')
      .bind(auth.user.id)
      .first<{ n: number }>()
    if ((count?.n ?? 0) >= plan.limits.boards) {
      return { ok: false as const, code: 'board_limit' as const, limit: plan.limits.boards, plan: plan.id }
    }
    const id = crypto.randomUUID()
    await db
      .prepare('INSERT INTO boards (id, user_id, name, description, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, auth.user.id, data.name, data.description ?? null, new Date().toISOString())
      .run()
    return { ok: true as const, id }
  })

export const getBoard = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    const db = getDb()
    const board = await db
      .prepare('SELECT * FROM boards WHERE id = ? AND user_id = ?')
      .bind(data.id, auth.user.id)
      .first<BoardRow>()
    if (!board) return { ok: false as const, code: 'not_found' as const }
    const items = await db
      .prepare('SELECT * FROM board_items WHERE board_id = ? ORDER BY created_at DESC LIMIT 200')
      .bind(data.id)
      .all<BoardItemRow>()
    return { ok: true as const, board, items: items.results }
  })

export const addToBoard = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      boardId: z.string().min(1),
      generationId: z.string().min(1),
      prompt: z.string().max(4000).optional(),
      model: z.string().optional(),
      presetSlug: z.string().optional(),
      mediaType: z.string().optional(),
      previewUrl: z.string().url().optional(),
      rawUrl: z.string().url().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    const db = getDb()
    const board = await db
      .prepare('SELECT id FROM boards WHERE id = ? AND user_id = ?')
      .bind(data.boardId, auth.user.id)
      .first<{ id: string }>()
    if (!board) return { ok: false as const, code: 'not_found' as const }
    await db
      .prepare(
        `INSERT INTO board_items (id, board_id, user_id, generation_id, prompt, model, preset_slug, media_type, preview_url, raw_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        data.boardId,
        auth.user.id,
        data.generationId,
        data.prompt ?? null,
        data.model ?? null,
        data.presetSlug ?? null,
        data.mediaType ?? null,
        data.previewUrl ?? null,
        data.rawUrl ?? null,
        new Date().toISOString(),
      )
      .run()
    return { ok: true as const }
  })

export const removeFromBoard = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ itemId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    const db = getDb()
    await db
      .prepare('DELETE FROM board_items WHERE id = ? AND user_id = ?')
      .bind(data.itemId, auth.user.id)
      .run()
    return { ok: true as const }
  })

export const deleteBoard = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireCurrentUser()
    if (!auth.ok) return { ok: false as const, code: 'unauthorized' as const, status: auth.status }
    const db = getDb()
    await db.prepare('DELETE FROM board_items WHERE board_id = ? AND user_id = ?').bind(data.id, auth.user.id).run()
    await db.prepare('DELETE FROM boards WHERE id = ? AND user_id = ?').bind(data.id, auth.user.id).run()
    return { ok: true as const }
  })
