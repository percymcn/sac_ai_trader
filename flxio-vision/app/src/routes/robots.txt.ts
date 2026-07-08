import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/robots')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const body = [
          'User-agent: *',
          'Allow: /',
          'Disallow: /billing',
          'Disallow: /api/',
          '',
          `Sitemap: ${origin}/sitemap.xml`,
        ].join('\n')
        return new Response(body, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        })
      },
    },
  },
})
