// Programmatic long-tail Q&A pages (/answers/[slug]). Each entry renders a
// dedicated indexable page with a direct answer (GEO-optimized), related
// internal links, and a CTA into the studio. Grouped by topic cluster.

export interface AnswerEntry {
  slug: string
  question: string
  answer: string // 2-4 sentence direct answer (first paragraph of the page)
  detail: string // supporting paragraph(s)
  cluster: 'basics' | 'pricing' | 'models' | 'craft' | 'business' | 'comparisons'
  related: string[] // internal paths
}

const A = (
  slug: string,
  question: string,
  answer: string,
  detail: string,
  cluster: AnswerEntry['cluster'],
  related: string[],
): AnswerEntry => ({ slug, question, answer, detail, cluster, related })

export const ANSWERS: AnswerEntry[] = [
  // ---- Basics cluster ----
  A('what-is-ai-video-generation', 'What is AI video generation?',
    'AI video generation is the process of creating video clips from text descriptions or reference images using generative models. You describe a scene — subject, motion, camera, lighting — and the model renders a short clip, typically 5–10 seconds, in about a minute.',
    'Modern engines like Seedance 2.0, Kling 3.0, and Veo 3.1 handle realistic physics, coherent characters, and cinematic camera language. Quality depends heavily on prompt craft, which is why FlxioAI Vision ships director presets that encode professional prompt patterns.',
    'basics', ['/studio', '/presets', '/blog/ai-video-generation-guide']),
  A('how-long-can-ai-videos-be', 'How long can AI-generated videos be?',
    'Most frontier AI video models generate 5–10 second clips per run; Kling can extend to longer takes. Longer videos are made by generating multiple shots and cutting them together in an editor.',
    'This shot-based workflow mirrors real filmmaking: features are built from 3–8 second shots. Boards in FlxioAI Vision keep a project’s shots organized so assembly is fast.',
    'basics', ['/models/kling-3-0', '/answers/how-to-make-long-ai-videos', '/studio']),
  A('how-to-make-long-ai-videos', 'How do I make long videos with AI?',
    'Break the story into shots, generate each 5–10 second shot separately, then assemble them in any video editor. Use remix to keep style consistent across shots.',
    'Professional AI films are edited, not generated in one pass. Generate an establishing shot, coverage, and inserts; keep the same preset and engine for a consistent grade; export and cut to your soundtrack.',
    'basics', ['/presets', '/use-cases/filmmakers-previz', '/answers/how-long-can-ai-videos-be']),
  A('text-to-video-vs-image-to-video', 'What is the difference between text-to-video and image-to-video?',
    'Text-to-video generates a clip purely from a written description, while image-to-video animates an existing image you provide. Image-to-video gives you exact control over the starting frame; text-to-video gives the model more creative freedom.',
    'Use image-to-video when brand accuracy matters (products, characters, real locations) and text-to-video for exploration. FlxioAI Vision supports both — attach an image in the composer to switch modes.',
    'basics', ['/studio', '/use-cases/ecommerce-product-video', '/models/seedance-2-0']),
  A('do-ai-videos-have-watermarks', 'Do AI-generated videos have watermarks?',
    'It depends on the platform and plan. FlxioAI Vision renders clean output — your downloads carry no visible watermark on any plan.',
    'Some platforms watermark free-tier output (Luma, Pika historically) or embed invisible provenance signals (Google’s SynthID). Invisible provenance is good practice and doesn’t affect how your content looks.',
    'basics', ['/pricing', '/vs/luma-dream-machine', '/answers/can-i-use-ai-video-commercially']),
  A('how-fast-is-ai-video-generation', 'How fast is AI video generation?',
    'Fast engines like Wan 2.7 and Grok Imagine return clips in under a minute; cinematic engines like Kling 3.0 and Veo 3.1 take a few minutes per shot.',
    'Speed scales with resolution, duration, and queue load. A practical workflow: draft on a fast engine, then re-run the winning prompt on a cinematic engine — remix makes this a one-click move.',
    'basics', ['/models/wan-2-7', '/models/kling-3-0', '/studio']),
  A('what-are-ai-video-credits', 'What are credits in AI video generators?',
    'Credits are the billing unit for generation compute: each run consumes credits based on the model, duration, and resolution. A 5-second standard clip might cost a handful of credits while a premium 1080p clip costs more.',
    'The industry problem is opacity — most platforms make you learn costs by burning credits. FlxioAI Vision shows the exact credit cost in the generate button before every run.',
    'pricing', ['/pricing', '/answers/why-do-ai-video-costs-vary', '/vs/higgsfield']),
  A('why-do-ai-video-costs-vary', 'Why do AI video generation costs vary so much?',
    'Costs track GPU time: longer duration, higher resolution, and heavier models consume more compute. A 10-second 1080p clip on a frontier model can cost 5–10× a 5-second 720p draft.',
    'That is why cost previews matter — you should decide the trade-off per shot, not discover it on your bill. FlxioAI Vision surfaces the price of every configuration live in the composer.',
    'pricing', ['/answers/what-are-ai-video-credits', '/pricing', '/blog/ai-video-pricing-explained']),
  A('cheapest-way-to-generate-ai-video', 'What is the cheapest way to generate AI video?',
    'Draft on fast, low-cost engines (Wan 2.7), keep durations short, use 720p while iterating, and only re-render finals at high resolution on premium engines.',
    'Batch mode also reduces waste: generating four variants at once and picking the best beats serially re-prompting. The FlxioAI Vision pricing page publishes the full cost logic — no hidden math.',
    'pricing', ['/pricing', '/models/wan-2-7', '/answers/why-do-ai-video-costs-vary']),
  // ---- Models cluster ----
  A('best-ai-model-for-cinematic-video', 'What is the best AI model for cinematic video?',
    'Seedance 2.0 and Kling 3.0 lead for cinematic motion in 2026: Seedance for camera language and prompt adherence at low cost, Kling for physics and longer takes.',
    'The honest answer is per-shot: dialogue and ambience favor Veo 3.1; fast stylized cuts favor Wan 2.7. FlxioAI Vision puts them in one composer so the model becomes a per-shot decision, not a platform commitment.',
    'models', ['/models/seedance-2-0', '/models/kling-3-0', '/best/ai-video-generator']),
  A('best-ai-model-for-text-in-images', 'Which AI model renders text in images best?',
    'GPT Image 2 is the strongest model for readable text in images — posters, thumbnails, packaging, and UI mockups render with accurate spelling and layout.',
    'For type-heavy work, prompt with the exact string in quotes and keep other text minimal. The Billboard Poster preset in FlxioAI Vision encodes this pattern.',
    'models', ['/models/gpt-image-2', '/presets/billboard-poster', '/use-cases/youtube-creators']),
  A('best-ai-model-for-portraits', 'What is the best AI model for portraits?',
    'Soul V2 specializes in fashion-grade portraits with a signature editorial aesthetic; Nano Banana 2 wins for photoreal consistency across a series of shots.',
    'Pick Soul V2 for style-forward single portraits, Nano Banana 2 for character consistency (sheets, avatar sets), and pair with Rembrandt Light or Editorial Cover presets.',
    'models', ['/models/soul-v2', '/models/nano-banana-2', '/presets/editorial-cover']),
  A('seedance-vs-kling', 'Seedance vs Kling: which should I use?',
    'Use Seedance 2.0 for camera-forward cinematic shots and rapid iteration at low cost; use Kling 3.0 when physics accuracy, human motion, or longer duration matters most.',
    'Their strengths barely overlap, which is exactly why a multi-engine studio wins: run the same prompt on both and pick per shot. Remix in FlxioAI Vision makes the A/B one click.',
    'comparisons', ['/models/seedance-2-0', '/models/kling-3-0', '/vs/kling']),
  A('veo-vs-sora', 'Veo vs Sora: which is better?',
    'Veo 3.1 leads on native audio and cinematic scene direction; Sora 2 leads on scene coherence and physics comedy. Both are capped by their host platforms’ plan limits.',
    'FlxioAI Vision includes Veo 3.1 Lite alongside five other engines with transparent per-shot pricing — a practical alternative to juggling ChatGPT and Gemini subscriptions.',
    'comparisons', ['/models/veo-3-1-lite', '/vs/sora', '/vs/veo-flow']),
  // ---- Craft cluster ----
  A('how-to-write-ai-video-prompts', 'How do I write good AI video prompts?',
    'Structure prompts like a shot description: subject and action, camera move, lens/framing, lighting, mood, and style. “Slow dolly-in on a detective in a dim office, 35mm, venetian-blind shadows, noir grade” beats “cool detective video.”',
    'Every director preset in FlxioAI Vision is a worked example of this structure — open one, read its template, and you’re learning professional prompt craft.',
    'craft', ['/presets', '/blog/cinematic-prompt-writing', '/studio']),
  A('how-to-keep-ai-characters-consistent', 'How do I keep characters consistent across AI generations?',
    'Use reference images (image-to-video / image edits), keep a fixed descriptive block for the character in every prompt, and reuse the same engine and seed-style settings via remix.',
    'Nano Banana 2 is the strongest consistency engine for stills; for video, start each shot from a consistent keyframe image. The Character Sheet preset builds the reference set.',
    'craft', ['/presets/character-sheet', '/models/nano-banana-2', '/answers/text-to-video-vs-image-to-video']),
  A('what-are-camera-moves-in-ai-video', 'What camera moves can AI video models do?',
    'Modern engines execute dolly-ins, orbits, crane reveals, FPV flythroughs, crash zooms, and tracking shots when the prompt names them precisely.',
    'The trick is cinematography vocabulary — models were trained on footage described in film language. FlxioAI Vision’s camera preset pack encodes each move’s exact phrasing.',
    'craft', ['/presets/slow-dolly-in', '/presets/fpv-flythrough', '/blog/camera-moves-ai-video']),
  A('best-aspect-ratio-for-ai-video', 'What aspect ratio should I use for AI video?',
    'Match the destination: 9:16 for TikTok/Reels/Shorts, 16:9 for YouTube, 1:1 for feeds and product tiles, 21:9 for cinematic looks.',
    'Generate natively in the target ratio rather than cropping — composition changes with the frame. Presets in FlxioAI Vision default to the right ratio for their use case.',
    'craft', ['/studio', '/use-cases/social-media-managers', '/answers/how-to-write-ai-video-prompts']),
  A('how-to-make-ai-video-loop', 'How do I make an AI video loop seamlessly?',
    'Prompt for cyclical motion (“seamless loop, end matches start”), keep the camera locked or orbital, and avoid one-way actions like walking out of frame.',
    'Loops dominate on Spotify Canvas, ambient screens, and social. The Satisfying Loop preset is tuned for this: rhythmic motion, locked framing, loop-friendly subjects.',
    'craft', ['/presets/satisfying-loop', '/use-cases/music-artists', '/studio']),
  // ---- Business cluster ----
  A('can-i-use-ai-video-commercially', 'Can I use AI-generated video commercially?',
    'Generally yes — major model providers grant commercial usage rights for outputs, subject to their content policies. Always check the specific model’s terms for your use case.',
    'Each FlxioAI Vision model guide summarizes the provider’s stance. For client work, keep your prompts and generation history — boards give you a paper trail per project.',
    'business', ['/models', '/use-cases/marketing-agencies', '/answers/who-owns-ai-generated-content']),
  A('who-owns-ai-generated-content', 'Who owns AI-generated content?',
    'You own your use of the outputs under most providers’ terms, but pure AI output may not qualify for copyright protection in some jurisdictions without human creative input.',
    'Practical guidance: document your creative direction (prompts, edits, selection) — that human authorship strengthens your position. This is general information, not legal advice.',
    'business', ['/answers/can-i-use-ai-video-commercially', '/blog/ai-content-rights', '/about']),
  A('is-ai-video-good-for-ads', 'Is AI video good enough for real ads?',
    'Yes — AI product and lifestyle shots now run in paid social at scale, and for many formats they outperform stock footage because they match the brief exactly.',
    'Where AI still struggles (perfect logo fidelity, long continuous takes), use image-to-video from real product photos. The ad preset pack encodes commercial lighting and motion patterns.',
    'business', ['/use-cases/ecommerce-product-video', '/presets/product-hero-spin', '/vs/freepik']),
  A('how-do-agencies-use-ai-video', 'How do marketing agencies use AI video?',
    'Agencies use AI video for concept pitches, campaign variants, animatics, and social-first deliverables — compressing weeks of production into days.',
    'The winning pattern: boards per client, an approved “look” locked via remix, batch mode for variant matrices, and share pages for client review links.',
    'business', ['/use-cases/marketing-agencies', '/pricing', '/blog/agency-ai-workflow']),
  // ---- Comparison cluster (page-level long-tail) ----
  A('best-higgsfield-alternative', 'What is the best Higgsfield alternative?',
    'FlxioAI Vision is the strongest Higgsfield alternative for creators who want the same frontier engines with transparent per-shot pricing, editable director presets instead of black-box effects, and permanent shareable result pages.',
    'Other options: Runway for timeline post-production, Kling direct for cheap physics-accurate clips, Freepik for bulk volume. See the full honest comparison on our versus page.',
    'comparisons', ['/vs/higgsfield', '/best/higgsfield-alternative', '/pricing']),
  A('best-runway-alternative', 'What is the best Runway alternative?',
    'For most creators, FlxioAI Vision — you trade Runway’s timeline tools for multi-engine choice, director presets, per-shot cost previews, and a much gentler learning curve.',
    'Filmmakers embedded in Runway’s editor should stay; everyone whose job is “great shots, fast” gets there quicker here. Full breakdown on the versus page.',
    'comparisons', ['/vs/runway', '/best/runway-alternative', '/studio']),
  A('best-free-ai-video-generator', 'What is the best free AI video generator?',
    'FlxioAI Vision’s Free plan is among the most complete: full studio, every engine, 20 presets, cost previews, and share pages — you only pay for generation compute you actually use.',
    'Alternatives with free allowances: Hailuo (daily credits), Luma (monthly free generations), Vidu. Most cap models, watermark output, or expire credits — check the fine print.',
    'comparisons', ['/pricing', '/vs/hailuo', '/best/ai-video-generator']),
  A('ai-video-generator-without-subscription', 'Is there an AI video generator without a subscription?',
    'Yes — FlxioAI Vision’s Free plan has no subscription requirement: sign in and generate, paying only per-shot compute costs shown before every run.',
    'Subscription tiers exist for workflow power (batch, all presets, unlimited boards) but model access is never paywalled.',
    'comparisons', ['/pricing', '/answers/what-are-ai-video-credits', '/studio']),
]

export const ANSWER_CLUSTERS: { id: AnswerEntry['cluster']; label: string }[] = [
  { id: 'basics', label: 'AI video basics' },
  { id: 'pricing', label: 'Credits & pricing' },
  { id: 'models', label: 'Model selection' },
  { id: 'craft', label: 'Prompt craft' },
  { id: 'business', label: 'Business & rights' },
  { id: 'comparisons', label: 'Comparisons' },
]

export function getAnswer(slug: string): AnswerEntry | undefined {
  return ANSWERS.find(a => a.slug === slug)
}
