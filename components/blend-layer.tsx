// Utility wrapper for mix-blend-mode effects. The most common pattern is a
// cursor or accent layer that inverts whatever it's over — use
// <BlendLayer mode="difference"> for that crisp black/white photo-negative
// feel you see on portfolio sites like bruno-simon.com or lusion.co.
//
// Usage — inverted cursor that draws on top of any content:
//   <BlendLayer mode="difference" className="pointer-events-none fixed inset-0 z-50">
//     <CustomCursor />
//   </BlendLayer>
//
// Usage — high-contrast section label:
//   <div className="bg-emerald-500 p-8">
//     <BlendLayer mode="difference">
//       <h1 className="text-white text-6xl">HELLO</h1>
//     </BlendLayer>
//   </div>
//
// Caveat: mix-blend-mode forces the element onto its own compositor layer.
// Keep the blended subtree small — wrapping entire pages in difference
// blending will tank scroll performance.

import type { PropsWithChildren, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BlendMode =
  | 'difference'
  | 'exclusion'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'lighten'
  | 'darken'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'

type Props = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    mode?: BlendMode
  }
>

export function BlendLayer({
  mode = 'difference',
  className,
  children,
  style,
  ...rest
}: Props) {
  return (
    <div
      className={cn('isolate', className)}
      style={{ mixBlendMode: mode, ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}
