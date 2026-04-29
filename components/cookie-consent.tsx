'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie, X } from '@phosphor-icons/react'
import posthog from 'posthog-js'
import { useCookieConsent } from '@/hooks/use-cookie-consent'

/**
 * GDPR/CCPA cookie consent banner.
 *
 * - Shown only when no prior decision is stored in localStorage.
 * - On accept  → posthog.opt_in_capturing()
 * - On decline → posthog.opt_out_capturing()
 *
 * PostHog must be initialised with `opt_out_capturing_by_default: true`
 * (already set in components/providers.tsx) for this to be effective.
 *
 * Add this component to your root layout inside <Providers>.
 * Only render it in apps that collect analytics/use tracking cookies.
 */
export function CookieConsent() {
  const { showBanner, accept, decline } = useCookieConsent()

  // Sync consent decisions to PostHog whenever they're made
  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent')
    if (stored === 'accepted') posthog.opt_in_capturing()
    if (stored === 'declined') posthog.opt_out_capturing()
  }, [showBanner])

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          className="fixed bottom-6 left-6 z-50 flex max-w-sm flex-col gap-4 rounded-2xl border p-5 shadow-xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Dismiss without choosing — treated as decline */}
          <button
            onClick={decline}
            aria-label="Dismiss"
            className="absolute top-3 right-3 rounded-md p-1 transition-colors hover:bg-[var(--color-surface-raised)]"
          >
            <X size={14} style={{ color: 'var(--color-text-tertiary)' }} />
          </button>

          <div className="flex items-start gap-3">
            <Cookie
              size={20}
              weight="duotone"
              className="mt-0.5 shrink-0"
              style={{ color: 'var(--color-accent)' }}
            />
            <div className="grid gap-1">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                We use cookies
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                We use analytics cookies to understand how you use the product. No data is sold or
                shared with third parties.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={decline}
              className="flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--color-surface-raised)]"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="flex-1 rounded-xl px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
