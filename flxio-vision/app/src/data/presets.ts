// Director presets — FlxioAI Vision's signature feature. Each preset is a
// curated cinematic recipe: a prompt template with a {subject} slot, a
// recommended model, and tuned settings. Free plan unlocks `core` presets;
// Pro/Studio unlock all.

export type PresetCategory =
  | 'camera'
  | 'lighting'
  | 'film-look'
  | 'ads'
  | 'social'
  | 'portrait'
  | 'world'
  | 'fx'

export interface DirectorPreset {
  slug: string
  name: string
  category: PresetCategory
  kind: 'image' | 'video'
  core: boolean // available on Free
  modelId: string
  settings: Record<string, string | number>
  template: string // contains {subject}
  description: string
  exampleSubject: string
}

export const PRESET_CATEGORIES: { id: PresetCategory; label: string; blurb: string }[] = [
  { id: 'camera', label: 'Camera moves', blurb: 'Dolly, crash zoom, orbit, FPV — signature cinematic motion.' },
  { id: 'lighting', label: 'Lighting', blurb: 'Golden hour, neon noir, Rembrandt — light like a gaffer.' },
  { id: 'film-look', label: 'Film looks', blurb: '35mm, VHS, anamorphic — texture and grain of real stock.' },
  { id: 'ads', label: 'Ads & product', blurb: 'Product heroes, unboxings, food macro — commercial polish.' },
  { id: 'social', label: 'Social formats', blurb: 'Hooks, memes, vertical loops built to stop the scroll.' },
  { id: 'portrait', label: 'Portraits', blurb: 'Editorial, fashion, character sheets with consistent faces.' },
  { id: 'world', label: 'Worlds & scenes', blurb: 'Cityscapes, interiors, nature epics — establishers that sell scale.' },
  { id: 'fx', label: 'FX & stylized', blurb: 'Claymation, pixel art, liquid metal — bold stylization.' },
]

export const PRESETS: DirectorPreset[] = [
  // ---- Camera moves (video) ----
  {
    slug: 'slow-dolly-in',
    name: 'Slow Dolly In',
    category: 'camera',
    kind: 'video',
    core: true,
    modelId: 'seedance_2_0',
    settings: { mode: 'std', duration: 5, aspectRatio: '16:9', resolution: '720p', batchSize: 1 },
    template:
      'Cinematic slow dolly-in on {subject}, shallow depth of field, 35mm lens, smooth gimbal motion, dramatic key light, filmic color grade, high production value',
    description: 'The classic tension-builder: a smooth, slow push toward your subject.',
    exampleSubject: 'a detective studying a wall of clues in a dim office',
  },
  {
    slug: 'crash-zoom',
    name: 'Crash Zoom',
    category: 'camera',
    kind: 'video',
    core: true,
    modelId: 'seedance_2_0',
    settings: { mode: 'std', duration: 5, aspectRatio: '16:9', resolution: '720p', batchSize: 1 },
    template:
      'Aggressive crash zoom onto {subject}, whip-fast punch-in, motion blur, energetic handheld energy, punchy contrast, action-film grade',
    description: 'A whip-fast punch-in for comedic beats and action reveals.',
    exampleSubject: 'a cat realizing the fridge door was left open',
  },
  {
    slug: 'orbit-shot',
    name: '360 Orbit',
    category: 'camera',
    kind: 'video',
    core: true,
    modelId: 'seedance_2_0',
    settings: { mode: 'std', duration: 10, aspectRatio: '16:9', resolution: '720p', batchSize: 1 },
    template:
      'Smooth 360-degree orbit around {subject}, constant radius, cinematic parallax, volumetric light rays, epic scale, seamless camera path',
    description: 'A full orbital move that shows every angle of the subject.',
    exampleSubject: 'a sculptor’s finished marble statue in a sunlit atelier',
  },
  {
    slug: 'fpv-flythrough',
    name: 'FPV Flythrough',
    category: 'camera',
    kind: 'video',
    core: false,
    modelId: 'seedance_2_0',
    settings: { mode: 'pro', duration: 10, aspectRatio: '16:9', resolution: '720p', batchSize: 1 },
    template:
      'FPV drone flythrough of {subject}, high-speed racing drone motion, banking turns, near-miss flybys, dynamic motion blur, adrenaline pacing',
    description: 'Racing-drone energy threading through tight spaces.',
    exampleSubject: 'a neon-lit night market alley in the rain',
  },
  {
    slug: 'crane-reveal',
    name: 'Crane Reveal',
    category: 'camera',
    kind: 'video',
    core: false,
    modelId: 'kling_3_0',
    settings: { duration: 10, aspectRatio: '16:9', batchSize: 1 },
    template:
      'Sweeping crane shot rising over {subject}, grand reveal of the wider scene, golden light, epic orchestral mood, blockbuster establishing shot',
    description: 'Rise from a detail to reveal the full breathtaking scene.',
    exampleSubject: 'a lone lighthouse as a storm breaks over the coast',
  },
  {
    slug: 'dutch-tilt-tracking',
    name: 'Dutch Tracking Shot',
    category: 'camera',
    kind: 'video',
    core: false,
    modelId: 'seedance_2_0',
    settings: { mode: 'std', duration: 5, aspectRatio: '16:9', resolution: '720p', batchSize: 1 },
    template:
      'Tense lateral tracking shot with a dutch tilt following {subject}, thriller pacing, hard shadows, desaturated palette with one accent color',
    description: 'Off-kilter tension for thrillers and music videos.',
    exampleSubject: 'a courier weaving through a crowded subway platform',
  },
  // ---- Lighting ----
  {
    slug: 'golden-hour',
    name: 'Golden Hour',
    category: 'lighting',
    kind: 'image',
    core: true,
    modelId: 'seedream_v4_5',
    settings: { aspectRatio: '16:9', resolution: '1k', batchSize: 1 },
    template:
      '{subject} at golden hour, low warm sun, long soft shadows, rim light, atmospheric haze, cinematic color grade, shot on 50mm f/1.4',
    description: 'That last-light warmth every cinematographer chases.',
    exampleSubject: 'two friends on a rooftop overlooking the city',
  },
  {
    slug: 'neon-noir',
    name: 'Neon Noir',
    category: 'lighting',
    kind: 'image',
    core: true,
    modelId: 'seedream_v4_5',
    settings: { aspectRatio: '21:9', resolution: '1k', batchSize: 1 },
    template:
      '{subject} in neon noir style, rain-slick streets, cyan and magenta practical lights, deep blacks, reflective surfaces, moody cinematic atmosphere',
    description: 'Blade-runner streets: neon, rain, and shadow.',
    exampleSubject: 'a woman in a translucent raincoat under a noodle-bar sign',
  },
  {
    slug: 'rembrandt-portrait-light',
    name: 'Rembrandt Light',
    category: 'lighting',
    kind: 'image',
    core: true,
    modelId: 'soul_v2',
    settings: { aspectRatio: '3:4', resolution: '1k', batchSize: 1 },
    template:
      'Portrait of {subject} with classic Rembrandt lighting, single soft key at 45 degrees, triangle of light on the shadow cheek, dark painterly background, fine art photography',
    description: 'The painter’s triangle — timeless dramatic portraiture.',
    exampleSubject: 'an elderly clockmaker holding his finest watch',
  },
  {
    slug: 'hard-flash',
    name: 'Hard Flash',
    category: 'lighting',
    kind: 'image',
    core: false,
    modelId: 'soul_v2',
    settings: { aspectRatio: '3:4', resolution: '1k', batchSize: 1 },
    template:
      '{subject} shot with direct on-camera flash at night, hard shadows, slightly overexposed skin, paparazzi energy, y2k editorial vibe, candid framing',
    description: 'Direct-flash editorial edge, straight out of the 2000s.',
    exampleSubject: 'friends laughing outside a late-night diner',
  },
  {
    slug: 'volumetric-god-rays',
    name: 'God Rays',
    category: 'lighting',
    kind: 'image',
    core: false,
    modelId: 'seedream_v4_5',
    settings: { aspectRatio: '16:9', resolution: '2k', batchSize: 1 },
    template:
      '{subject} pierced by volumetric god rays, dust motes in shafts of light, deep atmospheric perspective, awe-inspiring scale, cathedral-like mood',
    description: 'Shafts of light that make any scene feel sacred.',
    exampleSubject: 'a giant library with impossible towering shelves',
  },
  // ---- Film looks ----
  {
    slug: '35mm-film',
    name: '35mm Film',
    category: 'film-look',
    kind: 'image',
    core: true,
    modelId: 'seedream_v4_5',
    settings: { aspectRatio: '3:2', resolution: '1k', batchSize: 1 },
    template:
      '{subject} shot on 35mm film, Kodak Portra 400, natural grain, soft halation, true-to-life color, documentary framing, unposed moment',
    description: 'Honest grain and Portra color — analog soul.',
    exampleSubject: 'a farmers market on a foggy Saturday morning',
  },
  {
    slug: 'vhs-camcorder',
    name: 'VHS Camcorder',
    category: 'film-look',
    kind: 'video',
    core: true,
    modelId: 'wan_2_7',
    settings: { duration: 5, aspectRatio: '16:9', resolution: '480p', batchSize: 1 },
    template:
      '{subject} recorded on a 1990s VHS camcorder, tape noise, chromatic bleed, timestamp overlay aesthetic, home-video candidness, nostalgic lo-fi',
    description: 'Rewound nostalgia with tape noise and timestamp vibes.',
    exampleSubject: 'kids racing bikes down a summer suburban street',
  },
  {
    slug: 'anamorphic-widescreen',
    name: 'Anamorphic 2.39:1',
    category: 'film-look',
    kind: 'image',
    core: false,
    modelId: 'seedream_v4_5',
    settings: { aspectRatio: '21:9', resolution: '2k', batchSize: 1 },
    template:
      '{subject} shot with anamorphic lenses, 2.39:1 widescreen, oval bokeh, horizontal blue lens flares, epic composition, blockbuster color science',
    description: 'Oval bokeh and blue flares — pure blockbuster.',
    exampleSubject: 'a convoy crossing a salt flat at dawn',
  },
  {
    slug: 'noir-bw',
    name: 'Classic Noir B&W',
    category: 'film-look',
    kind: 'image',
    core: false,
    modelId: 'seedream_v4_5',
    settings: { aspectRatio: '4:3', resolution: '1k', batchSize: 1 },
    template:
      '{subject} in classic film noir, high-contrast black and white, venetian blind shadows, cigarette smoke curling in the light, 1940s styling',
    description: 'Venetian shadows and smoke — the 1940s in a frame.',
    exampleSubject: 'a private eye reading a letter by a rain-streaked window',
  },
  // ---- Ads & product ----
  {
    slug: 'product-hero-spin',
    name: 'Product Hero Spin',
    category: 'ads',
    kind: 'video',
    core: true,
    modelId: 'kling_3_0',
    settings: { duration: 5, aspectRatio: '1:1', batchSize: 1 },
    template:
      'Studio product hero shot of {subject} rotating slowly on a pedestal, seamless gradient backdrop, softbox reflections, macro detail pass, premium commercial lighting',
    description: 'The turntable hero every product page needs.',
    exampleSubject: 'a matte-black wireless headphone set',
  },
  {
    slug: 'liquid-splash-macro',
    name: 'Liquid Splash Macro',
    category: 'ads',
    kind: 'video',
    core: false,
    modelId: 'seedance_2_0',
    settings: { mode: 'pro', duration: 5, aspectRatio: '16:9', resolution: '720p', batchSize: 1 },
    template:
      'Ultra slow-motion macro of {subject} with a dynamic liquid splash, crown droplets frozen mid-air, crisp studio strobes, high-speed phantom camera look, beverage-commercial polish',
    description: 'Phantom-camera splash frozen at 1000fps.',
    exampleSubject: 'a citrus soda can bursting through orange slices',
  },
  {
    slug: 'food-macro-pull',
    name: 'Food Macro Pull',
    category: 'ads',
    kind: 'video',
    core: true,
    modelId: 'seedance_2_0',
    settings: { mode: 'std', duration: 5, aspectRatio: '9:16', resolution: '720p', batchSize: 1 },
    template:
      'Macro probe-lens pull through {subject}, steam rising, glistening texture detail, warm appetizing light, shallow focus racking, food-network hero shot',
    description: 'Steam, texture, and a probe-lens pull that sells taste.',
    exampleSubject: 'a cheese pull from a wood-fired margherita pizza',
  },
  {
    slug: 'unboxing-tabletop',
    name: 'Unboxing Tabletop',
    category: 'ads',
    kind: 'video',
    core: false,
    modelId: 'kling_3_0',
    settings: { duration: 10, aspectRatio: '9:16', batchSize: 1 },
    template:
      'Top-down tabletop unboxing of {subject}, hands entering frame, satisfying peel and lift, soft daylight from a window, ASMR pacing, social-commerce style',
    description: 'Satisfying top-down unboxing built for conversion.',
    exampleSubject: 'a minimalist skincare gift set with embossed wrap',
  },
  {
    slug: 'billboard-poster',
    name: 'Billboard Poster',
    category: 'ads',
    kind: 'image',
    core: true,
    modelId: 'gpt_image_2',
    settings: { aspectRatio: '3:2', quality: 'high', resolution: '2k', batchSize: 1 },
    template:
      'Bold advertising poster for {subject}, oversized headline typography, striking single focal subject, brand-color background, art-directed negative space, print-ready composition',
    description: 'Type-forward poster art with readable headlines.',
    exampleSubject: 'a running-shoe launch called “VELOCITY ONE”',
  },
  // ---- Social ----
  {
    slug: 'pov-hook',
    name: 'POV Hook',
    category: 'social',
    kind: 'video',
    core: true,
    modelId: 'grok_imagine',
    settings: { duration: 6, aspectRatio: '9:16', batchSize: 1 },
    template:
      'First-person POV of {subject}, immediate action from frame one, fast cuts feel, vertical composition, bold energy, scroll-stopping hook for social',
    description: 'First-person energy that hooks in the first second.',
    exampleSubject: 'opening a door into a surprise rooftop party',
  },
  {
    slug: 'meme-reaction',
    name: 'Meme Reaction',
    category: 'social',
    kind: 'video',
    core: false,
    modelId: 'grok_imagine',
    settings: { duration: 6, aspectRatio: '1:1', batchSize: 1 },
    template:
      'Comedic reaction shot of {subject}, exaggerated expression, sudden zoom punch-in, meme timing, bright even lighting, loopable ending',
    description: 'Perfect-loop comedic beats engineered to be shared.',
    exampleSubject: 'an office worker seeing Monday’s calendar',
  },
  {
    slug: 'satisfying-loop',
    name: 'Satisfying Loop',
    category: 'social',
    kind: 'video',
    core: true,
    modelId: 'wan_2_7',
    settings: { duration: 5, aspectRatio: '9:16', resolution: '720p', batchSize: 1 },
    template:
      'Perfectly looping satisfying video of {subject}, seamless start and end, rhythmic motion, macro detail, oddly satisfying pacing, vertical format',
    description: 'Seamless loops the algorithm can’t stop replaying.',
    exampleSubject: 'gold paint swirling into black water',
  },
  {
    slug: 'street-interview',
    name: 'Street Interview Frame',
    category: 'social',
    kind: 'image',
    core: false,
    modelId: 'nano_banana_2',
    settings: { aspectRatio: '9:16', resolution: '1k', batchSize: 1 },
    template:
      'Street-interview style photo of {subject}, handheld mic in frame, busy sidewalk bokeh, natural daylight, candid documentary energy, vertical crop for shorts',
    description: 'The vox-pop frame that fuels shorts thumbnails.',
    exampleSubject: 'a skater explaining their first trick',
  },
  // ---- Portraits ----
  {
    slug: 'editorial-cover',
    name: 'Editorial Cover',
    category: 'portrait',
    kind: 'image',
    core: true,
    modelId: 'soul_v2',
    settings: { aspectRatio: '3:4', resolution: '2k', batchSize: 1 },
    template:
      'High-fashion editorial cover portrait of {subject}, styled wardrobe, studio seamless backdrop, precise beauty lighting, confident pose, magazine-grade retouch aesthetic',
    description: 'Vogue-grade cover energy in one click.',
    exampleSubject: 'a dancer in a sculptural crimson gown',
  },
  {
    slug: 'character-sheet',
    name: 'Character Sheet',
    category: 'portrait',
    kind: 'image',
    core: true,
    modelId: 'nano_banana_2',
    settings: { aspectRatio: '16:9', resolution: '1k', batchSize: 1 },
    template:
      'Character reference sheet of {subject}, three consistent views (front, three-quarter, profile), neutral background, consistent face and outfit, model-sheet layout',
    description: 'Consistent multi-view sheets for characters and brands.',
    exampleSubject: 'a cyberpunk courier with a silver bomber jacket',
  },
  {
    slug: 'cinematic-close-up',
    name: 'Cinematic Close-Up',
    category: 'portrait',
    kind: 'video',
    core: true,
    modelId: 'seedance_2_0',
    settings: { mode: 'std', duration: 5, aspectRatio: '16:9', resolution: '720p', batchSize: 1 },
    template:
      'Intimate cinematic close-up of {subject}, subtle emotional shift across the take, shallow 85mm depth, soft key with practical fill, A24 film mood',
    description: 'A24-style emotional close-ups with subtle motion.',
    exampleSubject: 'a violinist breathing before the final note',
  },
  {
    slug: 'corporate-headshot',
    name: 'Modern Headshot',
    category: 'portrait',
    kind: 'image',
    core: false,
    modelId: 'soul_v2',
    settings: { aspectRatio: '1:1', resolution: '1k', batchSize: 1 },
    template:
      'Modern professional headshot of {subject}, soft wraparound key light, clean out-of-focus office backdrop, natural confident smile, LinkedIn-ready crop',
    description: 'Clean, credible headshots without the studio booking.',
    exampleSubject: 'a startup founder in a charcoal knit',
  },
  // ---- Worlds ----
  {
    slug: 'epic-establisher',
    name: 'Epic Establisher',
    category: 'world',
    kind: 'image',
    core: true,
    modelId: 'seedream_v4_5',
    settings: { aspectRatio: '21:9', resolution: '2k', batchSize: 1 },
    template:
      'Epic establishing shot of {subject}, extreme wide angle, layered atmospheric depth, tiny human figure for scale, dramatic sky, matte-painting grandeur',
    description: 'Matte-painting scale for openings and key art.',
    exampleSubject: 'a cliffside monastery above a sea of clouds',
  },
  {
    slug: 'cozy-interior',
    name: 'Cozy Interior',
    category: 'world',
    kind: 'image',
    core: true,
    modelId: 'seedream_v4_5',
    settings: { aspectRatio: '4:3', resolution: '1k', batchSize: 1 },
    template:
      '{subject} as a cozy lived-in interior, warm practical lamps, layered textiles, soft window light, storytelling props, inviting cinematic stillness',
    description: 'Warm, lived-in spaces that feel like home.',
    exampleSubject: 'a writer’s attic studio during a thunderstorm',
  },
  {
    slug: 'timelapse-city',
    name: 'City Timelapse',
    category: 'world',
    kind: 'video',
    core: false,
    modelId: 'seedance_2_0',
    settings: { mode: 'std', duration: 10, aspectRatio: '16:9', resolution: '720p', batchSize: 1 },
    template:
      'Hyperlapse timelapse of {subject}, streaking light trails, moving clouds, day-to-night transition, locked horizon, urban energy montage',
    description: 'Light-trail hyperlapses that compress hours into seconds.',
    exampleSubject: 'a rain-washed downtown intersection at rush hour',
  },
  {
    slug: 'nature-epic',
    name: 'Nature Epic',
    category: 'world',
    kind: 'video',
    core: false,
    modelId: 'kling_3_0',
    settings: { duration: 10, aspectRatio: '16:9', batchSize: 1 },
    template:
      'BBC-documentary style aerial of {subject}, sweeping helicopter move, pristine natural light, immense scale, rich texture detail, awe-inducing pacing',
    description: 'Planet-Earth aerials with documentary gravitas.',
    exampleSubject: 'a herd of wild horses crossing a braided river',
  },
  // ---- FX & stylized ----
  {
    slug: 'claymation',
    name: 'Claymation',
    category: 'fx',
    kind: 'video',
    core: true,
    modelId: 'wan_2_7',
    settings: { duration: 5, aspectRatio: '1:1', resolution: '720p', batchSize: 1 },
    template:
      '{subject} as handmade claymation, visible fingerprints in clay, stop-motion cadence at 12fps, miniature set with tactile props, Aardman charm',
    description: 'Fingerprints-and-all stop-motion charm.',
    exampleSubject: 'a clay shark hosting a cooking show',
  },
  {
    slug: 'pixel-art-scene',
    name: 'Pixel Art',
    category: 'fx',
    kind: 'image',
    core: true,
    modelId: 'gpt_image_2',
    settings: { aspectRatio: '16:9', quality: 'high', resolution: '1k', batchSize: 1 },
    template:
      '{subject} as detailed 16-bit pixel art, limited retro palette, dithered gradients, parallax-ready layers, SNES-era game aesthetic',
    description: '16-bit nostalgia with modern composition.',
    exampleSubject: 'a rooftop ramen stand under a pixel moon',
  },
  {
    slug: 'liquid-metal',
    name: 'Liquid Metal',
    category: 'fx',
    kind: 'video',
    core: false,
    modelId: 'seedance_2_0',
    settings: { mode: 'pro', duration: 5, aspectRatio: '1:1', resolution: '720p', batchSize: 1 },
    template:
      '{subject} morphing from flowing liquid chrome, mirror reflections, studio HDRI environment, luxurious slow motion, futuristic elegance',
    description: 'Chrome that flows, morphs, and mesmerizes.',
    exampleSubject: 'a perfume bottle assembling from mercury droplets',
  },
  {
    slug: 'papercraft-diorama',
    name: 'Papercraft Diorama',
    category: 'fx',
    kind: 'image',
    core: false,
    modelId: 'gpt_image_2',
    settings: { aspectRatio: '3:2', quality: 'high', resolution: '1k', batchSize: 1 },
    template:
      '{subject} as a layered papercraft diorama, cut-paper depth layers, soft studio light casting real shadows between layers, handcrafted texture, whimsical color story',
    description: 'Layered cut-paper worlds with real depth.',
    exampleSubject: 'a whale swimming over a paper coral reef',
  },
  {
    slug: 'blueprint-hologram',
    name: 'Blueprint Hologram',
    category: 'fx',
    kind: 'video',
    core: false,
    modelId: 'wan_2_7',
    settings: { duration: 5, aspectRatio: '16:9', resolution: '720p', batchSize: 1 },
    template:
      '{subject} materializing as a glowing holographic blueprint, wireframe scan lines assembling into solid form, dark tech lab, cyan light volume, sci-fi UI particles',
    description: 'Sci-fi assembly sequences for product reveals.',
    exampleSubject: 'an electric motorcycle building itself from wireframe',
  },
]

export function getPreset(slug: string): DirectorPreset | undefined {
  return PRESETS.find(p => p.slug === slug)
}

export function presetsByCategory(cat: PresetCategory): DirectorPreset[] {
  return PRESETS.filter(p => p.category === cat)
}

export function applyPreset(preset: DirectorPreset, subject: string): string {
  return preset.template.replaceAll('{subject}', subject.trim() || preset.exampleSubject)
}
