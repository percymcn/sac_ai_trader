// FlxioAI Vision — brand + site-wide constants.
// Single source of truth for names, URLs, and shared SEO strings.

export const SITE = {
  name: 'FlxioAI Vision',
  shortName: 'FlxioAI',
  tagline: 'Direct every frame.',
  description:
    'FlxioAI Vision is a cinematic AI studio: generate images and videos with the best AI models, guided by 35+ director presets, with transparent per-shot credit costs, boards, remix, batch mode, and shareable public results.',
  url: 'https://flxiovision.higgsfield.app',
  locale: 'en_US',
  themeColor: '#0A0A0A',
  category: 'AI video generator',
  contactEmail: 'securepharma11@gmail.com',
  author: 'FlxioAI Vision Team',
} as const

/** Branded 3:2 launch cover — default OG image site-wide. */
export const OG_COVER_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_3EBuQb4r6RDvs1kC4Tr4FwmRtWL/hf_20260708_022417_5ce9333d-a1e1-4639-9a8d-89e321230572.png'

/** Lightweight webp of the launch cover for in-page rendering. */
export const COVER_MIN_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_3EBuQb4r6RDvs1kC4Tr4FwmRtWL/hf_20260708_022417_5ce9333d-a1e1-4639-9a8d-89e321230572_min.webp'

export function absUrl(path: string): string {
  if (path === '/' || path === '') return SITE.url
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`
}

/** `[Page] — [Brand]`, homepage `[Brand] — [Tagline]`; keep under 60 chars. */
export function pageTitle(page?: string): string {
  return page ? `${page} — ${SITE.shortName} Vision` : `${SITE.name} — ${SITE.tagline}`
}

export const NAV_LINKS = [
  { label: 'Studio', to: '/studio' },
  { label: 'Presets', to: '/presets' },
  { label: 'Explore', to: '/explore' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Features', to: '/features' },
  { label: 'Blog', to: '/blog' },
] as const

export const FOOTER_GROUPS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Studio', to: '/studio' },
      { label: 'Director presets', to: '/presets' },
      { label: 'Explore gallery', to: '/explore' },
      { label: 'Boards', to: '/boards' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Features', to: '/features' },
    ],
  },
  {
    title: 'Compare',
    links: [
      { label: 'FlxioAI vs Runway', to: '/vs/runway' },
      { label: 'FlxioAI vs Kling', to: '/vs/kling' },
      { label: 'FlxioAI vs Pika', to: '/vs/pika' },
      { label: 'FlxioAI vs Luma', to: '/vs/luma-dream-machine' },
      { label: 'FlxioAI vs Sora', to: '/vs/sora' },
      { label: 'All comparisons', to: '/vs' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'AI video answers', to: '/answers' },
      { label: 'Model guides', to: '/models' },
      { label: 'Use cases', to: '/use-cases' },
      { label: 'Best AI video tools', to: '/best/ai-video-generator' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms of service', to: '/terms' },
    ],
  },
]
