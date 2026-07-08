import type { BlogCategory, BlogPost } from './blog-types'
import { BLOG_POSTS_1 } from './blog-posts-1'
import { BLOG_POSTS_2 } from './blog-posts-2'
import { BLOG_POSTS_3 } from './blog-posts-3'

export type { BlogPost, BlogSection, BlogCategory } from './blog-types'
export { BLOG_CATEGORIES } from './blog-types'

export const BLOG_POSTS: BlogPost[] = [...BLOG_POSTS_1, ...BLOG_POSTS_2, ...BLOG_POSTS_3]
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

export function postsByCategory(cat: BlogCategory): BlogPost[] {
  return BLOG_POSTS.filter(p => p.category === cat)
}
