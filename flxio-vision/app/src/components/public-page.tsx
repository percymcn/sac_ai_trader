import { SiteNav } from './site-nav'
import { SiteFooter } from './site-footer'

export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-q-background-primary text-q-text-primary">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">{children}</main>
      <SiteFooter />
    </div>
  )
}
