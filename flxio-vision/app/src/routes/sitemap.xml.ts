import { createFileRoute } from '@tanstack/react-router'
import { MODELS } from '../data/models'
import { PRESETS } from '../data/presets'
import { COMPETITORS } from '../data/competitors'
import { USE_CASES } from '../data/use-cases'
import { ANSWERS } from '../data/answers'
import { BLOG_POSTS } from '../data/blog'
import { CATEGORY_PAGES } from '../data/categories'
import { getDb } from '../lib/db.server'

interface SitemapUrl {
  path: string
  priority: string
  changefreq: string
  lastmod?: string
}

function staticUrls(): SitemapUrl[] {
  const urls: SitemapUrl[] = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/studio', priority: '0.9', changefreq: 'weekly' },
    { path: '/presets', priority: '0.9', changefreq: 'weekly' },
    { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
    { path: '/explore', priority: '0.8', changefreq: 'daily' },
    { path: '/features', priority: '0.8', changefreq: 'monthly' },
    { path: '/use-cases', priority: '0.7', changefreq: 'monthly' },
    { path: '/vs', priority: '0.8', changefreq: 'monthly' },
    { path: '/models', priority: '0.7', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    { path: '/answers', priority: '0.7', changefreq: 'weekly' },
    { path: '/about', priority: '0.5', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.2', changefreq: 'yearly' },
    { path: '/terms', priority: '0.2', changefreq: 'yearly' },
  ]
  for (const m of MODELS) urls.push({ path: `/models/${m.slug}`, priority: '0.7', changefreq: 'monthly' })
  for (const p of PRESETS) urls.push({ path: `/presets/${p.slug}`, priority: '0.6', changefreq: 'monthly' })
  for (const c of COMPETITORS) urls.push({ path: `/vs/${c.slug}`, priority: '0.8', changefreq: 'weekly' })
  for (const u of USE_CASES) urls.push({ path: `/use-cases/${u.slug}`, priority: '0.7', changefreq: 'monthly' })
  for (const c of CATEGORY_PAGES) urls.push({ path: `/best/${c.slug}`, priority: '0.8', changefreq: 'weekly' })
  for (const a of ANSWERS) urls.push({ path: `/answers/${a.slug}`, priority: '0.6', changefreq: 'monthly' })
  for (const b of BLOG_POSTS)
    urls.push({ path: `/blog/${b.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: b.date })
  return urls
}

export const Route = createFileRoute('/sitemap')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const today = new Date().toISOString().split('T')[0]
        const urls = staticUrls()

        // Public share pages are indexable — include the latest gallery items.
        try {
          const db = getDb()
          const res = await db
            .prepare('SELECT id, created_at FROM shares WHERE in_gallery = 1 ORDER BY created_at DESC LIMIT 2000')
            .all<{ id: string; created_at: string }>()
          for (const row of res.results) {
            urls.push({
              path: `/r/${row.id}`,
              priority: '0.5',
              changefreq: 'monthly',
              lastmod: row.created_at.split('T')[0],
            })
          }
        } catch {
          // D1 unavailable — static portion still serves.
        }

        const body = urls
          .map(
            u => `  <url>
    <loc>${origin}${u.path === '/' ? '' : u.path}</loc>
    <lastmod>${u.lastmod ?? today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
          )
          .join('\n')

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`

        return new Response(xml, {
          status: 200,
          headers: { 'Content-Type': 'application/xml' },
        })
      },
    },
  },
})
