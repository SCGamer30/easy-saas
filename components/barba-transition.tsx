'use client'

// Barba.js integration for full-takeover page transitions. Use this ONLY for
// marketing subsites or standalone HTML-ish pages where you want Barba's
// classic "next page fades in from the right while current page exits left"
// model. It's NOT compatible with Next.js App Router's RSC navigation —
// Barba intercepts native `<a>` clicks, which Next's `<Link>` handles
// differently.
//
// Typical fit: a `/showcase` subsection rendered as static HTML fragments
// with plain `<a>` tags instead of `<Link>`. Wrap that subtree in
// <BarbaTransition> and Barba will take over.
//
// For standard App Router pages, use <PageTransition> from
// components/page-transition.tsx — it uses Framer Motion + AnimatePresence
// keyed on pathname, which plays nicely with RSC.

import { useEffect } from 'react'
import type { PropsWithChildren } from 'react'
import { gsap } from '@/lib/gsap'

export function BarbaTransition({ children }: PropsWithChildren) {
  useEffect(() => {
    let barba: typeof import('@barba/core').default | null = null
    let cancelled = false

    async function init() {
      const mod = await import('@barba/core')
      if (cancelled) return
      barba = mod.default

      barba.init({
        transitions: [
          {
            name: 'default',
            leave(data) {
              return gsap.to(data.current.container, {
                opacity: 0,
                y: -24,
                duration: 0.4,
                ease: 'power2.inOut',
              })
            },
            enter(data) {
              return gsap.from(data.next.container, {
                opacity: 0,
                y: 24,
                duration: 0.4,
                ease: 'power2.out',
              })
            },
          },
        ],
      })
    }

    init()

    return () => {
      cancelled = true
      barba?.destroy()
    }
  }, [])

  return (
    <div data-barba="wrapper">
      <div data-barba="container" data-barba-namespace="default">
        {children}
      </div>
    </div>
  )
}
