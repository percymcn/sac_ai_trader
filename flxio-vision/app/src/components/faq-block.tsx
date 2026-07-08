import type { FaqItem } from '../data/faqs'

export function FaqBlock({ items, title = 'Frequently asked questions' }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="grid gap-4">
      <h2 className="text-q-title-md-semi-bold text-q-text-primary">{title}</h2>
      <div className="grid gap-3">
        {items.map(item => (
          <details
            key={item.q}
            className="group rounded-lg border border-q-border-subtle bg-q-background-secondary p-4"
          >
            <summary className="cursor-pointer list-none text-q-label-lg-semi-bold text-q-text-primary [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="mt-3 max-w-3xl text-q-body-md-regular text-q-text-secondary">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
