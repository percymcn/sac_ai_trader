// Small, dependency-safe field controls composed from Quanta primitives +
// native elements. Used where a simple segmented toggle or dropdown is enough;
// keeps the composer's control surface compile-stable across Quanta versions.
import { Button } from '@higgsfield/quanta/button'

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  ariaLabel?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-lg border border-q-border-subtle bg-q-background-primary p-1"
    >
      {options.map(o => (
        <Button
          key={o.value}
          variant={value === o.value ? 'secondary' : 'ghost'}
          size="sm"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Button>
      ))}
    </div>
  )
}

export function SelectField({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  ariaLabel?: string
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="min-h-10 cursor-pointer rounded-lg border border-q-border-subtle bg-q-background-secondary px-3 py-2 text-q-body-sm-regular text-q-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-q-border-primary"
    >
      {options.map(o => (
        <option key={o.value} value={o.value} className="bg-q-background-secondary text-q-text-primary">
          {o.label}
        </option>
      ))}
    </select>
  )
}
