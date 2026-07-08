// One-tap sharing: Web Share API on capable devices + per-network fallbacks.
import { useState } from 'react'
import { Button } from '@higgsfield/quanta/button'
import { toast } from '@higgsfield/quanta/sonner'
import ShareIcon from '@material-symbols/svg-400/outlined/share.svg?react'
import DownloadIcon from '@material-symbols/svg-400/outlined/download.svg?react'
import LinkIcon from '@material-symbols/svg-400/outlined/link.svg?react'

interface ShareTarget {
  label: string
  buildUrl: (url: string, title: string) => string
}

const TARGETS: ShareTarget[] = [
  { label: 'X', buildUrl: (u, t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}` },
  { label: 'Facebook', buildUrl: u => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { label: 'LinkedIn', buildUrl: u => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  { label: 'WhatsApp', buildUrl: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { label: 'Reddit', buildUrl: (u, t) => `https://www.reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
]

export function ShareButtons({
  url,
  title,
  downloadUrl,
}: {
  url: string
  title: string
  downloadUrl?: string | null
}) {
  const [copying, setCopying] = useState(false)

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user dismissed the sheet — fall through silently
        return
      }
    }
    await copyLink()
  }

  const copyLink = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy — long-press the URL to copy manually')
    } finally {
      setCopying(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={nativeShare}>
        <ShareIcon width={16} height={16} aria-hidden />
        Share
      </Button>
      {TARGETS.map(target => (
        <Button
          key={target.label}
          variant="tertiary"
          size="sm"
          onClick={() => {
            window.open(target.buildUrl(url, title), '_blank', 'noopener,noreferrer,width=640,height=560')
          }}
        >
          {target.label}
        </Button>
      ))}
      <Button variant="tertiary" size="sm" onClick={copyLink} disabled={copying}>
        <LinkIcon width={16} height={16} aria-hidden />
        Copy link
      </Button>
      {downloadUrl ? (
        <a
          href={downloadUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
          aria-label={`Download ${title}`}
        >
          <Button variant="tertiary" size="sm">
            <DownloadIcon width={16} height={16} aria-hidden />
            Download
          </Button>
        </a>
      ) : null}
    </div>
  )
}
