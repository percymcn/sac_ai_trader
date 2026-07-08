import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '../db.server'

export const submitContact = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1).max(100),
      email: z.string().email().max(200),
      message: z.string().min(10).max(4000),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb()
    await db
      .prepare('INSERT INTO contact_messages (id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), data.name, data.email, data.message, new Date().toISOString())
      .run()
    return { ok: true as const }
  })
