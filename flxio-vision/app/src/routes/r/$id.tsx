// Public, permanent, indexable share page — the viral loop.
// SSR loader fetches the share so OG tags render per result.
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@higgsfield/quanta/button'
import { Media } from '@higgsfield/quanta/media'
import { toast } from '@higgsfield/quanta/sonner'
import ThumbUpIcon from '@material-symbols/svg-400/outlined/thumb_up.svg?react'
import Sparkles from '@/assets/icon-sparkles-soft.svg?react'
import { PublicPage } from '../../components/public-page'
import { ShareButtons } from '../../components/share-buttons'
import { StructuredData } from '../../components/structured-data'
import { login, useCurrentUser } from '../../components/use-current-user'
import { getShare, voteShare, type ShareRow } from '../../lib/api/shares.functions'
import { absUrl, OG_COVER_URL, SITE, pageTitle } from '../../data/site'
import { graph, orgGraph, breadcrumbNode } from '../../lib/seo'
import { getPreset } from '../../data/presets'
import { getModel } from '../../data/models'

export const Route = createFileRoute('/r/$id')({
  loader: async ({ params }) => {
    const res = await getShare({ data: { id: params.id } })
    return { share: res.ok ? res.share : null }
  },
  head: ({ loaderData, params }) => {
    const share = loaderData?.share
    const url = absUrl(`/r/${params.id}`)
    if (!share) {
      return {
        meta: [
          { title: pageTitle('Shot not found') },
          { name: 'robots', content: 'noindex, nofollow' },
        ],
        links: [{ rel: 'canonical', href: url }],
      }
    }
    const title = `${share.title} — made with ${SITE.name}`
    const description = share.prompt
      ? `“${share.prompt.slice(0, 140)}” — an AI ${share.media_type} made with ${SITE.name}. Remix it with one click.`
      : `An AI ${share.media_type} made with ${SITE.name}. Remix it with one click.`
    const ogImage = share.media_type === 'video' ? (share.thumbnail_url ?? share.preview_url ?? OG_COVER_URL) : (share.preview_url ?? share.raw_url)
    const meta: Record<string, string>[] = [
      { title },
      { name: 'description', content: description },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },
      { property: 'og:type', content: share.media_type === 'video' ? 'video.other' : 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: ogImage },
      { property: 'og:site_name', content: SITE.name },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ]
    if (share.media_type === 'video') {
      meta.push({ property: 'og:video', content: share.raw_url })
    }
    return { meta, links: [{ rel: 'canonical', href: url }] }
  },
  component: SharePage,
})

function SharePage() {
  const { share } = Route.useLoaderData() as { share: ShareRow | null }
  const { id } = Route.useParams()

  if (!share) {
    return (
      <PublicPage>
        <div className="grid min-h-72 place-items-center gap-4 text-center">
          <h1 className="text-q-headline-sm-semi-bold">This shot doesn’t exist (anymore)</h1>
          <p className="max-w-md text-q-body-md-regular text-q-text-secondary">
            The creator may have unpublished it. Make your own in the studio — the Free plan includes
            every engine.
          </p>
          <div className="flex justify-center">
            <Link to="/studio">
              <Button variant="marketingSecondary">Open the studio</Button>
            </Link>
          </div>
        </div>
      </PublicPage>
    )
  }

  return <ShareContent share={share} id={id} />
}

function ShareContent({ share, id }: { share: ShareRow; id: string }) {
  const { state: authState } = useCurrentUser()
  const [votes, setVotes] = useState(share.vote_count)
  const [voting, setVoting] = useState(false)
  const url = absUrl(`/r/${id}`)
  const preset = share.preset_slug ? getPreset(share.preset_slug) : undefined
  const model = getModel(share.model)

  const schema = graph(
    orgGraph(),
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Explore', path: '/explore' },
      { name: share.title, path: `/r/${id}` },
    ]),
    {
      '@type': share.media_type === 'video' ? 'VideoObject' : 'ImageObject',
      name: share.title,
      description: share.prompt ?? share.title,
      contentUrl: share.raw_url,
      thumbnailUrl: share.thumbnail_url ?? share.preview_url ?? share.raw_url,
      uploadDate: share.created_at,
      url,
    },
  )

  const vote = async () => {
    if (authState !== 'signed-in') {
      login(`/r/${id}`)
      return
    }
    setVoting(true)
    try {
      const res = await voteShare({ data: { shareId: id } })
      if (res.ok) setVotes(v => (res.voted ? v + 1 : Math.max(v - 1, 0)))
      else toast.error('Could not vote')
    } finally {
      setVoting(false)
    }
  }

  return (
    <PublicPage>
      <StructuredData json={schema} />
      <article className="mx-auto grid w-full max-w-4xl gap-6">
        <header className="grid gap-2">
          <h1 className="text-q-headline-sm-semi-bold">{share.title}</h1>
          <p className="text-q-body-sm-regular text-q-text-tertiary">
            AI {share.media_type} · {model?.name ?? share.model}
            {preset ? ` · ${preset.name} preset` : ''} · {new Date(share.created_at).toLocaleDateString()}
          </p>
        </header>

        <Media.Root ratio={share.media_type === 'video' ? 'video' : 'square'} rounded="lg">
          {share.media_type === 'video' ? (
            <Media.Video
              src={share.raw_url}
              poster={share.thumbnail_url ?? share.preview_url ?? undefined}
              controls
              playsInline
            />
          ) : (
            <Media.Image src={share.raw_url} alt={share.prompt ?? share.title} />
          )}
        </Media.Root>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <ShareButtons url={url} title={share.title} downloadUrl={share.raw_url} />
          <Button variant="tertiary" size="sm" disabled={voting} onClick={() => void vote()}>
            <ThumbUpIcon width={16} height={16} aria-hidden />
            <span className="tabular-nums">{votes}</span>
          </Button>
        </div>

        {share.prompt ? (
          <section className="grid gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4">
            <h2 className="text-q-label-lg-semi-bold">The recipe</h2>
            <p className="text-q-body-md-regular text-q-text-secondary">{share.prompt}</p>
            <p className="text-q-caption-sm-medium text-q-text-tertiary">
              Engine: {model?.name ?? share.model}
              {preset ? ` · Director preset: ${preset.name}` : ''}
            </p>
          </section>
        ) : null}

        <section className="grid gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-6 text-center">
          <h2 className="text-q-title-md-semi-bold">Make your own</h2>
          <p className="mx-auto max-w-xl text-q-body-md-regular text-q-text-secondary">
            This shot was directed in {SITE.name} — pick an engine, type a line, and see the exact cost
            before you generate. Free to start.
          </p>
          <div className="flex justify-center">
            <Link to="/studio">
              <Button variant="marketingPrimary">
                Remix this shot <Sparkles width={14} height={14} aria-hidden />
              </Button>
            </Link>
          </div>
        </section>

        <p className="text-center text-q-body-sm-regular text-q-text-tertiary">
          <Link to="/explore" className="underline underline-offset-4 hover:text-q-text-secondary">
            Explore more community shots →
          </Link>
        </p>
      </article>
    </PublicPage>
  )
}
