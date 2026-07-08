// Use-case landing pages (/use-cases/[slug]) — high-intent programmatic SEO.

export interface UseCase {
  slug: string
  title: string
  audience: string
  headline: string
  intro: string
  pains: string[]
  wins: string[]
  presetSlugs: string[]
  keywords: string[]
  faq: { q: string; a: string }[]
}

export const USE_CASES: UseCase[] = [
  {
    slug: 'youtube-creators',
    title: 'AI video for YouTube creators',
    audience: 'YouTubers',
    headline: 'B-roll, intros, and thumbnails without a film crew',
    intro:
      'FlxioAI Vision gives YouTube creators cinematic B-roll, animated intros, and thumbnail art from a text prompt. Pick a director preset, describe the shot, and drop the result straight into your edit.',
    pains: [
      'Stock B-roll looks generic and everyone recognizes it',
      'Filming custom inserts costs a day per video',
      'Thumbnails need constant iteration to win CTR',
    ],
    wins: [
      'Generate custom B-roll matched to your script in minutes',
      'Batch mode renders four thumbnail concepts at once',
      'Remix a winning look across every episode for brand consistency',
    ],
    presetSlugs: ['slow-dolly-in', 'timelapse-city', 'billboard-poster', 'epic-establisher'],
    keywords: [
      'ai b-roll generator', 'ai video for youtube', 'youtube intro ai',
      'ai thumbnail generator', 'custom b roll ai', 'faceless youtube video ai',
      'ai stock footage alternative', 'cinematic b roll prompts', 'youtube automation video ai',
      'ai video clips for editing',
    ],
    faq: [
      { q: 'Can I monetize videos made with FlxioAI Vision?', a: 'Yes — generations you create are yours to use in monetized content. Model-specific terms are summarized on each model guide page.' },
      { q: 'What resolution can I export?', a: 'Video engines render up to 1080p depending on the model; images render up to 2K. Download the raw file from any result card.' },
    ],
  },
  {
    slug: 'ecommerce-product-video',
    title: 'AI product videos for e-commerce',
    audience: 'e-commerce brands',
    headline: 'Studio-grade product shots without the studio',
    intro:
      'Turn a single product photo into rotating hero shots, splash macros, and unboxing clips. FlxioAI Vision’s ad presets encode the lighting and motion language of premium commercials.',
    pains: [
      'Product video shoots cost $2–10k per SKU',
      'Marketplaces demand fresh creative constantly',
      'Agencies take weeks to deliver a single cut',
    ],
    wins: [
      'Image-to-video turns your existing product photos into motion',
      'Ad presets: hero spins, liquid splashes, macro pulls, tabletop unboxings',
      'Batch mode produces variant creatives for A/B testing in one queue',
    ],
    presetSlugs: ['product-hero-spin', 'liquid-splash-macro', 'unboxing-tabletop', 'blueprint-hologram'],
    keywords: [
      'ai product video generator', 'product photo to video ai', 'ecommerce video ai',
      'ai ads generator', 'product hero shot ai', 'ai unboxing video',
      'shopify product video ai', 'amazon listing video ai', 'ai commercial maker',
      'product animation from photo',
    ],
    faq: [
      { q: 'Can I use my real product photos?', a: 'Yes — attach a product photo in the composer and the video engines animate it while preserving the product’s look.' },
      { q: 'Do the videos work for Meta and TikTok ads?', a: 'Yes. Presets support 1:1, 9:16, and 16:9 output, matching every major placement.' },
    ],
  },
  {
    slug: 'marketing-agencies',
    title: 'AI video for marketing agencies',
    audience: 'agencies',
    headline: 'Concept, pitch, and deliver in the same afternoon',
    intro:
      'Agencies use FlxioAI Vision to storyboard concepts in the morning and present moving pitches after lunch. Boards keep every client’s shots organized; remix keeps a campaign look consistent.',
    pains: [
      'Pitch decks with static mood boards lose to motion',
      'Freelance motion designers are booked out weeks',
      'Client revisions burn the production budget',
    ],
    wins: [
      'Generate campaign-grade motion for pitches at deck-building speed',
      'Boards per client keep shots, looks, and iterations organized',
      'Remix applies the approved look to every revision instantly',
    ],
    presetSlugs: ['billboard-poster', 'crane-reveal', 'editorial-cover', 'liquid-metal'],
    keywords: [
      'ai video for agencies', 'ai pitch deck video', 'agency creative ai',
      'ai storyboard motion', 'client video mockup ai', 'campaign concept ai',
      'ai mood board video', 'advertising ai generator', 'creative agency ai tools',
      'ai video pitch',
    ],
    faq: [
      { q: 'Can multiple team members use one workspace?', a: 'The Studio plan is designed for teams — shared boards and priority support. Each member signs in with their own account.' },
    ],
  },
  {
    slug: 'filmmakers-previz',
    title: 'AI pre-visualization for filmmakers',
    audience: 'filmmakers',
    headline: 'Previz that looks like dailies',
    intro:
      'Block scenes, test camera moves, and pitch investors with previz that looks like graded footage. Director presets speak your language: dolly, crane, dutch, anamorphic.',
    pains: [
      'Storyboard artists and animatics are slow and expensive',
      'Financiers struggle to see the film from static boards',
      'Testing camera language on location wastes shoot days',
    ],
    wins: [
      'Camera-move presets test dolly/crane/FPV language before the shoot',
      'Film-look presets (35mm, anamorphic, noir) preview the grade',
      'Boards organize shots by scene; share pages send clips to producers',
    ],
    presetSlugs: ['slow-dolly-in', 'crane-reveal', 'anamorphic-widescreen', 'noir-bw'],
    keywords: [
      'ai previz', 'ai previsualization film', 'ai storyboard generator video',
      'ai animatics', 'film pitch ai video', 'ai camera move test',
      'ai cinematography tool', 'previz software alternative', 'ai for filmmakers',
      'shot list visualization ai',
    ],
    faq: [
      { q: 'Can I control exact camera moves?', a: 'Presets encode the classic moves (dolly, orbit, crane, FPV) as prompt recipes you can tune. For frame-exact paths you’ll still want 3D previz; for language and mood, this is faster.' },
    ],
  },
  {
    slug: 'social-media-managers',
    title: 'AI content for social media managers',
    audience: 'social teams',
    headline: 'A month of scroll-stoppers in one afternoon',
    intro:
      'Feed the calendar without burning out. Social presets produce hooks, loops, and reaction clips in vertical formats, and batch mode fills a content calendar in one queue.',
    pains: [
      'Daily posting cadence outpaces production capacity',
      'Trends move faster than briefs get approved',
      'Vertical-first creative is an afterthought in most tools',
    ],
    wins: [
      'Social preset pack: POV hooks, satisfying loops, meme reactions',
      'Everything renders natively in 9:16',
      'Batch mode: queue a week of variations at once',
    ],
    presetSlugs: ['pov-hook', 'satisfying-loop', 'meme-reaction', 'street-interview'],
    keywords: [
      'ai for social media content', 'ai reels generator', 'ai tiktok video maker',
      'vertical ai video', 'ai content calendar', 'social media ai tools',
      'ai hook generator', 'looping video ai', 'ai shorts generator',
      'instagram reels ai',
    ],
    faq: [
      { q: 'Are results safe for brand accounts?', a: 'Engines include safety filtering, and you review every clip before it ships. Share pages are opt-in — nothing is public unless you share it.' },
    ],
  },
  {
    slug: 'music-artists',
    title: 'AI visuals for musicians',
    audience: 'musicians',
    headline: 'Music videos and canvas loops on an indie budget',
    intro:
      'Turn tracks into visuals: looping Spotify canvases, lyric-video backdrops, and full music-video sequences with a consistent aesthetic via remix.',
    pains: [
      'Music video budgets start at five figures',
      'Spotify Canvas and cover art need constant refresh',
      'Label-quality visuals gate indie growth',
    ],
    wins: [
      'Loop presets make perfect 8-second canvases',
      'Remix keeps an album’s visual identity consistent across clips',
      'Neon noir, VHS, and film looks match any genre aesthetic',
    ],
    presetSlugs: ['neon-noir', 'satisfying-loop', 'vhs-camcorder', 'liquid-metal'],
    keywords: [
      'ai music video generator', 'spotify canvas ai', 'ai visuals for musicians',
      'lyric video backgrounds ai', 'album art ai', 'music visualizer ai',
      'ai video for song', 'indie music video ai', 'ai concert visuals',
      'loop video for spotify',
    ],
    faq: [
      { q: 'Can I sync visuals to my track?', a: 'Generate clips at matching durations (5–10s) and cut them to the beat in your editor. Veo 3.1 Lite can also generate ambient audio if you want scratch sound.' },
    ],
  },
  {
    slug: 'real-estate',
    title: 'AI video for real estate',
    audience: 'realtors',
    headline: 'Cinematic property stories from listing photos',
    intro:
      'Animate listing photos into elegant camera moves, generate lifestyle establishers of the neighborhood, and produce polished vertical tours for social.',
    pains: [
      'Video tours cost hundreds per listing',
      'Static photo carousels underperform on social',
      'Drone shoots need permits, weather, and scheduling',
    ],
    wins: [
      'Image-to-video pans and dollies from your listing photos',
      'Golden-hour and interior presets set the lifestyle mood',
      'Vertical output ready for Reels and TikTok listings',
    ],
    presetSlugs: ['golden-hour', 'cozy-interior', 'crane-reveal', 'slow-dolly-in'],
    keywords: [
      'ai real estate video', 'listing photo to video', 'property video ai',
      'real estate reels ai', 'ai home tour video', 'zillow listing video ai',
      'ai drone shot real estate', 'realtor marketing ai', 'property cinematic video',
      'ai video from photos',
    ],
    faq: [
      { q: 'Do AI shots misrepresent the property?', a: 'Use image-to-video on real listing photos for truthful motion, and clearly label generated lifestyle/mood shots — the tool fits both workflows.' },
    ],
  },
  {
    slug: 'game-developers',
    title: 'AI cinematics for game developers',
    audience: 'game devs',
    headline: 'Trailers, key art, and mood pieces before the engine build',
    intro:
      'Indie studios use FlxioAI Vision for concept trailers, Steam capsule art, and pitch cinematics — testing the fantasy before committing engine time.',
    pains: [
      'Cinematic trailers cost more than some indie budgets',
      'Steam capsules and key art make or break wishlists',
      'Publishers want to feel the game’s mood early',
    ],
    wins: [
      'World presets produce establishing shots of your game’s setting',
      'Pixel-art and stylized presets match in-game aesthetics',
      'Key art via GPT Image 2 renders readable logo text',
    ],
    presetSlugs: ['epic-establisher', 'pixel-art-scene', 'fpv-flythrough', 'blueprint-hologram'],
    keywords: [
      'ai game trailer', 'ai key art generator', 'steam capsule ai',
      'game cinematic ai', 'indie game trailer ai', 'ai concept art video',
      'game pitch video ai', 'ai mood piece game', 'pixel art ai generator',
      'game marketing ai',
    ],
    faq: [
      { q: 'Can it match my game’s art style?', a: 'Attach screenshots as reference images and use stylized presets (pixel art, claymation, blueprint) or describe your style — remix locks it in across shots.' },
    ],
  },
]

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find(u => u.slug === slug)
}
