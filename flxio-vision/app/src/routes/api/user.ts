// Browser-safe auth proxy — preserves upstream status + body 1:1.
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/user')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const upstream = await fetch('https://fnf.internal/user')
          const body = await upstream.text()
          return new Response(body, {
            status: upstream.status,
            headers: {
              'content-type': upstream.headers.get('content-type') ?? 'application/json',
              'cache-control': 'no-store',
            },
          })
        } catch {
          // Upstream unavailable or no platform identity — treat as anonymous.
          return new Response(JSON.stringify({ error: 'unauthenticated' }), {
            status: 401,
            headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
          })
        }
      },
    },
  },
})
