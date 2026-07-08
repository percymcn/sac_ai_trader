import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { Media } from '@higgsfield/quanta/media'
import { Modal } from '@higgsfield/quanta/modal'
import { toast } from '@higgsfield/quanta/sonner'
import DeleteIcon from '@material-symbols/svg-400/outlined/delete.svg?react'
import { PublicPage } from '../../components/public-page'
import { login, useCurrentUser } from '../../components/use-current-user'
import { buildHead } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import {
  getBoard,
  removeFromBoard,
  deleteBoard,
  type BoardRow,
  type BoardItemRow,
} from '../../lib/api/boards.functions'

export const Route = createFileRoute('/boards/$id')({
  head: () =>
    buildHead({
      title: pageTitle('Board'),
      description: 'A FlxioAI Vision project board.',
      path: '/boards',
      noindex: true,
    }),
  component: BoardDetailPage,
})

function BoardDetailPage() {
  const { id } = Route.useParams()
  const { state: authState } = useCurrentUser()
  const navigate = useNavigate()
  const [board, setBoard] = useState<BoardRow | null>(null)
  const [items, setItems] = useState<BoardItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = async () => {
    try {
      const res = await getBoard({ data: { id } })
      if (res.ok) {
        setBoard(res.board)
        setItems(res.items)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authState === 'signed-in') void load()
    if (authState === 'signed-out') setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState, id])

  if (authState === 'signed-out') {
    return (
      <PublicPage>
        <div className="grid min-h-60 place-items-center rounded-lg border border-q-border-subtle bg-q-background-secondary p-6 text-center">
          <div className="grid max-w-sm gap-3">
            <h1 className="text-q-title-md-semi-bold">Sign in to view this board</h1>
            <div>
              <Button onClick={() => login(`/boards/${id}`)}>Sign in</Button>
            </div>
          </div>
        </div>
      </PublicPage>
    )
  }

  return (
    <PublicPage>
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <Link to="/boards" className="text-q-body-sm-regular text-q-text-tertiary hover:text-q-text-secondary">
              ← All boards
            </Link>
            <h1 className="text-q-headline-sm-semi-bold">{board?.name ?? 'Board'}</h1>
          </div>
          <Button variant="dangerSoft" size="sm" onClick={() => setConfirmDelete(true)}>
            <DeleteIcon width={16} height={16} aria-hidden />
            Delete board
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-q-background-secondary" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-10 text-center">
            <p className="text-q-title-sm-semi-bold">This board is empty</p>
            <p className="max-w-sm text-q-body-sm-regular text-q-text-secondary">
              Add shots from the studio feed with the + button on any result.
            </p>
            <Link to="/studio">
              <Button variant="tertiary" size="sm">
                Open the studio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <div key={item.id} className="grid gap-2">
                <Media.Root ratio={item.media_type === 'video' ? 'video' : 'square'} rounded="lg">
                  {item.media_type === 'video' && item.raw_url ? (
                    <Media.Video src={item.raw_url} poster={item.preview_url ?? undefined} controls playsInline />
                  ) : item.preview_url || item.raw_url ? (
                    <Media.Image src={item.preview_url ?? item.raw_url ?? ''} alt={item.prompt ?? 'Saved shot'} />
                  ) : (
                    <Media.Fallback>
                      <p className="p-4 text-q-body-sm-regular text-q-text-secondary">Preview unavailable</p>
                    </Media.Fallback>
                  )}
                </Media.Root>
                <div className="flex items-center justify-between gap-2 px-1">
                  <p className="truncate text-q-body-sm-regular text-q-text-secondary" title={item.prompt ?? ''}>
                    {item.prompt ?? item.model ?? 'Shot'}
                  </p>
                  <Button
                    variant="ghost"
                    size="xs"
                    iconOnly
                    aria-label="Remove from board"
                    onClick={async () => {
                      const res = await removeFromBoard({ data: { itemId: item.id } })
                      if (res.ok) {
                        setItems(prev => prev.filter(i => i.id !== item.id))
                        toast.success('Removed')
                      }
                    }}
                  >
                    <DeleteIcon width={14} height={14} aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={confirmDelete} onOpenChange={setConfirmDelete} title="Delete this board?">
        <div className="grid gap-4">
          <p className="text-q-body-sm-regular text-q-text-secondary">
            This removes the board and its saved references. Your generations themselves stay in your
            history.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="tertiary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                const res = await deleteBoard({ data: { id } })
                if (res.ok) {
                  toast.success('Board deleted')
                  void navigate({ to: '/boards' })
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </PublicPage>
  )
}
