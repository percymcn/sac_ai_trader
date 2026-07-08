// Inline navigation row — part of the page content flow (apps render inside
// the Higgsfield host chrome, so this is deliberately NOT an app bar: no
// logo block, no account controls, just wayfinding links).
import { Link, useRouterState } from '@tanstack/react-router'
import { NAV_LINKS, SITE } from '../data/site'

export function SiteNav() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  return (
    <nav aria-label="Site" className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-q-border-subtle pb-3">
        <Link
          to="/"
          className="text-q-label-lg-semi-bold text-q-text-primary hover:text-q-text-secondary"
        >
          {SITE.name}
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {NAV_LINKS.map(link => {
            const active = pathname === link.to || pathname.startsWith(`${link.to}/`)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={
                  active
                    ? 'text-q-body-sm-regular text-q-text-primary underline underline-offset-4'
                    : 'text-q-body-sm-regular text-q-text-secondary hover:text-q-text-primary'
                }
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
