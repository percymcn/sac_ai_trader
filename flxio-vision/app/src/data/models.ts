// Model catalog exposed in the FlxioAI Vision studio.
// `id` is the fnf SDK wire id; `importName` documents the SDK job export used
// in lib/fnf.server.ts (the single place SDK jobs are registered).

export type MediaKind = 'image' | 'video'

export interface ModelSettingOption {
  key: string
  label: string
  values: (string | number)[]
  default: string | number
}

export interface StudioModel {
  id: string
  importName: string
  name: string
  kind: MediaKind
  slug: string
  strengths: string
  bestFor: string
  speed: 'fast' | 'balanced' | 'slow'
  acceptsImageInput: boolean
  settings: ModelSettingOption[]
  seoBlurb: string
}

export const MODELS: StudioModel[] = [
  {
    id: 'gpt_image_2',
    importName: 'gptImage2',
    name: 'GPT Image 2',
    kind: 'image',
    slug: 'gpt-image-2',
    strengths: 'Best-in-class text rendering, layout control, and instruction following.',
    bestFor: 'Posters, ads, covers, UI mockups, images with readable text',
    speed: 'balanced',
    acceptsImageInput: true,
    settings: [
      { key: 'aspectRatio', label: 'Aspect ratio', values: ['1:1', '3:2', '2:3', '16:9', '9:16'], default: '3:2' },
      { key: 'quality', label: 'Quality', values: ['medium', 'high'], default: 'high' },
      { key: 'resolution', label: 'Resolution', values: ['1k', '2k'], default: '1k' },
      { key: 'batchSize', label: 'Batch', values: [1, 2, 4], default: 1 },
    ],
    seoBlurb:
      'GPT Image 2 is the strongest model for images that contain text — posters, ads, thumbnails, and covers — with precise instruction following.',
  },
  {
    id: 'nano_banana_2',
    importName: 'nanoBanana2',
    name: 'Nano Banana 2',
    kind: 'image',
    slug: 'nano-banana-2',
    strengths: 'Fast, cheap, excellent photoreal edits and character consistency.',
    bestFor: 'Photoreal shots, product photos, image edits, everyday generations',
    speed: 'fast',
    acceptsImageInput: true,
    settings: [
      { key: 'aspectRatio', label: 'Aspect ratio', values: ['1:1', '3:4', '4:3', '16:9', '9:16'], default: '3:4' },
      { key: 'resolution', label: 'Resolution', values: ['1k', '2k'], default: '1k' },
      { key: 'batchSize', label: 'Batch', values: [1, 2, 4], default: 1 },
    ],
    seoBlurb:
      'Nano Banana 2 is the fast, affordable workhorse for photoreal image generation and reference-based edits with strong character consistency.',
  },
  {
    id: 'seedream_v4_5',
    importName: 'seedreamV4_5',
    name: 'Seedream 4.5',
    kind: 'image',
    slug: 'seedream-4-5',
    strengths: 'Painterly and cinematic stills with rich lighting and texture.',
    bestFor: 'Cinematic keyframes, concept art, editorial imagery',
    speed: 'balanced',
    acceptsImageInput: true,
    settings: [
      { key: 'aspectRatio', label: 'Aspect ratio', values: ['1:1', '3:4', '4:3', '16:9', '9:16', '21:9'], default: '16:9' },
      { key: 'resolution', label: 'Resolution', values: ['1k', '2k'], default: '1k' },
      { key: 'batchSize', label: 'Batch', values: [1, 2, 4], default: 1 },
    ],
    seoBlurb:
      'Seedream 4.5 excels at cinematic stills and concept frames with dramatic lighting — ideal for storyboards and film-look keyframes.',
  },
  {
    id: 'soul_v2',
    importName: 'soulV2Image',
    name: 'Soul V2',
    kind: 'image',
    slug: 'soul-v2',
    strengths: 'Fashion-grade portraits and stylized people with a signature aesthetic.',
    bestFor: 'Portraits, fashion, character shots, avatars',
    speed: 'balanced',
    acceptsImageInput: true,
    settings: [
      { key: 'aspectRatio', label: 'Aspect ratio', values: ['1:1', '3:4', '4:3', '16:9', '9:16'], default: '3:4' },
      { key: 'resolution', label: 'Resolution', values: ['1k', '2k'], default: '1k' },
      { key: 'batchSize', label: 'Batch', values: [1, 2, 4], default: 1 },
    ],
    seoBlurb:
      'Soul V2 produces fashion-grade AI portraits and stylized characters — the go-to model for people-centric shots.',
  },
  {
    id: 'seedance_2_0',
    importName: 'seedance2_0',
    name: 'Seedance 2.0',
    kind: 'video',
    slug: 'seedance-2-0',
    strengths: 'Outstanding motion quality and prompt adherence at a low credit cost.',
    bestFor: 'Cinematic clips, camera moves, action shots, image-to-video',
    speed: 'balanced',
    acceptsImageInput: true,
    settings: [
      { key: 'mode', label: 'Mode', values: ['std', 'pro'], default: 'std' },
      { key: 'duration', label: 'Duration (s)', values: [5, 10], default: 5 },
      { key: 'aspectRatio', label: 'Aspect ratio', values: ['16:9', '9:16', '1:1'], default: '16:9' },
      { key: 'resolution', label: 'Resolution', values: ['480p', '720p', '1080p'], default: '720p' },
      { key: 'batchSize', label: 'Batch', values: [1, 2], default: 1 },
    ],
    seoBlurb:
      'Seedance 2.0 delivers festival-grade motion and camera control at one of the lowest credit costs of any AI video model.',
  },
  {
    id: 'kling_3_0',
    importName: 'kling3_0',
    name: 'Kling 3.0',
    kind: 'video',
    slug: 'kling-3-0',
    strengths: 'Long clips, realistic physics, and reliable character motion.',
    bestFor: 'Longer scenes, product motion, realistic human movement',
    speed: 'slow',
    acceptsImageInput: true,
    settings: [
      { key: 'duration', label: 'Duration (s)', values: [5, 10], default: 5 },
      { key: 'aspectRatio', label: 'Aspect ratio', values: ['16:9', '9:16', '1:1'], default: '16:9' },
      { key: 'batchSize', label: 'Batch', values: [1], default: 1 },
    ],
    seoBlurb:
      'Kling 3.0 is the physics king — realistic movement, stable characters, and longer takes for scenes that need to hold up.',
  },
  {
    id: 'veo3_1_lite',
    importName: 'veo3_1Lite',
    name: 'Veo 3.1 Lite',
    kind: 'video',
    slug: 'veo-3-1-lite',
    strengths: 'Google-grade scene understanding with native audio.',
    bestFor: 'Dialogue scenes, ambient audio clips, complex scene direction',
    speed: 'slow',
    acceptsImageInput: true,
    settings: [
      { key: 'duration', label: 'Duration (s)', values: [4, 6, 8], default: 6 },
      { key: 'aspectRatio', label: 'Aspect ratio', values: ['16:9', '9:16'], default: '16:9' },
      { key: 'batchSize', label: 'Batch', values: [1], default: 1 },
    ],
    seoBlurb:
      'Veo 3.1 Lite brings Google-grade scene direction and native audio to your clips — strongest for dialogue and ambience.',
  },
  {
    id: 'wan_2_7',
    importName: 'wan27',
    name: 'Wan 2.7',
    kind: 'video',
    slug: 'wan-2-7',
    strengths: 'Open-weights speed champion — quick, stylized, and cheap.',
    bestFor: 'Fast drafts, stylized motion, social clips at volume',
    speed: 'fast',
    acceptsImageInput: true,
    settings: [
      { key: 'duration', label: 'Duration (s)', values: [5], default: 5 },
      { key: 'aspectRatio', label: 'Aspect ratio', values: ['16:9', '9:16', '1:1'], default: '16:9' },
      { key: 'resolution', label: 'Resolution', values: ['480p', '720p'], default: '720p' },
      { key: 'batchSize', label: 'Batch', values: [1, 2], default: 1 },
    ],
    seoBlurb:
      'Wan 2.7 is the volume workhorse: fast, inexpensive clips that make it perfect for drafts and high-output social content.',
  },
  {
    id: 'grok_imagine',
    importName: 'grokImagine',
    name: 'Grok Imagine',
    kind: 'video',
    slug: 'grok-imagine',
    strengths: 'Snappy, meme-literate short clips with bold styling.',
    bestFor: 'Short-form hooks, memes, punchy social videos',
    speed: 'fast',
    acceptsImageInput: true,
    settings: [
      { key: 'duration', label: 'Duration (s)', values: [6], default: 6 },
      { key: 'aspectRatio', label: 'Aspect ratio', values: ['16:9', '9:16', '1:1'], default: '9:16' },
      { key: 'batchSize', label: 'Batch', values: [1, 2], default: 1 },
    ],
    seoBlurb:
      'Grok Imagine turns prompts into punchy short-form clips fast — built for hooks, memes, and scroll-stopping social video.',
  },
]

export const IMAGE_MODELS = MODELS.filter(m => m.kind === 'image')
export const VIDEO_MODELS = MODELS.filter(m => m.kind === 'video')

export function getModel(id: string): StudioModel | undefined {
  return MODELS.find(m => m.id === id)
}

export function getModelBySlug(slug: string): StudioModel | undefined {
  return MODELS.find(m => m.slug === slug)
}

export function defaultSettings(model: StudioModel): Record<string, string | number> {
  return Object.fromEntries(model.settings.map(s => [s.key, s.default]))
}
