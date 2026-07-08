// Multipart media upload: browser File -> fnf media.upload -> MediaRef.
// Binary never crosses a JSON boundary.
import { createFileRoute } from '@tanstack/react-router'
import { requireCurrentUser } from '../../../lib/auth.server'
import { createFnfReaders } from '../../../lib/fnf.server'

const MAX_BYTES = 25 * 1024 * 1024

export const Route = createFileRoute('/api/media/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireCurrentUser()
        if (!auth.ok) {
          return Response.json(
            { ok: false, error: { code: 'unauthorized', status: auth.status } },
            { status: auth.status },
          )
        }

        const form = await request.formData()
        const file = form.get('file')
        if (!(file instanceof File)) {
          return Response.json({ ok: false, error: { code: 'missing_file' } }, { status: 400 })
        }
        if (file.size > MAX_BYTES) {
          return Response.json({ ok: false, error: { code: 'file_too_large' } }, { status: 413 })
        }
        if (!file.type.startsWith('image/')) {
          return Response.json({ ok: false, error: { code: 'unsupported_type' } }, { status: 415 })
        }

        console.info('[api/media/upload] file', { contentType: file.type, size: file.size })

        try {
          const bytes = new Uint8Array(await file.arrayBuffer())
          const { media } = createFnfReaders()
          const result = await media.upload({
            source: bytes,
            filename: 'upload',
            contentType: file.type,
            type: 'image',
            forceIpCheck: true,
          } as never)
          return Response.json({ ok: true, ref: (result as { ref: unknown }).ref })
        } catch (error) {
          const code = (error as { code?: string }).code ?? 'upload_failed'
          console.info('[api/media/upload] failed', { code })
          return Response.json({ ok: false, error: { code } }, { status: 502 })
        }
      },
    },
  },
})
