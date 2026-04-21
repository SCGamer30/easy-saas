import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Your App'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? 'Your App'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#0a0a0a',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#22c55e',
          }}
        >
          {productName}
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            maxWidth: '90%',
          }}
        >
          Build something worth shipping.
        </div>
      </div>
    ),
    size,
  )
}
