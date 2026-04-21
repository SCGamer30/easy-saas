import Link from 'next/link'
import { generateMeta } from '@/lib/metadata'

export const metadata = generateMeta({
  title: '404 — Not found',
  description: 'This page does not exist.',
  noIndex: true,
})

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <p
        className="text-xs tracking-widest uppercase"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        404
      </p>
      <h1
        className="text-3xl font-semibold tracking-tight md:text-4xl"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Nothing here.
      </h1>
      <p className="max-w-sm text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        The page you&apos;re looking for moved or never existed.
      </p>
      <Link
        href="/"
        className="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: 'var(--color-accent)' }}
      >
        Back home
      </Link>
    </main>
  )
}
