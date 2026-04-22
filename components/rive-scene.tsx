'use client'

// Rive animation wrapper. Rive is best for interactive, stateful animations
// where the animation itself responds to inputs (hover, click, scroll
// position) — think "on-brand loaders, illustrated toggles, micro-UI with
// personality." Ship a `.riv` file from the Rive editor, reference it here,
// and drive its state machine inputs from React.
//
// Usage:
//   <RiveScene src="/rive/mascot.riv" stateMachines="State Machine 1" />
//
// For scroll/state-driven inputs, grab the lower-level hook directly:
//   import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
//
// Reach for Rive over Lottie when:
// - The animation needs to respond to user input mid-playback
// - You want scrubbing/seeking tied to scroll or pointer position
// - File size matters — .riv is typically smaller than .json Lottie

import { useRive } from '@rive-app/react-canvas'
import type { UseRiveParameters } from '@rive-app/react-canvas'
import { cn } from '@/lib/utils'

type RiveSceneProps = UseRiveParameters & {
  className?: string
}

export function RiveScene({ className, ...riveProps }: RiveSceneProps) {
  const { RiveComponent } = useRive({
    autoplay: true,
    ...riveProps,
  })

  return <RiveComponent className={cn('h-full w-full', className)} />
}
