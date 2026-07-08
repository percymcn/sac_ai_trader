import { createFileRoute, Link } from '@tanstack/react-router'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { PageIntro } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { BLOG_POSTS, BLOG_CATEGORIES } from '../../data/blog'

const SCHEMA = graph(
  orgGraph(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ]),
)

export const Route = createFileRoute('/blog/')({
  head: () =>
    buildHead({
      title: pageTitle('Blog — AI Video Craft & Strategy'),
      description:
        'Guides on AI video generation: prompt craft, camera language, model shootouts, pricing math, and creator workflows — from the FlxioAI Vision team.',
      path: '/blog',
    }),
  component: BlogIndexPage,
})

function BlogIndexPage() {
  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-10">
        <PageIntro
          eyebrow="Blog"
          title="AI video craft, priced honestly"
          lede="Practical guides from the team: prompt structure, camera vocabulary, model selection, cost math, and the workflows creators actually ship with."
        />

        <div className="flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map(c => (
            <span key={c.id} className="rounded-full border border-q-border-subtle px-3 py-1 text-q-caption-sm-medium text-q-text-secondary">
              {c.label} · {BLOG_POSTS.filter(p => p.category === c.id).length}
            </span>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {BLOG_POSTS.map(post => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="grid content-start gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5 hover:border-q-border-primary"
            >
              <span className="text-q-caption-sm-medium uppercase tracking-wide text-q-text-tertiary">
                {BLOG_CATEGORIES.find(c => c.id === post.category)?.label ?? post.category} ·{' '}
                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                {post.readMinutes} min
              </span>
              <span className="text-q-title-sm-semi-bold text-q-text-primary">{post.title}</span>
              <span className="text-q-body-sm-regular text-q-text-secondary">{post.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </PublicPage>
  )
}
