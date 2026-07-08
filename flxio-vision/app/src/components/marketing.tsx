// Marketing building blocks shared by public pages.
import { Link } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import ArrowIcon from '@material-symbols/svg-400/outlined/arrow_forward.svg?react'
import CheckIcon from '@material-symbols/svg-400/outlined/check.svg?react'

export function PageIntro({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede: string }) {
  return (
    <header className="grid max-w-3xl gap-3">
      {eyebrow ? <p className="text-q-caption-sm-medium uppercase tracking-wide text-q-text-tertiary">{eyebrow}</p> : null}
      <h1 className="text-q-headline-md-semi-bold text-q-text-primary">{title}</h1>
      <p className="text-q-body-md-regular text-q-text-secondary">{lede}</p>
    </header>
  )
}

export function SocialProofStrip() {
  const stats = [
    { value: '9', label: 'frontier engines, one composer' },
    { value: '37', label: 'director presets across 8 packs' },
    { value: '100%', label: 'of shots show cost before running' },
    { value: '0', label: 'model paywalls on any plan' },
  ]
  return (
    <section aria-label="Highlights" className="grid grid-cols-2 gap-4 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5 md:grid-cols-4">
      {stats.map(s => (
        <div key={s.label} className="grid gap-1">
          <span className="text-q-display-md-bold text-q-text-primary tabular-nums">{s.value}</span>
          <span className="text-q-body-sm-regular text-q-text-secondary">{s.label}</span>
        </div>
      ))}
    </section>
  )
}

export function FeatureRow({
  title,
  body,
  points,
  to,
  linkLabel,
  flip = false,
  aside,
}: {
  title: string
  body: string
  points: string[]
  to: string
  linkLabel: string
  flip?: boolean
  aside?: React.ReactNode
}) {
  return (
    <section className={`grid items-center gap-6 lg:grid-cols-2 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
      <div className="grid gap-4">
        <h2 className="text-q-title-md-semi-bold text-q-text-primary">{title}</h2>
        <p className="max-w-xl text-q-body-md-regular text-q-text-secondary">{body}</p>
        <ul className="grid gap-2">
          {points.map(p => (
            <li key={p} className="flex items-start gap-2 text-q-body-md-regular text-q-text-secondary">
              <CheckIcon width={18} height={18} aria-hidden className="mt-0.5 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
        <div>
          <Link to={to}>
            <Button variant="tertiary" size="sm">
              {linkLabel}
              <ArrowIcon width={16} height={16} aria-hidden />
            </Button>
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-q-border-subtle bg-q-background-secondary p-5">{aside}</div>
    </section>
  )
}

export function CtaBand({ title, body, to, cta }: { title: string; body: string; to: string; cta: string }) {
  return (
    <section className="grid gap-4 rounded-lg border border-q-border-subtle bg-q-background-secondary p-6 text-center md:p-10">
      <h2 className="text-q-title-lg-semi-bold text-q-text-primary">{title}</h2>
      <p className="mx-auto max-w-2xl text-q-body-md-regular text-q-text-secondary">{body}</p>
      <div className="flex justify-center">
        <Link to={to}>
          <Button variant="marketingSecondary" size="md">
            {cta}
            <ArrowIcon width={16} height={16} aria-hidden />
          </Button>
        </Link>
      </div>
    </section>
  )
}

/** Renders paragraphs with [text](/path) inline-link support. */
export function Prose({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  const regex = /\[([^\]]+)\]\((\/[^)\s]*)\)/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push(
      <Link key={key++} to={match[2]} className="text-q-text-primary underline underline-offset-4 hover:text-q-text-secondary">
        {match[1]}
      </Link>,
    )
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <p className="text-q-body-md-regular leading-relaxed text-q-text-secondary">{parts}</p>
}
