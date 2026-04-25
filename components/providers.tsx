'use client'

import { useEffect } from 'react'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { SmoothScroll } from '@/components/smooth-scroll'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

const isPostHogEnabled =
  process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY

if (typeof window !== 'undefined' && isPostHogEnabled) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
  })
}

function PostHogPageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isPostHogEnabled) return
  }, [])

  if (!isPostHogEnabled) {
    return <>{children}</>
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PostHogPageProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </PostHogPageProvider>
          <Toaster
            position="bottom-right"
            theme="system"
            toastOptions={{
              classNames: {
                toast:
                  'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)]',
              },
            }}
          />
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
