import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { PublicPage } from '../../components/public-page'
import { StructuredData } from '../../components/structured-data'
import { Prose } from '../../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode, articleNode } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { BLOG_CATEGORIES, BLOG_POSTS, getPost } from '../../data/blog'

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    if (!getPost(params.slug)) throw notFound()
    return { slug: params.slug }
  },
  head: ({ params }) => {
    const post = getPost(params.slug)
    if (!post) return { meta: [{ title: pageTitle('Blog') }] }
    return buildHead({
      title: pageTitle(post.title.length > 45 ? post.title.slice(0, 45).replace(/\s+\S*$/, '…') : post.title),
      description: post.description,
      path: `/blog/${post.slug}`,
      ogType: 'article',
      article: { publishedTime: post.date, author: post.author, section: post.category },
    })
  },
  component: BlogPostPage,
})

function BlogPostPage() {
  const { slug } = Route.useLoaderData() as { slug: string }
  const post = getPost(slug)!
  const category = BLOG_CATEGORIES.find(c => c.id === post.category)
  const more = BLOG_POSTS.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 2)

  const schema = graph(
    orgGraph(),
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    articleNode({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      date: post.date,
      author: post.author,
    }),
  )

  return (
    <PublicPage>
      <StructuredData json={schema} />
      <article className="mx-auto grid w-full max-w-3xl gap-8">
        <header className="grid gap-3">
          <p className="text-q-caption-sm-medium uppercase tracking-wide text-q-text-tertiary">
            <Link to="/blog" className="hover:text-q-text-secondary">Blog</Link> / {category?.label ?? post.category}
          </p>
          <h1 className="text-q-headline-md-semi-bold">{post.title}</h1>
          <p className="text-q-body-sm-regular text-q-text-tertiary">
            By {post.author} ({post.authorRole}) ·{' '}
            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ·{' '}
            {post.readMinutes} min read
          </p>
        </header>

        <aside className="grid gap-1 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4">
          <span className="text-q-label-lg-semi-bold">TL;DR</span>
          <p className="text-q-body-md-regular text-q-text-secondary">{post.tldr}</p>
        </aside>

        {post.sections.map(section => (
          <section key={section.h2} className="grid gap-3">
            <h2 className="text-q-title-md-semi-bold">{section.h2}</h2>
            {section.paragraphs.map(p => (
              <Prose key={p.slice(0, 32)} text={p} />
            ))}
            {section.bullets ? (
              <ul className="grid list-disc gap-2 pl-5">
                {section.bullets.map(b => (
                  <li key={b.slice(0, 32)} className="text-q-body-md-regular text-q-text-secondary">
                    <Prose text={b} />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="grid gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-6 text-center">
          <h2 className="text-q-title-md-semi-bold">Put this into practice</h2>
          <p className="mx-auto max-w-xl text-q-body-md-regular text-q-text-secondary">
            The studio is free: every engine, 20 director presets, and the exact cost of each shot shown
            before you run it.
          </p>
          <div className="flex justify-center">
            <Link to="/studio">
              <Button variant="marketingSecondary">Open the studio</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-q-title-sm-semi-bold">Keep reading</h2>
          <ul className="grid gap-2">
            {[...post.related.map(r => ({ label: r.label, to: r.to })), ...more.map(m => ({ label: m.title, to: `/blog/${m.slug}` }))]
              .slice(0, 4)
              .map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-q-body-md-regular text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary">
                    {l.label}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </article>
    </PublicPage>
  )
}
