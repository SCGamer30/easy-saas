// Minimal ambient declaration for @barba/core, which ships without its own
// types. We only use the handful of surfaces referenced in
// components/barba-transition.tsx — if you need deeper Barba features,
// expand this file rather than reaching into `any`.

declare module '@barba/core' {
  interface BarbaContainer {
    container: HTMLElement
    namespace: string
    url: { href: string; path: string }
  }

  interface BarbaTransitionData {
    current: BarbaContainer
    next: BarbaContainer
    trigger: string | HTMLElement
  }

  interface BarbaTransition {
    name?: string
    sync?: boolean
    leave?: (data: BarbaTransitionData) => Promise<unknown> | unknown
    enter?: (data: BarbaTransitionData) => Promise<unknown> | unknown
    beforeLeave?: (data: BarbaTransitionData) => Promise<unknown> | unknown
    afterLeave?: (data: BarbaTransitionData) => Promise<unknown> | unknown
    beforeEnter?: (data: BarbaTransitionData) => Promise<unknown> | unknown
    afterEnter?: (data: BarbaTransitionData) => Promise<unknown> | unknown
  }

  interface BarbaInitOptions {
    transitions?: BarbaTransition[]
    views?: unknown[]
    debug?: boolean
    prevent?: (args: { el: HTMLAnchorElement; href: string }) => boolean
  }

  interface BarbaInstance {
    init(options?: BarbaInitOptions): void
    destroy(): void
    hooks: Record<string, (cb: (data: BarbaTransitionData) => unknown) => void>
  }

  const barba: BarbaInstance
  export default barba
}
