'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
        Something broke.
      </h1>
      <p className="max-w-md text-sm text-[var(--color-text-secondary)]">
        We&apos;ve logged the issue. Try again — if it keeps happening, reach out and we&apos;ll dig
        in.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Try again
      </button>
    </div>
  )
}
