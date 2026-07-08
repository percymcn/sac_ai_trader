// The Studio — composer + live feed + history, with share/board/remix actions.
import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { Input } from '@higgsfield/quanta/input'
import { Modal } from '@higgsfield/quanta/modal'
import { Switch } from '@higgsfield/quanta/switch'
import { Loader } from '@higgsfield/quanta/loader'
import { toast } from '@higgsfield/quanta/sonner'
import ShareIcon from '@material-symbols/svg-400/outlined/share.svg?react'
import AddIcon from '@material-symbols/svg-400/outlined/add.svg?react'
import ReplayIcon from '@material-symbols/svg-400/outlined/replay.svg?react'
import { PublicPage } from '../components/public-page'
import { Composer, type ComposerPrefill, type ComposerSubmission } from '../components/composer'
import { ResultCard, type ResultCardData } from '../components/result-card'
import { FaqBlock } from '../components/faq-block'
import { StructuredData } from '../components/structured-data'
import { login, useCurrentUser } from '../components/use-current-user'
import { buildHead, graph, orgGraph, breadcrumbNode, faqNode } from '../lib/seo'
import { pageTitle, SITE, absUrl } from '../data/site'
import { STUDIO_FAQ } from '../data/faqs'
import { getHistory, getProfileSnapshot } from '../lib/api/history.functions'
import { pollGeneration } from '../lib/api/generate.functions'
import { publishShare } from '../lib/api/shares.functions'
import { listBoards, createBoard, addToBoard, type BoardRow } from '../lib/api/boards.functions'

const SCHEMA = graph(
  orgGraph(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Studio', path: '/studio' },
  ]),
  faqNode(STUDIO_FAQ),
)

export const Route = createFileRoute('/studio')({
  head: () =>
    buildHead({
      title: pageTitle('AI Studio'),
      description:
        'Generate cinematic AI video and images with Seedance 2.0, Kling 3.0, Veo 3.1 Lite, GPT Image 2 and more — with director presets, batch mode, and a live credit cost preview.',
      path: '/studio',
    }),
  component: StudioPage,
})

interface ProfilePanel {
  plan: string
  planName: string
  credits: number | null
  batchSize: number
}

function StudioPage() {
  const { state: authState } = useCurrentUser()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfilePanel | null>(null)
  const [feed, setFeed] = useState<ResultCardData[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [prefill, setPrefill] = useState<ComposerPrefill | null>(null)
  const [shareTarget, setShareTarget] = useState<ResultCardData | null>(null)
  const [boardTarget, setBoardTarget] = useState<ResultCardData | null>(null)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadAll = useCallback(async () => {
    try {
      const [snap, history] = await Promise.all([
        getProfileSnapshot(),
        getHistory({ data: { type: 'all', size: 24 } }),
      ])
      if (snap.ok) {
        setProfile({
          plan: snap.plan,
          planName: snap.planName,
          credits: snap.credits,
          batchSize: snap.limits.batchSize,
        })
      }
      if (history.ok) setFeed(history.generations as ResultCardData[])
    } catch {
      // transient — the retry button below covers it
    } finally {
      setFeedLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authState === 'signed-in') void loadAll()
    if (authState === 'signed-out') setFeedLoading(false)
  }, [authState, loadAll])

  // Poll active generations every 5s until terminal.
  useEffect(() => {
    if (pollTimer.current) clearInterval(pollTimer.current)
    const active = feed.filter(g => g.phase === 'progress' && g.id)
    if (active.length === 0) return
    pollTimer.current = setInterval(async () => {
      for (const gen of active.slice(0, 6)) {
        try {
          const res = await pollGeneration({ data: { id: gen.id } })
          if (res.ok) {
            setFeed(prev => prev.map(g => (g.id === gen.id ? { ...g, ...res.generation } : g)))
          }
        } catch {
          // keep polling on next tick
        }
      }
    }, 5000)
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [feed])

  const onSubmitted = (submission: ComposerSubmission) => {
    setFeed(prev => [
      ...submission.generations.map(g => ({ ...g, prompt: g.prompt ?? submission.prompt })),
      ...prev,
    ])
  }

  const remix = (g: ResultCardData) => {
    let settings: Record<string, string | number> | undefined
    try {
      settings = g.recipe ? (JSON.parse(g.recipe.settings_json) as Record<string, string | number>) : undefined
    } catch {
      settings = undefined
    }
    setPrefill({
      prompt: g.recipe?.subject ?? g.prompt ?? '',
      model: g.model,
      settings,
      presetSlug: g.recipe?.preset_slug ?? undefined,
    })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    toast.success('Recipe loaded — tweak and re-run')
  }

  if (authState === 'signed-out') {
    return (
      <PublicPage>
        <StructuredData json={SCHEMA} />
        <div className="grid gap-6">
          <h1 className="text-q-headline-md-semi-bold">The Studio</h1>
          <div className="grid min-h-72 place-items-center rounded-lg border border-q-border-subtle bg-q-background-secondary p-6 text-center">
            <div className="grid max-w-sm gap-3">
              <h2 className="text-q-title-md-semi-bold">Sign in to generate</h2>
              <p className="text-q-body-sm-regular text-q-text-secondary">
                Generation, uploads, credits, and history are connected to your account. The Free plan
                includes every engine and 20 director presets.
              </p>
              <div>
                <Button onClick={() => login('/studio')}>Sign in</Button>
              </div>
            </div>
          </div>
          <FaqBlock items={STUDIO_FAQ} title="How the studio works" />
        </div>
      </PublicPage>
    )
  }

  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="grid content-start gap-4">
          <div className="grid gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4">
            <h2 className="text-q-label-lg-semi-bold">Your studio</h2>
            {profile ? (
              <dl className="grid gap-1 text-q-body-sm-regular">
                <div className="flex justify-between">
                  <dt className="text-q-text-tertiary">Plan</dt>
                  <dd className="text-q-text-primary">{profile.planName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-q-text-tertiary">Credits</dt>
                  <dd className="text-q-text-primary tabular-nums">
                    {profile.credits != null ? profile.credits : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-q-text-tertiary">Batch size</dt>
                  <dd className="text-q-text-primary tabular-nums">{profile.batchSize}</dd>
                </div>
              </dl>
            ) : (
              <Loader size="xs" color="neutral" />
            )}
            {profile && profile.plan === 'free' ? (
              <Link to="/pricing" className="text-q-body-sm-regular text-q-text-primary underline underline-offset-4">
                Upgrade for batch ×4 and all presets →
              </Link>
            ) : null}
          </div>
          <nav aria-label="Studio" className="grid gap-1">
            <Link to="/boards" className="rounded-lg px-3 py-2 text-q-body-md-regular text-q-text-secondary hover:bg-q-background-secondary hover:text-q-text-primary">
              Boards
            </Link>
            <Link to="/presets" className="rounded-lg px-3 py-2 text-q-body-md-regular text-q-text-secondary hover:bg-q-background-secondary hover:text-q-text-primary">
              Director presets
            </Link>
            <Link to="/explore" className="rounded-lg px-3 py-2 text-q-body-md-regular text-q-text-secondary hover:bg-q-background-secondary hover:text-q-text-primary">
              Explore gallery
            </Link>
            <Link to="/billing" className="rounded-lg px-3 py-2 text-q-body-md-regular text-q-text-secondary hover:bg-q-background-secondary hover:text-q-text-primary">
              Billing
            </Link>
          </nav>
        </aside>

        <section className="grid content-start gap-6">
          <h1 className="text-q-headline-sm-semi-bold">Studio</h1>
          <Composer onSubmitted={onSubmitted} batchLimit={profile?.batchSize ?? 1} prefill={prefill} />

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-q-title-md-semi-bold">Your shots</h2>
              <Button variant="ghost" size="sm" onClick={() => void loadAll()}>
                Refresh
              </Button>
            </div>

            {feedLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-lg bg-q-background-secondary" />
                ))}
              </div>
            ) : feed.length === 0 ? (
              <div className="grid place-items-center gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-10 text-center">
                <p className="text-q-title-sm-semi-bold">No shots yet</p>
                <p className="max-w-sm text-q-body-sm-regular text-q-text-secondary">
                  Pick a director preset above, type a one-line subject, and your first cinematic shot
                  lands here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {feed.map(g => (
                  <ResultCard
                    key={g.id || `${g.model}-${g.createdAt}`}
                    generation={g}
                    onRefresh={() => void loadAll()}
                    actions={
                      g.phase === 'completed' && g.rawUrl ? (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="xs" iconOnly aria-label="Remix this shot" onClick={() => remix(g)}>
                            <ReplayIcon width={16} height={16} aria-hidden />
                          </Button>
                          <Button variant="ghost" size="xs" iconOnly aria-label="Add to board" onClick={() => setBoardTarget(g)}>
                            <AddIcon width={16} height={16} aria-hidden />
                          </Button>
                          <Button variant="ghost" size="xs" iconOnly aria-label="Share this shot" onClick={() => setShareTarget(g)}>
                            <ShareIcon width={16} height={16} aria-hidden />
                          </Button>
                        </div>
                      ) : null
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <ShareDialog
        target={shareTarget}
        onClose={() => setShareTarget(null)}
        onPublished={id => {
          setShareTarget(null)
          void navigate({ to: '/r/$id', params: { id } })
        }}
      />
      <BoardDialog target={boardTarget} onClose={() => setBoardTarget(null)} />
    </PublicPage>
  )
}

function ShareDialog({
  target,
  onClose,
  onPublished,
}: {
  target: ResultCardData | null
  onClose: () => void
  onPublished: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [inGallery, setInGallery] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (target) setTitle((target.prompt ?? 'My shot').slice(0, 80))
  }, [target])

  const publish = async () => {
    if (!target || !target.rawUrl) return
    setBusy(true)
    try {
      const res = await publishShare({
        data: {
          generationId: target.id,
          title: title.trim() || 'My shot',
          prompt: target.prompt ?? undefined,
          model: target.model,
          presetSlug: target.recipe?.preset_slug ?? undefined,
          mediaType: target.mediaType === 'video' ? 'video' : 'image',
          previewUrl: target.previewUrl ?? undefined,
          rawUrl: target.rawUrl,
          thumbnailUrl: target.thumbnailUrl ?? undefined,
          inGallery,
        },
      })
      if (res.ok) {
        toast.success(res.existed ? 'Already shared — opening its page' : 'Published!')
        onPublished(res.id)
      } else {
        toast.error('Could not publish — try again')
      }
    } catch {
      toast.error('Could not publish — try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal.Root open={Boolean(target)} onOpenChange={(open: boolean) => !open && onClose()}>
      <Modal.Content>
        <Modal.Header title="Publish share page" />
        <Modal.Body>
      <div className="grid gap-4">
        <p className="text-q-body-sm-regular text-q-text-secondary">
          Publishing creates a permanent public page at {absUrl('/r/…')} with your shot, its recipe, and a
          make-your-own button. Your prompt becomes visible on that page.
        </p>
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <label className="flex items-center justify-between gap-3">
          <span className="text-q-body-md-regular text-q-text-primary">Show in the public gallery</span>
          <Switch checked={inGallery} onCheckedChange={setInGallery} aria-label="Show in the public gallery" />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" disabled={busy || !title.trim()} onClick={() => void publish()}>
            {busy ? <Loader size="xs" color="neutral" /> : 'Publish'}
          </Button>
        </div>
      </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}

function BoardDialog({ target, onClose }: { target: ResultCardData | null; onClose: () => void }) {
  const [boards, setBoards] = useState<BoardRow[]>([])
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!target) return
    listBoards()
      .then(res => {
        if (res.ok) setBoards(res.boards)
      })
      .catch(() => setBoards([]))
  }, [target])

  const add = async (boardId: string) => {
    if (!target) return
    setBusy(true)
    try {
      const res = await addToBoard({
        data: {
          boardId,
          generationId: target.id,
          prompt: target.prompt ?? undefined,
          model: target.model,
          presetSlug: target.recipe?.preset_slug ?? undefined,
          mediaType: target.mediaType,
          previewUrl: target.previewUrl ?? undefined,
          rawUrl: target.rawUrl ?? undefined,
        },
      })
      if (res.ok) {
        toast.success('Added to board')
        onClose()
      } else {
        toast.error('Could not add to board')
      }
    } finally {
      setBusy(false)
    }
  }

  const createAndAdd = async () => {
    if (!newName.trim()) return
    setBusy(true)
    try {
      const res = await createBoard({ data: { name: newName.trim() } })
      if (res.ok) {
        await add(res.id)
        setNewName('')
      } else if (res.code === 'board_limit') {
        toast.error(`Free plan includes ${res.limit} board — upgrade for unlimited boards`)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal.Root open={Boolean(target)} onOpenChange={(open: boolean) => !open && onClose()}>
      <Modal.Content>
        <Modal.Header title="Add to board" />
        <Modal.Body>
      <div className="grid gap-4">
        {boards.length > 0 ? (
          <div className="grid gap-2">
            {boards.map(b => (
              <Button key={b.id} variant="tertiary" disabled={busy} onClick={() => void add(b.id)}>
                {b.name}
                <span className="text-q-caption-sm-medium text-q-text-tertiary tabular-nums">
                  {b.item_count ?? 0}
                </span>
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-q-body-sm-regular text-q-text-secondary">No boards yet — create your first:</p>
        )}
        <div className="flex items-end gap-2">
          <Input label="New board" value={newName} onChange={e => setNewName(e.target.value)} />
          <Button variant="secondary" disabled={busy || !newName.trim()} onClick={() => void createAndAdd()}>
            Create
          </Button>
        </div>
      </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
