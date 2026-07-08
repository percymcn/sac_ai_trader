// FAQ content blocks. Rendered visibly with <FaqBlock> and emitted as
// FAQPage JSON-LD on the pages that show them.

export interface FaqItem {
  q: string
  a: string
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: 'What is FlxioAI Vision?',
    a: 'FlxioAI Vision is a cinematic AI studio. You describe a shot (or pick a director preset), choose an engine like Seedance 2.0, Kling 3.0, or GPT Image 2, see the exact credit cost, and generate images or videos you can organize, remix, and share.',
  },
  {
    q: 'Is FlxioAI Vision free to use?',
    a: 'Yes. The Free plan includes the full studio, every engine, 20 core presets, cost previews, boards, and public share pages. Pro ($12/mo) and Studio ($29/mo) unlock batch mode, all presets, and unlimited organization.',
  },
  {
    q: 'Which AI models does it use?',
    a: 'Image engines: GPT Image 2, Nano Banana 2, Seedream 4.5, and Soul V2. Video engines: Seedance 2.0, Kling 3.0, Veo 3.1 Lite, Wan 2.7, and Grok Imagine. You can run the same prompt on different engines and compare.',
  },
  {
    q: 'How is pricing different from other AI video tools?',
    a: 'Every generation shows its exact credit cost before you run it — no surprise burn. Plans gate workflow features (batch, boards, presets), not access to models.',
  },
  {
    q: 'Do I own what I generate?',
    a: 'You can use your generations commercially in line with each model provider’s terms — each model guide page summarizes them. Your shots stay private unless you explicitly share them.',
  },
  {
    q: 'What makes results shareable?',
    a: 'Any result can be published to a permanent page at flxiovision.higgsfield.app/r/… with a branded social card, one-tap sharing to X, WhatsApp, Reddit and more, and a “make your own” remix button.',
  },
]

export const PRICING_FAQ: FaqItem[] = [
  {
    q: 'What do FlxioAI Vision plans actually gate?',
    a: 'Workflow power, not model access. Every plan can use every engine. Pro and Studio raise batch size (4 and 10 prompts per queue), unlock the full preset library, unlimited boards and history, and badge-free share pages.',
  },
  {
    q: 'How does generation compute get billed?',
    a: 'Generations run on your connected account credits, and the composer shows the exact credit cost of every shot before you confirm it. There are no hidden multipliers — what you see is what a shot costs.',
  },
  {
    q: 'Can I cancel or switch plans anytime?',
    a: 'Yes. Upgrades apply immediately; downgrades apply at the end of the billing period. Manage or cancel from the Billing page — no email required.',
  },
  {
    q: 'Is there an annual discount?',
    a: 'Yes — Pro annual is $99/year (about 31% off monthly) and Studio annual is $249/year (about 28% off).',
  },
  {
    q: 'Do unused plan benefits roll over?',
    a: 'Plan features are always-on capabilities, not consumables — there is nothing to lose at the end of a month.',
  },
  {
    q: 'What happens when Stripe live keys are added?',
    a: 'The checkout, upgrade, and billing-portal flows are fully wired for Stripe. In test mode you can exercise the whole upgrade flow without a card; dropping in live keys switches the same flow to real payments.',
  },
]

export const STUDIO_FAQ: FaqItem[] = [
  {
    q: 'How do director presets work?',
    a: 'A preset is a transparent recipe: a prompt template, a recommended engine, and tuned settings. Type your subject, and the preset assembles a cinematic prompt you can inspect and edit before generating.',
  },
  {
    q: 'What is remix?',
    a: 'Remix loads any past shot’s full recipe — prompt, engine, settings — back into the composer so you can change one thing and re-run. It’s how you keep a consistent look across a campaign.',
  },
  {
    q: 'What is batch mode?',
    a: 'Batch mode queues multiple prompts in one submission (4 on Pro, 10 on Studio). Perfect for thumbnail options, A/B ad variants, and shot lists.',
  },
]
