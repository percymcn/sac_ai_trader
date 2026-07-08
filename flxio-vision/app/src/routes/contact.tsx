import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@higgsfield/quanta/button'
import { Input } from '@higgsfield/quanta/input'
import { Textarea } from '@higgsfield/quanta/textarea'
import { Loader } from '@higgsfield/quanta/loader'
import { toast } from '@higgsfield/quanta/sonner'
import { PublicPage } from '../components/public-page'
import { StructuredData } from '../components/structured-data'
import { PageIntro } from '../components/marketing'
import { buildHead, graph, orgGraph, breadcrumbNode } from '../lib/seo'
import { pageTitle } from '../data/site'
import { submitContact } from '../lib/api/contact.functions'

const SCHEMA = graph(
  orgGraph(),
  breadcrumbNode([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ]),
)

export const Route = createFileRoute('/contact')({
  head: () =>
    buildHead({
      title: pageTitle('Contact'),
      description: 'Questions, feedback, partnership ideas — talk to the FlxioAI Vision team.',
      path: '/contact',
    }),
  component: ContactPage,
})

function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const validate = () => {
    const next: typeof errors = {}
    if (!name.trim()) next.name = 'Name is empty — tell us who you are'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'That email doesn’t look right — check the format'
    if (message.trim().length < 10) next.message = 'Message is too short — give us at least a sentence'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const send = async () => {
    if (!validate()) return
    setBusy(true)
    try {
      const res = await submitContact({ data: { name: name.trim(), email: email.trim(), message: message.trim() } })
      if (res.ok) {
        setSent(true)
        toast.success('Message sent')
      } else {
        toast.error('Could not send — try again')
      }
    } catch {
      toast.error('Could not send — try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PublicPage>
      <StructuredData json={SCHEMA} />
      <div className="mx-auto grid w-full max-w-2xl gap-8">
        <PageIntro
          eyebrow="Contact"
          title="Talk to the team"
          lede="Product questions, billing help, partnership ideas, or a bug you caught — send it here and we read every message."
        />

        {sent ? (
          <div className="grid place-items-center gap-3 rounded-lg border border-q-border-subtle bg-q-background-secondary p-10 text-center">
            <h2 className="text-q-title-md-semi-bold">Got it — thanks!</h2>
            <p className="max-w-md text-q-body-md-regular text-q-text-secondary">
              Your message is in our inbox. If it needs a reply, expect one at {email} within two
              business days.
            </p>
          </div>
        ) : (
          <form
            className="grid gap-4 rounded-lg border border-q-border-subtle bg-q-background-secondary p-5"
            onSubmit={e => {
              e.preventDefault()
              void send()
            }}
          >
            <Input label="Name" value={name} error={errors.name} onChange={e => setName(e.target.value)} autoComplete="name" />
            <Input label="Email" type="email" value={email} error={errors.email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            <Textarea
              label="Message"
              rows={6}
              value={message}
              error={errors.message}
              description="What’s on your mind?"
              onChange={e => setMessage(e.target.value)}
            />
            <div className="flex justify-end">
              <Button variant="secondary" type="submit" disabled={busy}>
                {busy ? <Loader size="xs" color="neutral" /> : 'Send message'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </PublicPage>
  )
}
