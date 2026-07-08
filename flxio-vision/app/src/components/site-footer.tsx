import { Link } from '@tanstack/react-router'
import { FOOTER_GROUPS, SITE } from '../data/site'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-q-border-subtle">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_GROUPS.map(group => (
            <div key={group.title} className="grid content-start gap-3">
              <h2 className="text-q-label-lg-semi-bold text-q-text-primary">{group.title}</h2>
              <ul className="grid gap-2">
                {group.links.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-q-body-sm-regular text-q-text-secondary hover:text-q-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-q-border-subtle pt-6">
          <p className="text-q-body-sm-regular text-q-text-tertiary">
            {SITE.name} — {SITE.tagline}
          </p>
          <p className="text-q-caption-sm-medium text-q-text-tertiary">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
