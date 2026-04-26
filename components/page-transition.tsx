'use client'

// Route-change transitions for the App Router. Uses Framer Motion's
// AnimatePresence keyed on the pathname — this is the Next.js-native way to
// animate between pages. Drop this around `{children}` in `app/layout.tsx`
// when you want animated transitions on navigation.
//
//   import { PageTransition } from '@/components/page-transition'
//   <body>
//     <Providers>
//       <PageTransition>{children}</PageTransition>
//     </Providers>
//   </body>
//
// For more elaborate full-page transitions (multi-layer reveals, masks, etc.)
// drive the animation with GSAP timelines inside the motion variants — there's
// no need for a separate page-transition library on App Router.

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { PropsWithChildren } from 'react'

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
