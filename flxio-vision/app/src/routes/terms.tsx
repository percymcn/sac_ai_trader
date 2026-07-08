import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../components/public-page'
import { buildHead } from '../lib/seo'
import { pageTitle, SITE } from '../data/site'

export const Route = createFileRoute('/terms')({
  head: () =>
    buildHead({
      title: pageTitle('Terms of Service'),
      description: `The terms that govern your use of ${SITE.name}.`,
      path: '/terms',
      robots: 'index, nofollow',
    }),
  component: TermsPage,
})

const SECTIONS: { h2: string; body: string[] }[] = [
  {
    h2: '1. The service',
    body: [
      `${SITE.name} is a creative studio for generating images and video with AI models. Signing in and using the service means you accept these terms. Generation compute runs on your connected account credits under the platform's terms; ${SITE.name} plan subscriptions govern workflow features only.`,
    ],
  },
  {
    h2: '2. Your content',
    body: [
      'You retain your rights in prompts you write and, to the extent granted by the model providers, in outputs you generate. You are responsible for ensuring your prompts and uploaded reference media do not infringe others’ rights. Publishing a share page grants us a license to host and display that shot publicly until you delete it.',
    ],
  },
  {
    h2: '3. Acceptable use',
    body: [
      'Do not use the service to create content that is illegal, that impersonates real people deceptively, that infringes intellectual-property rights, or that violates the model providers’ content policies. Safety filters exist and attempting to circumvent them is a violation of these terms.',
    ],
  },
  {
    h2: '4. Plans and billing',
    body: [
      'Free plan features may change as the product evolves. Paid plans renew until cancelled; you can cancel anytime from the Billing page, effective immediately in test mode or at period end under Stripe billing. Prices may change with notice; changes never apply retroactively to an active billing period.',
    ],
  },
  {
    h2: '5. Availability and warranty',
    body: [
      'The service is provided “as is” without warranties. Generation results are probabilistic — we do not guarantee any particular output quality, and credits consumed by completed generations are not refundable. We may modify or discontinue features with reasonable notice.',
    ],
  },
  {
    h2: '6. Liability',
    body: [
      `To the maximum extent permitted by law, ${SITE.name}'s aggregate liability for any claim is limited to the amount you paid us in the twelve months preceding the claim.`,
    ],
  },
  {
    h2: '7. Contact',
    body: ['Questions about these terms: use the contact page. We answer within two business days.'],
  },
]

function TermsPage() {
  return (
    <PublicPage>
      <article className="mx-auto grid w-full max-w-3xl gap-6">
        <h1 className="text-q-headline-md-semi-bold">Terms of service</h1>
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
