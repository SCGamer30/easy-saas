'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChatCircle, X, PaperPlaneTilt } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/use-user'

/**
 * Floating feedback button — bottom-left corner so it doesn't clash with the
 * Sonner toaster (bottom-right). Only visible to signed-in users.
 *
 * Submits to POST /api/feedback. Works without Resend configured (silent in prod,
 * console.info in dev).
 *
 * Add <FeedbackButton /> to your root layout inside <Providers> to show it globally,
 * or place it on individual pages.
 */
export function FeedbackButton() {
  const { isSignedIn } = useUser()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (!isSignedIn) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    setSending(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), page: window.location.href }),
      })
      if (!res.ok) throw new Error('Failed to send')
      toast.success('Thanks for your feedback!')
      setMessage('')
      setOpen(false)
    } catch {
      toast.error('Could not send feedback. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Popover panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-20 left-6 z-50 w-72 rounded-2xl border p-4 shadow-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Share feedback
              </p>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 transition-colors hover:bg-[var(--color-surface-raised)]"
                aria-label="Close feedback"
              >
                <X size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                maxLength={2000}
                required
                className="w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)]"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <PaperPlaneTilt size={14} weight="bold" />
                {sending ? 'Sending…' : 'Send'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open feedback"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium shadow-md transition-all hover:shadow-lg"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <ChatCircle size={14} weight="duotone" style={{ color: 'var(--color-accent)' }} />
        Feedback
      </button>
    </>
  )
}
