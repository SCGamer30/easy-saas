// AutoAnimate hook re-export. AutoAnimate is the "set it and forget it"
// animation library — drop a ref on any container and children get
// automatic enter/leave/move animations whenever they're added, removed, or
// reordered. Zero config, zero per-element animation code.
//
// Usage:
//   const [parent] = useAutoAnimate()
//   return (
//     <ul ref={parent}>
//       {items.map(item => <li key={item.id}>{item.name}</li>)}
//     </ul>
//   )
//
// Reach for useAutoAnimate over Framer Motion when:
// - It's a list/grid where items get added, removed, or reordered
// - You don't need custom choreography — the default is good enough
// - You want the motion "for free" without touching every child
//
// Reach for Framer Motion `layout` + `AnimatePresence` when:
// - You need per-item exit animations that differ by role
// - You're coordinating animations across unrelated parts of the tree
// - You need spring physics or custom easing tied to app state

export { useAutoAnimate } from '@formkit/auto-animate/react'
