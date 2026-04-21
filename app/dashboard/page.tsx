import { generateMeta } from '@/lib/metadata'

export const metadata = generateMeta({
  title: 'Dashboard',
  description: 'Your account dashboard.',
  path: '/dashboard',
  noIndex: true,
})

export default function DashboardPage() {
  return (
    <main className="min-h-[100dvh] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="grid gap-2">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Dashboard
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight md:text-4xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Welcome back
          </h1>
        </header>
        <section
          className="grid gap-4 rounded-2xl border p-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>Start building here.</p>
        </section>
      </div>
    </main>
  )
}
