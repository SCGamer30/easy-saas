// GSAP singleton + plugin registration. Import from here, never directly from
// 'gsap' — this ensures ScrollTrigger is registered exactly once and avoids
// SSR issues (GSAP touches `window`, so plugin registration must be
// client-only).
//
// Usage in a client component:
//   import { gsap, ScrollTrigger } from '@/lib/gsap'
//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       gsap.to('.hero', { y: -100, scrollTrigger: { trigger: '.hero' } })
//     }, rootRef)
//     return () => ctx.revert()
//   }, [])
//
// Always wrap animations in `gsap.context(() => {...}, scope)` and call
// `ctx.revert()` on cleanup. Without this, animations leak across route
// changes.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
}

export { gsap, ScrollTrigger, ScrollToPlugin }
