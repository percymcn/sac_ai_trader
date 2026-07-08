import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { Input } from '@higgsfield/quanta/input'
import { toast } from '@higgsfield/quanta/sonner'
import { PublicPage } from '../../components/public-page'
import { login, useCurrentUser } from '../../components/use-current-user'
import { buildHead } from '../../lib/seo'
import { pageTitle } from '../../data/site'
import { listBoards, createBoard, type BoardRow } from '../../lib/api/boards.functions'

export const Route = createFileRoute('/boards/')({
  head: () =>
    buildHead({
      title: pageTitle('Boards'),
      description: 'Organize your AI shots into project boards — campaigns, clients, films.',
      path: '/boards',
      noindex: true,
    }),
  component: BoardsPage,
})

function BoardsPage() {
  const { state: authState } = useCurrentUser()
  const [boards, setBoards] = useState<BoardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const res = await listBoards()
      if (res.ok) setBoards(res.boards)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authState === 'signed-in') void load()
    if (authState === 'signed-out') setLoading(false)
  }, [authState])

  const create = async () => {
    if (!name.trim()) return
    setBusy(true)
    try {
      const res = await createBoard({ data: { name: name.trim() } })
      if (res.ok) {
        setName('')
        await load()
      } else if (res.code === 'board_limit') {
        toast.error(`Your plan includes ${res.limit} board${res.limit === 1 ? '' : 's'} — upgrade for unlimited`)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <PublicPage>
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-q-headline-sm-semi-bold">Boards</h1>
          {authState === 'signed-in' ? (
            <div className="flex items-end gap-2">
              <Input label="New board" value={name} onChange={e => setName(e.target.value)} />
              <Button variant="secondary" disabled={busy || !name.trim()} onClick={() => void create()}>
                Create
              </Button>
            </div>
          ) : null}
        </div>

        {authState === 'signed-out' ? (
          <div className="grid min-h-60 place-items-center rounded-lg border border-q-border-subtle bg-q-background-secondary p-6 text-center">
            <div className="grid max-w-sm gap-3">
              <h2 className="text-q-title-md-semi-bold">Sign in to use boards</h2>
              <p className="text-q-body-sm-regular text-q-text-secondary">
                Boards keep every project’s shots organized — campaigns, clients, films.
              </p>
              <div>
                <Button onClick={() => login('/boards')}>Sign in</Button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-q-background-secondary" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-lg border border-q-border-subtle bg-q-background-secondary p-10 text-center">
            <p className="text-q-title-sm-semi-bold">No boards yet</p>
            <p className="max-w-sm text-q-body-sm-regular text-q-text-secondary">
              Create a board above, then add shots to it from the studio feed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map(b => (
              <Link
                key={b.id}
                to="/boards/$id"
                params={{ id: b.id }}
                className="grid gap-1 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4 hover:border-q-border-primary"
              >
                <span className="text-q-title-sm-semi-bold text-q-text-primary">{b.name}</span>
                <span className="text-q-body-sm-regular text-q-text-secondary">
                  {b.item_count ?? 0} shot{(b.item_count ?? 0) === 1 ? '' : 's'} ·{' '}
                  {new Date(b.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicPage>
  )
}
