// Result tile for feed/history: real previews from SafeGeneration data
// (serialized server-side with SDK selectors), with progress/failure states.
import { Media } from '@higgsfield/quanta/media'
import { Loader } from '@higgsfield/quanta/loader'
import { Button } from '@higgsfield/quanta/button'
import RefreshIcon from '@material-symbols/svg-400/outlined/refresh.svg?react'
import type { SafeGeneration } from '../lib/fnf.server'

export interface ResultCardData extends SafeGeneration {
  recipe?: {
    preset_slug: string | null
    settings_json: string
    subject: string | null
  } | null
}

export function ResultCard({
  generation,
  onRefresh,
  actions,
}: {
  generation: ResultCardData
  onRefresh?: () => void
  actions?: React.ReactNode
}) {
  const g = generation
  const isVideo = g.mediaType === 'video'

  return (
    <div className="group grid gap-2">
      <Media.Root ratio={isVideo ? 'video' : 'square'} rounded="lg">
        {g.phase === 'completed' && g.rawUrl ? (
          isVideo ? (
            <Media.Video
              src={g.rawUrl}
              poster={g.thumbnailUrl ?? g.previewUrl ?? undefined}
              controls
              playsInline
            />
          ) : (
            <Media.Image src={g.previewUrl ?? g.rawUrl} alt={g.prompt ?? 'Generated image'} />
          )
        ) : g.phase === 'failed' ? (
          <Media.Fallback>
            <div className="grid place-items-center gap-2 p-4 text-center">
              <p className="text-q-body-sm-regular text-q-text-secondary">
                {g.failureReason ?? 'Generation failed'}
              </p>
            </div>
          </Media.Fallback>
        ) : g.phase === 'completed' ? (
          <Media.Fallback>
            <div className="grid place-items-center gap-2 p-4 text-center">
              <p className="text-q-body-sm-regular text-q-text-secondary">Preview unavailable</p>
              {onRefresh ? (
                <Button variant="tertiary" size="xs" onClick={onRefresh}>
                  <RefreshIcon width={14} height={14} aria-hidden />
                  Refresh
                </Button>
              ) : null}
            </div>
          </Media.Fallback>
        ) : (
          <Media.Fallback>
            <div className="grid place-items-center gap-2 p-4 text-center">
              <Loader variant="stars" />
              <p className="text-q-caption-sm-medium text-q-text-tertiary">{g.status}</p>
            </div>
          </Media.Fallback>
        )}
      </Media.Root>
      <div className="grid gap-1 px-1">
        {g.prompt ? (
          <p className="truncate text-q-body-sm-regular text-q-text-secondary" title={g.prompt}>
            {g.prompt}
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <span className="text-q-caption-sm-medium text-q-text-tertiary">
            {g.model}
            {g.createdAt ? ` · ${new Date(g.createdAt).toLocaleDateString()}` : ''}
          </span>
          {actions}
        </div>
      </div>
    </div>
  )
}
