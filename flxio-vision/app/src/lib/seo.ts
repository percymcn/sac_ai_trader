// SEO helpers: per-route head() builders and JSON-LD graphs.
import { SITE, absUrl, OG_COVER_URL } from '../data/site'

interface HeadInput {
  title: string
  description: string
  path: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  robots?: string
  article?: { publishedTime: string; author: string; section: string }
}

const DEFAULT_OG = OG_COVER_URL

export function buildHead(input: HeadInput) {
  const url = absUrl(input.path)
  const ogImage = input.ogImage ?? DEFAULT_OG
  const meta: Record<string, string>[] = [
    { title: input.title },
    { name: 'description', content: input.description },
    { name: 'robots', content: input.robots ?? (input.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large') },
    { property: 'og:type', content: input.ogType ?? 'website' },
    { property: 'og:title', content: input.title },
    { property: 'og:description', content: input.description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: ogImage },
    { property: 'og:site_name', content: SITE.name },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: input.title },
    { name: 'twitter:description', content: input.description },
    { name: 'twitter:image', content: ogImage },
  ]
  if (input.article) {
    meta.push(
      { property: 'article:published_time', content: input.article.publishedTime },
      { property: 'article:author', content: input.article.author },
      { property: 'article:section', content: input.article.section },
    )
  }
  return {
    meta,
    links: [{ rel: 'canonical', href: url }],
  }
}

// ---------- JSON-LD builders ----------

export const ORG_ID = `${SITE.url}/#org`
export const WEBSITE_ID = `${SITE.url}/#website`
export const APP_ID = `${SITE.url}/#app`

export function orgGraph() {
  return [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE.name,
      url: SITE.url,
      logo: absUrl('/favicon.png'),
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE.name,
      url: SITE.url,
      publisher: { '@id': ORG_ID },
    },
  ]
}

export function softwareAppNode() {
  return {
    '@type': 'SoftwareApplication',
    '@id': APP_ID,
    name: SITE.name,
    url: SITE.url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    description: SITE.description,
    offers: [
      { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Pro', price: '12', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Studio', price: '29', priceCurrency: 'USD' },
    ],
    provider: { '@id': ORG_ID },
  }
}

export function faqNode(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  }
}

export function breadcrumbNode(crumbs: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.path),
    })),
  }
}

export function articleNode(opts: {
  title: string
  description: string
  path: string
  date: string
  author: string
  image?: string
}) {
  return {
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: absUrl(opts.path),
    datePublished: opts.date,
    dateModified: opts.date,
    image: opts.image ?? OG_COVER_URL,
    author: { '@type': 'Organization', name: opts.author, url: SITE.url },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: absUrl(opts.path),
  }
}

export function graph(...nodes: unknown[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.flat() })
}
