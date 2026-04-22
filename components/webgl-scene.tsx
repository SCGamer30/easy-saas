'use client'

// WebGL scene wrapper built on react-three-fiber + drei. Use for hero
// backgrounds, 3D product showcases, shader-driven effects, or anything that
// benefits from the GPU.
//
// Usage:
//   import { WebGLScene } from '@/components/webgl-scene'
//   <WebGLScene>
//     <mesh>
//       <icosahedronGeometry args={[1, 0]} />
//       <meshStandardMaterial color="#10b981" />
//     </mesh>
//   </WebGLScene>
//
// The Canvas is lazy-loaded so three.js (~600KB gzipped) never hits the
// initial bundle on pages that don't need it. Always import this component
// behind a dynamic() call when placing in server components:
//
//   const WebGLScene = dynamic(() => import('@/components/webgl-scene').then(m => m.WebGLScene), { ssr: false })

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import type { ComponentProps, PropsWithChildren } from 'react'

type CanvasProps = ComponentProps<typeof Canvas>

type WebGLSceneProps = PropsWithChildren<{
  /** Enable orbit controls for dev inspection. Default false. */
  controls?: boolean
  /** Camera position. Default [0, 0, 5]. */
  cameraPosition?: [number, number, number]
  /** Pass-through to the underlying <Canvas> for advanced config. */
  canvasProps?: Partial<CanvasProps>
  /** CSS class on the wrapper div. */
  className?: string
}>

export function WebGLScene({
  children,
  controls = false,
  cameraPosition = [0, 0, 5],
  canvasProps,
  className,
}: WebGLSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        {...canvasProps}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {controls && <OrbitControls />}
        {children}
      </Canvas>
    </div>
  )
}
