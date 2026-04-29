'use client'

import { useUser } from '@/hooks/use-user'

/**
 * Client shell for the admin dashboard.
 * Add Convex admin queries to convex/admin.ts and import them here.
 *
 * Example admin query (add to convex/admin.ts):
 *   export const listAllUsers = query({
 *     handler: async (ctx) => {
 *       // Verify caller is admin via Clerk JWT claims
 *       const identity = await ctx.auth.getUserIdentity()
 *       if (!identity) throw new Error('Unauthenticated')
 *       if (identity.publicMetadata?.role !== 'admin') throw new Error('Forbidden')
 *       return ctx.db.query('users').order('desc').take(100)
 *     },
 *   })
 */
export function AdminDashboard() {
  const { clerkUser } = useUser()

  return (
    <main className="min-h-[100dvh] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="grid gap-2">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Admin
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight md:text-4xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Signed in as {clerkUser?.primaryEmailAddress?.emailAddress}
          </p>
        </header>

        {/* ── Stats row ─────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total users', value: '—' },
            { label: 'Active subscriptions', value: '—' },
            { label: 'MRR', value: '—' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {stat.label}
              </p>
              <p
                className="mt-1 text-3xl font-semibold tabular-nums"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Build your admin UI here ───────────────────────────────── */}
        <section
          className="rounded-2xl border p-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Add Convex admin queries in <code className="font-mono text-xs">convex/admin.ts</code>{' '}
            and wire them up here. See the comment at the top of this file for the pattern.
          </p>
        </section>
      </div>
    </main>
  )
}
