import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../components/public-page'
import { buildHead } from '../lib/seo'
import { pageTitle, SITE } from '../data/site'

export const Route = createFileRoute('/privacy')({
  head: () =>
    buildHead({
      title: pageTitle('Privacy Policy'),
      description: `How ${SITE.name} handles your data: what we store, why, and your choices.`,
      path: '/privacy',
      robots: 'index, nofollow',
    }),
  component: PrivacyPage,
})

const SECTIONS: { h2: string; body: string[] }[] = [
  {
    h2: 'What we collect',
    body: [
      'Account identity comes from your platform sign-in — we never see or store your password. Our product database stores: your plan and billing state, the recipes of generations you run through this app (prompt, engine, settings, preset), boards you create, shares you publish, votes you cast, and messages you send via the contact form.',
    ],
  },
  {
    h2: 'What we do with it',
    body: [
      'Recipes power your history, remix, and boards. Share records power the public pages you explicitly publish. Billing state powers plan gates and (when live keys are configured) Stripe subscriptions. We do not sell your data, and we do not use your private prompts or media for marketing.',
    ],
  },
  {
    h2: 'What is public',
    body: [
      'Nothing, by default. Publishing a share page makes that shot — including its title, media, and prompt — publicly visible and indexable, which is the point of sharing. You can delete a share at any time from its page or your studio, which removes the public page.',
    ],
  },
  {
    h2: 'Generation processing',
    body: [
      'Generation requests are processed by the platform’s model providers under their terms. Safety filtering is applied by the providers. Media files you upload as references are transmitted to the generation service to fulfill your request.',
    ],
  },
  {
    h2: 'Payments',
    body: [
      'When Stripe billing is active, payment details are collected and processed by Stripe — card numbers never touch our servers. In test mode, no payment data exists at all.',
    ],
  },
  {
    h2: 'Retention and deletion',
    body: [
      'Recipes, boards, and shares persist until you delete them. To request full account-data deletion, use the contact form and we will remove your product records.',
    ],
  },
  {
    h2: 'Changes',
    body: [
      'We will update this page when practices change; material changes will be flagged on the site. Questions: use the contact page.',
    ],
  },
]

function PrivacyPage() {
  return (
    <PublicPage>
      <article className="mx-auto grid w-full max-w-3xl gap-6">
        <h1 className="text-q-headline-md-semi-bold">Privacy policy</h1>
        <p className="text-q-body-sm-regular text-q-text-tertiary">Last updated: July 8, 2026</p>
        {SECTIONS.map(s => (
          <section key={s.h2} className="grid gap-2">
            <h2 className="text-q-title-sm-semi-bold">{s.h2}</h2>
            {s.body.map(p => (
              <p key={p.slice(0, 24)} className="text-q-body-md-regular leading-relaxed text-q-text-secondary">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </PublicPage>
  )
}
