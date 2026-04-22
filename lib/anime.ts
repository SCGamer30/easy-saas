// Thin re-export so project code imports from a single path. Anime.js v4 is
// a lightweight alternative to GSAP — use it for simple declarative keyframe
// animations on DOM or SVG where GSAP's timeline power isn't needed.
//
// Usage:
//   import { animate, utils, svg } from '@/lib/anime'
//   animate('.box', { x: 250, rotate: '1turn', duration: 800 })
//
// When to reach for Anime over Framer Motion:
// - SVG path morphing / stroke animations (`svg.createDrawable`, `svg.morphTo`)
// - One-off CSS variable or attribute animations that don't warrant JSX
// - Staggered animations across many elements outside React's render tree
//
// When to reach for GSAP over Anime:
// - Scroll-driven sequences (ScrollTrigger)
// - Nested timelines with labels
// - Anything that needs pausing, seeking, or reversing mid-sequence

export * from 'animejs'
