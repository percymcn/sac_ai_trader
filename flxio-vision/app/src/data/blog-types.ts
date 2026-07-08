export type BlogCategory = 'guides' | 'craft' | 'models' | 'business' | 'comparisons' | 'growth'

export interface BlogSection {
  h2: string
  // Paragraphs support one inline syntax: [text](/internal-path) markdown links.
  paragraphs: string[]
  bullets?: string[]
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  category: BlogCategory
  author: string
  authorRole: string
  date: string // ISO date
  readMinutes: number
  tldr: string
  sections: BlogSection[]
  related: { label: string; to: string }[]
}

export const BLOG_CATEGORIES: { id: BlogCategory; label: string }[] = [
  { id: 'guides', label: 'Guides' },
  { id: 'craft', label: 'Prompt craft' },
  { id: 'models', label: 'Models' },
  { id: 'business', label: 'Business' },
  { id: 'comparisons', label: 'Comparisons' },
  { id: 'growth', label: 'Growth' },
]
