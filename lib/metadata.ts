import type { Metadata } from 'next'

const DEFAULT_APP_URL = 'http://localhost:3000'

export function generateMeta({
  title,
  description,
  image,
  path,
  noIndex,
}: {
  title: string
  description: string
  image?: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL
  const url = path ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : baseUrl
  const ogImage = image ?? `${baseUrl}/og.png`

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: title,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}
