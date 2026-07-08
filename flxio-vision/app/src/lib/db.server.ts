// Server-only D1 access. The DB binding exists because app/app.manifest.json
// declares "db": true; guard anyway per template rules.
import { env } from 'cloudflare:workers'

type D1Like = {
  prepare(sql: string): {
    bind(...params: unknown[]): {
      run(): Promise<unknown>
      first<T = Record<string, unknown>>(): Promise<T | null>
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
    }
    run(): Promise<unknown>
    first<T = Record<string, unknown>>(): Promise<T | null>
    all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  }
}

export function getDb(): D1Like {
  const db = (env as Record<string, unknown>).DB as D1Like | undefined
  if (!db) throw new Error('D1 binding DB is not configured')
  return db
}

export function getSecret(name: string): string | undefined {
  const v = (env as Record<string, unknown>)[name]
  return typeof v === 'string' && v.length > 0 ? v : undefined
}
