// Public community gallery + leaderboard.
import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { Tabs } from '@higgsfield/quanta/tabs'
import { Media } from '@higgsfield/quanta/media'
import { PublicPage } from '../components/public-page'
import { StructuredData } from '../components/structured-data'
import { buildHead, graph, orgGraph, breadcrumbNode } from '../lib/seo'
import { pageTitle } from '../data/site'
import { listGallery, type ShareRow } from '../lib/api/shares.functions'

const SCHEMA = graph(
  orgGraph(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
  ]),
)

export const Route = createFileRoute('/explore')({
  loader: async () => {
    const res = await listGallery({ data: { sort: 'top', mediaType: 'all', limit: 24, offset: 0 } })
    return { initial: res.ok ? res.shares : [] }
  },
  head: () =>
    buildHead({
      title: pageTitle('Explore AI Video & Image Gallery'),
      description:
        'Explore cinematic AI videos and images from the FlxioAI Vision community — vote for the best shots, read their recipes, and remix any of them.',
      path: '/explore',
    }),
  component: ExplorePage,
})

function ExplorePage() {
  const { initial } = Route.useLoaderData() as { initial: ShareRow[] }
  const [sort, setSort] = useState<'top' | 'new'>('top')
  const [shares, setShares] = useState<ShareRow[]>(initial)
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(initial.length)
  const [exhausted, setExhausted] = useState(initial.length < 24)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listGallery({ data: { sort, mediaType: 'all', limit: 24, offset: 0 } })
      .then(res => {
        if (cancelled || !res.ok) return
        setShares(res.shares)
        setOffset(res.shares.length)
        setExhausted(res.shares.length < 24)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [sort])

  const loadMore = async () => {
    setLoading(true)
    try {
      const res = await listGallery({ data: { sort, mediaType: 'all', limit: 24, offset } })
      if (res.ok) {
        setShares(prev => [...prev, ...res.shares])
        setOffset(o => o + res.shares.length)
        if (res.shares.length < 24) setExhausted(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-6">
        <header className="grid max-w-3xl gap-3">
          <h1 className="text-q-headline-md-semi-bold">Explore the community gallery</h1>
          <p className="text-q-body-md-regular text-q-text-secondary">
            Every shot below is public, permanent, and remixable — open one to read its full recipe
            (prompt, engine, preset) and make your own version.
          </p>
        </header>

        <Tabs
          value={sort}
          onValueChange={v => setSort(v as 'top' | 'new')}
          items={[
            { value: 'top', label: 'Leaderboard' },
            { value: 'new', label: 'Newest' },
          ]}
        />

        {shares.length === 0 && !loading ? (
          <div className="grid place-items-center gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-12 text-center">
            <p className="text-q-title-sm-semi-bold">The gallery is warming up</p>
            <p className="max-w-md text-q-body-sm-regular text-q-text-secondary">
              Be the first on the leaderboard: generate a shot in the studio and publish it to the
              gallery.
            </p>
            <Link to="/studio">
              <Button variant="marketingSecondary">Open the studio</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shares.map((s, i) => (
                <Link key={s.id} to="/r/$id" params={{ id: s.id }} className="group grid gap-2">
                  <Media.Root ratio={s.media_type === 'video' ? 'video' : 'square'} rounded="lg">
                    {s.media_type === 'video' ? (
                      s.thumbnail_url || s.preview_url ? (
                        <Media.Image src={s.thumbnail_url ?? s.preview_url ?? ''} alt={s.title} />
                      ) : (
                        <Media.Video src={s.raw_url} playsInline muted />
                      )
                    ) : (
                      <Media.Image src={s.preview_url ?? s.raw_url} alt={s.title} />
                    )}
                  </Media.Root>
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="truncate text-q-body-sm-regular text-q-text-secondary" title={s.title}>
                      {sort === 'top' ? `#${i + 1} · ` : ''}
                      {s.title}
                    </span>
                    <span className="text-q-caption-sm-medium text-q-text-tertiary tabular-nums">
                      ▲ {s.vote_count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {!exhausted ? (
              <div className="flex justify-center">
                <Button variant="tertiary" disabled={loading} onClick={() => void loadMore()}>
                  {loading ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </PublicPage>
  )
}
