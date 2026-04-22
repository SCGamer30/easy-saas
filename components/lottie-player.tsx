'use client'

// Lottie player using the .lottie (dotLottie) format — compressed, supports
// multiple animations per file, and is ~30–80% smaller than legacy JSON
// Lottie. Use this for non-interactive playback: hero illustrations, empty
// states, success confetti, loading indicators.
//
// Usage — inline file:
//   <LottiePlayer src="/lottie/success.lottie" autoplay loop />
//
// Usage — URL:
//   <LottiePlayer src="https://lottie.host/abc.lottie" />
//
// Reach for Lottie over Rive when:
// - The animation is pure playback (no user-driven state)
// - Designer hands you an After Effects export via bodymovin
// - You don't need interactivity beyond play/pause/seek
//
// Reach for Framer Motion / GSAP over Lottie when:
// - The animation is simple enough to express in code (saves the runtime)
// - The motion is tightly coupled to app state and doesn't need designer edits

import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import type { DotLottieReactProps } from '@lottiefiles/dotlottie-react'

type LottiePlayerProps = DotLottieReactProps

export function LottiePlayer(props: LottiePlayerProps) {
  return <DotLottieReact autoplay loop {...props} />
}
