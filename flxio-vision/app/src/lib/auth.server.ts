// Server-side Higgsfield auth guard (references/auth.md contract).
// Every SDK/data operation re-checks auth here before touching anything.

export interface CurrentUser {
  id: string
  [key: string]: unknown
}

type AuthResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; status: number; body: unknown }

export async function requireCurrentUser(): Promise<AuthResult> {
  const response = await fetch('https://fnf.internal/user')
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null

  if (!response.ok) {
    return { ok: false as const, status: response.status, body }
  }

  const id = extractUserId(body)
  if (!id) {
    return { ok: false as const, status: 401, body: { error: 'no_user_id' } }
  }

  return { ok: true as const, user: { ...(body as object), id } as CurrentUser }
}

function extractUserId(body: Record<string, unknown> | null): string | null {
  if (!body) return null
  const direct = body.id ?? body.user_id ?? body.uid
  if (typeof direct === 'string' && direct) return direct
  if (typeof direct === 'number') return String(direct)
  const nested = body.user as Record<string, unknown> | undefined
  if (nested) {
    const nid = nested.id ?? nested.user_id
    if (typeof nid === 'string' && nid) return nid
    if (typeof nid === 'number') return String(nid)
  }
  return null
}

export const UNAUTHORIZED = { ok: false as const, code: 'unauthorized' as const }
