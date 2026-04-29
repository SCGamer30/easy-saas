import { generateMeta } from '@/lib/metadata'

export const metadata = generateMeta({
  title: 'Changelog',
  description: 'What we shipped recently.',
  path: '/changelog',
})

// Add new entries at the top. Keep entries concise — one paragraph per release.
const entries = [
  {
    version: '0.1.0',
    date: '2025-01-01',
    title: 'Initial release',
    body: 'First public version of the app.',
  },
]

export default function ChangelogPage() {
  return (
    <main className="min-h-[100dvh] px-6 py-20">
      <div className="mx-auto grid max-w-2xl gap-16">
        <header className="grid gap-3">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Changelog
          </p>
          <h1
            className="text-4xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            What&apos;s new
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            A running list of improvements, fixes, and new features.
          </p>
        </header>

        <ol className="grid gap-12">
          {entries.map((entry) => (
            <li key={entry.version} className="grid grid-cols-[140px_1fr] gap-8">
              <div className="grid gap-1 pt-0.5">
                <time
                  dateTime={entry.date}
                  className="text-xs tabular-nums"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <span
                  className="inline-block rounded-md border px-2 py-0.5 text-xs font-medium"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  v{entry.version}
                </span>
              </div>

              <div className="grid gap-2">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {entry.title}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {entry.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
