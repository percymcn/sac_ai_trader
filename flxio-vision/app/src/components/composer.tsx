// The FlxioAI Vision composer: prompt + engine + settings + preset + batch,
// with live credit cost preview and the mandatory confirmation gate.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@higgsfield/quanta/button'
import { Textarea } from '@higgsfield/quanta/textarea'
import { Select } from '@higgsfield/quanta/select'
import { Tabs } from '@higgsfield/quanta/tabs'
import { Modal } from '@higgsfield/quanta/modal'
import { Loader } from '@higgsfield/quanta/loader'
import { toast } from '@higgsfield/quanta/sonner'
import Sparkles from '@/assets/icon-sparkles-soft.svg?react'
import CloseIcon from '@material-symbols/svg-400/outlined/close.svg?react'
import AddPhotoIcon from '@material-symbols/svg-400/outlined/add_photo_alternate.svg?react'
import { MODELS, defaultSettings, getModel, type MediaKind } from '../data/models'
import { PRESETS, applyPreset, getPreset } from '../data/presets'
import { previewCost, submitGeneration, submitBatch } from '../lib/api/generate.functions'
import { login, useCurrentUser } from './use-current-user'
import type { SafeGeneration } from '../lib/fnf.server'

export interface ComposerSubmission {
  generations: SafeGeneration[]
  prompt: string
  model: string
  settings: Record<string, string | number>
  presetSlug?: string
}

export interface ComposerPrefill {
  prompt?: string
  model?: string
  settings?: Record<string, string | number>
  presetSlug?: string
}

export function Composer({
  onSubmitted,
  batchLimit = 1,
  prefill,
  compact = false,
}: {
  onSubmitted?: (submission: ComposerSubmission) => void
  batchLimit?: number
  prefill?: ComposerPrefill | null
  compact?: boolean
}) {
  const { state: authState } = useCurrentUser()

  const [kind, setKind] = useState<MediaKind>('video')
  const [modelId, setModelId] = useState('seedance_2_0')
  const [settings, setSettings] = useState<Record<string, string | number>>(() =>
    defaultSettings(getModel('seedance_2_0')!),
  )
  const [prompt, setPrompt] = useState('')
  const [presetSlug, setPresetSlug] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [batchPrompts, setBatchPrompts] = useState<string[]>([])
  const [mediaRef, setMediaRef] = useState<unknown>(null)
  const [mediaName, setMediaName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cost, setCost] = useState<number | null>(null)
  const [costLoading, setCostLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [promptError, setPromptError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const model = getModel(modelId) ?? MODELS[0]
  const preset = presetSlug ? getPreset(presetSlug) : undefined
  const effectivePrompt = preset ? applyPreset(preset, subject) : prompt

  // Apply prefill (remix) once provided.
  useEffect(() => {
    if (!prefill) return
    if (prefill.model) {
      const m = getModel(prefill.model)
      if (m) {
        setKind(m.kind)
        setModelId(m.id)
        setSettings({ ...defaultSettings(m), ...(prefill.settings ?? {}) })
      }
    }
    if (prefill.presetSlug) {
      setPresetSlug(prefill.presetSlug)
      setSubject(prefill.prompt ?? '')
    } else if (prefill.prompt) {
      setPresetSlug(null)
      setPrompt(prefill.prompt)
    }
  }, [prefill])

  const switchKind = (next: MediaKind) => {
    setKind(next)
    const first = MODELS.find(m => m.kind === next)
    if (first) {
      setModelId(first.id)
      setSettings(defaultSettings(first))
    }
    setPresetSlug(null)
    setCost(null)
  }

  const switchModel = (id: string) => {
    const m = getModel(id)
    if (!m) return
    setModelId(id)
    setSettings(defaultSettings(m))
    setCost(null)
  }

  const pickPreset = (slug: string | null) => {
    setPresetSlug(slug)
    setCost(null)
    if (slug) {
      const p = getPreset(slug)
      if (p) {
        const m = getModel(p.modelId)
        if (m) {
          setKind(m.kind)
          setModelId(m.id)
          setSettings({ ...defaultSettings(m), ...p.settings })
        }
      }
    }
  }

  const refreshCost = useCallback(async () => {
    if (!effectivePrompt.trim() || authState !== 'signed-in') return
    setCostLoading(true)
    try {
      const res = await previewCost({
        data: { prompt: effectivePrompt, model: modelId, settings, mediaRef: mediaRef ?? undefined },
      })
      setCost(res.ok ? res.credits : null)
    } catch {
      setCost(null)
    } finally {
      setCostLoading(false)
    }
  }, [effectivePrompt, modelId, settings, mediaRef, authState])

  useEffect(() => {
    const t = setTimeout(() => {
      void refreshCost()
    }, 600)
    return () => clearTimeout(t)
  }, [refreshCost])

  const onPickFile = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: form })
      const json = (await res.json()) as { ok: boolean; ref?: unknown; error?: { code?: string } }
      if (!json.ok || !json.ref) {
        toast.error(`Upload failed${json.error?.code ? ` (${json.error.code})` : ''} — try another image`)
        return
      }
      setMediaRef(json.ref)
      setMediaName(file.name)
      setCost(null)
      toast.success('Reference image attached')
    } catch {
      toast.error('Upload failed — check your connection and retry')
    } finally {
      setUploading(false)
    }
  }

  const validate = (): boolean => {
    if (!effectivePrompt.trim()) {
      setPromptError(
        preset
          ? 'Subject is empty — describe what the preset should film'
          : 'Prompt is empty — describe what to generate',
      )
      return false
    }
    setPromptError(null)
    return true
  }

  const requestGenerate = () => {
    if (authState !== 'signed-in') {
      login()
      return
    }
    if (!validate()) return
    setConfirmOpen(true)
  }

  const totalRuns = 1 + batchPrompts.filter(p => p.trim()).length

  const runGeneration = async () => {
    setConfirmOpen(false)
    setRunning(true)
    try {
      const extraPrompts = batchPrompts.map(p => p.trim()).filter(Boolean)
      if (extraPrompts.length > 0) {
        const res = await submitBatch({
          data: {
            prompts: [effectivePrompt, ...extraPrompts],
            model: modelId,
            settings,
            presetSlug: presetSlug ?? undefined,
            confirmed: true,
          },
        })
        if (!res.ok) {
          handleSubmitError(res.code, (res as { limit?: number }).limit)
          return
        }
        const all = res.results.flatMap(r => r.generations)
        const failed = res.results.filter(r => !r.ok)
        if (failed.length > 0) {
          toast.error(`${failed.length} of ${res.results.length} prompts failed (${failed[0].code})`)
        }
        if (all.length > 0) {
          toast.success(`${all.length} generation${all.length > 1 ? 's' : ''} queued`)
          onSubmitted?.({ generations: all, prompt: effectivePrompt, model: modelId, settings, presetSlug: presetSlug ?? undefined })
        }
      } else {
        const res = await submitGeneration({
          data: {
            prompt: effectivePrompt,
            model: modelId,
            settings,
            presetSlug: presetSlug ?? undefined,
            subject: preset ? subject : undefined,
            mediaRef: mediaRef ?? undefined,
            confirmed: true,
          },
        })
        if (!res.ok) {
          handleSubmitError(res.code)
          return
        }
        toast.success('Generation queued')
        onSubmitted?.({ generations: res.generations, prompt: effectivePrompt, model: modelId, settings, presetSlug: presetSlug ?? undefined })
      }
    } catch {
      toast.error('Something went wrong submitting the job — retry in a moment')
    } finally {
      setRunning(false)
    }
  }

  const handleSubmitError = (code: string, limit?: number) => {
    if (code === 'confirmation_rejected') return // user-cancelled: quiet
    if (code === 'out_of_credits') {
      toast.error('Out of credits — top up your account to keep generating')
    } else if (code === 'batch_limit') {
      toast.error(`Your plan queues up to ${limit ?? 1} prompts — upgrade on the Pricing page for bigger batches`)
    } else if (code === 'preset_locked') {
      toast.error('This preset is on Pro — upgrade on the Pricing page to unlock all presets')
    } else if (code === 'prompt_nsfw') {
      toast.error('That prompt was flagged by the safety filter — rephrase and try again')
    } else if (code === 'unauthorized') {
      login()
    } else {
      toast.error(`Generation failed (${code}) — try again`)
    }
  }

  const kindModels = MODELS.filter(m => m.kind === kind)
  const kindPresets = PRESETS.filter(p => p.kind === kind)

  return (
    <section
      aria-label="Composer"
      className="grid gap-4 rounded-lg border border-q-border-subtle bg-q-background-secondary p-4 md:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={kind}
          onValueChange={v => switchKind(v as MediaKind)}
          items={[
            { value: 'video', label: 'Video' },
            { value: 'image', label: 'Image' },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Engine"
            value={modelId}
            onValueChange={switchModel}
            items={kindModels.map(m => ({ value: m.id, label: m.name }))}
          />
          <Select
            aria-label="Director preset"
            value={presetSlug ?? 'none'}
            onValueChange={v => pickPreset(v === 'none' ? null : v)}
            items={[
              { value: 'none', label: 'No preset — raw prompt' },
              ...kindPresets.map(p => ({ value: p.slug, label: `${p.name}${p.core ? '' : ' · Pro'}` })),
            ]}
          />
        </div>
      </div>

      {preset ? (
        <div className="grid gap-3">
          <Textarea
            label={`Subject for “${preset.name}”`}
            description={`e.g. ${preset.exampleSubject}`}
            error={promptError ?? undefined}
            rows={2}
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <p className="rounded-lg bg-q-background-primary p-3 text-q-body-sm-regular text-q-text-tertiary">
            Recipe: {applyPreset(preset, subject || preset.exampleSubject)}
          </p>
        </div>
      ) : (
        <Textarea
          label="Prompt"
          description="Describe the shot: subject, camera, lighting, mood"
          error={promptError ?? undefined}
          rows={compact ? 3 : 4}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      )}

      <div className="flex flex-wrap items-end gap-3">
        {model.settings.map(s => (
          <div key={s.key} className="grid gap-1">
            <span className="text-q-caption-sm-medium text-q-text-tertiary">{s.label}</span>
            <Select
              aria-label={s.label}
              value={String(settings[s.key] ?? s.default)}
              onValueChange={v => {
                const typed = typeof s.default === 'number' ? Number(v) : v
                setSettings(prev => ({ ...prev, [s.key]: typed }))
                setCost(null)
              }}
              items={s.values.map(v => ({ value: String(v), label: String(v) }))}
            />
          </div>
        ))}

        {model.acceptsImageInput && !preset ? (
          <div className="grid gap-1">
            <span className="text-q-caption-sm-medium text-q-text-tertiary">Reference image</span>
            {mediaRef ? (
              <div className="flex items-center gap-2 rounded-lg border border-q-border-subtle px-3 py-2">
                <span className="max-w-40 truncate text-q-body-sm-regular text-q-text-secondary" title={mediaName ?? ''}>
                  {mediaName}
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  iconOnly
                  aria-label="Remove reference image"
                  onClick={() => {
                    setMediaRef(null)
                    setMediaName(null)
                    setCost(null)
                  }}
                >
                  <CloseIcon width={14} height={14} aria-hidden />
                </Button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) void onPickFile(file)
                    e.target.value = ''
                  }}
                />
                <Button
                  variant="tertiary"
                  size="sm"
                  disabled={uploading || authState !== 'signed-in'}
                  onClick={() => fileInput.current?.click()}
                >
                  {uploading ? <Loader size="xs" color="neutral" /> : <AddPhotoIcon width={16} height={16} aria-hidden />}
                  Attach
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>

      {batchLimit > 1 ? (
        <BatchPrompts prompts={batchPrompts} limit={batchLimit - 1} onChange={setBatchPrompts} />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-q-caption-sm-medium text-q-text-tertiary">
          {model.strengths}
        </p>
        {authState === 'signed-out' ? (
          <Button onClick={() => login()}>Sign in to generate</Button>
        ) : (
          <Button
            variant="marketingPrimary"
            size="md"
            disabled={running || authState === 'loading'}
            onClick={requestGenerate}
          >
            {running ? (
              <Loader size="xs" color="neutral" />
            ) : (
              <>
                Generate <Sparkles width={14} height={14} aria-hidden />{' '}
                {costLoading ? '…' : cost != null ? (totalRuns > 1 ? `${cost}×${totalRuns}` : cost) : '—'}
              </>
            )}
          </Button>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm generation"
      >
        <div className="grid gap-4">
          <dl className="grid gap-2 text-q-body-sm-regular">
            <div className="flex justify-between gap-4">
              <dt className="text-q-text-tertiary">Engine</dt>
              <dd className="text-q-text-primary">{model.name}</dd>
            </div>
            {preset ? (
              <div className="flex justify-between gap-4">
                <dt className="text-q-text-tertiary">Preset</dt>
                <dd className="text-q-text-primary">{preset.name}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-q-text-tertiary">Settings</dt>
              <dd className="max-w-60 truncate text-q-text-primary" title={JSON.stringify(settings)}>
                {Object.entries(settings)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')}
              </dd>
            </div>
            {totalRuns > 1 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-q-text-tertiary">Batch</dt>
                <dd className="text-q-text-primary">{totalRuns} prompts</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-q-border-subtle pt-2">
              <dt className="text-q-text-tertiary">Cost</dt>
              <dd className="text-q-text-primary tabular-nums">
                {cost != null ? `${cost} credits${totalRuns > 1 ? ` × ${totalRuns} prompts` : ''}` : 'shown at submit'}
              </dd>
            </div>
          </dl>
          <p className="max-h-24 overflow-auto rounded-lg bg-q-background-primary p-3 text-q-body-sm-regular text-q-text-secondary">
            {effectivePrompt}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="tertiary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="marketingPrimary" onClick={() => void runGeneration()}>
              Confirm <Sparkles width={14} height={14} aria-hidden /> {cost ?? ''}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

function BatchPrompts({
  prompts,
  limit,
  onChange,
}: {
  prompts: string[]
  limit: number
  onChange: (next: string[]) => void
}) {
  return (
    <div className="grid gap-2 rounded-lg border border-q-border-subtle bg-q-background-primary p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-q-label-lg-semi-bold text-q-text-primary">Batch mode</span>
        <span className="text-q-caption-sm-medium text-q-text-tertiary">
          {prompts.length}/{limit} extra prompts
        </span>
      </div>
      {prompts.map((p, i) => (
        <div key={i} className="flex items-start gap-2">
          <Textarea
            label={`Prompt ${i + 2}`}
            rows={2}
            value={p}
            onChange={e => onChange(prompts.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <Button
            variant="ghost"
            size="xs"
            iconOnly
            aria-label={`Remove prompt ${i + 2}`}
            onClick={() => onChange(prompts.filter((_, j) => j !== i))}
          >
            <CloseIcon width={14} height={14} aria-hidden />
          </Button>
        </div>
      ))}
      {prompts.length < limit ? (
        <div>
          <Button variant="tertiary" size="sm" onClick={() => onChange([...prompts, ''])}>
            Add prompt
          </Button>
        </div>
      ) : null}
    </div>
  )
}
