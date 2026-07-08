import { useEffect, useState } from 'react'

export interface BrowserUser {
  id?: string
  [key: string]: unknown
}

export async function fetchCurrentUser(): Promise<BrowserUser | null> {
  const res = await fetch('/api/user', { credentials: 'include' })
  if (res.status === 401) return null
  if (!res.ok) throw new Error('Failed to load user')
  return res.json() as Promise<BrowserUser>
}

export function login(returnPath?: string) {
  const ret = returnPath ?? window.location.pathname + window.location.search
  window.location.href = `/__auth/login?return=${encodeURIComponent(ret)}`
}

export function logout(returnPath = '/') {
  window.location.href = `/__auth/logout?return=${encodeURIComponent(returnPath)}`
}

export type AuthState = 'loading' | 'signed-in' | 'signed-out' | 'error'

export function useCurrentUser(): { state: AuthState; user: BrowserUser | null } {
  const [state, setState] = useState<AuthState>('loading')
  const [user, setUser] = useState<BrowserUser | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchCurrentUser()
      .then(u => {
        if (cancelled) return
        setUser(u)
        setState(u ? 'signed-in' : 'signed-out')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { state, user }
}
