'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
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
    <html>
      <body
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          background: '#0a0a0a',
          color: '#fafafa',
        }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ maxWidth: '28rem', fontSize: '0.875rem', opacity: 0.7 }}>
          The app ran into an unexpected error. We&apos;ve been notified.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: '0.375rem',
            background: '#22c55e',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
