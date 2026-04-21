import { generateMeta } from '@/lib/metadata'

export const metadata = generateMeta({
  title: 'Pricing',
  description: 'Plans and pricing.',
  path: '/pricing',
})

export default function PricingPage() {
  return (
    <main className="min-h-[100dvh] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="grid gap-2">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Pricing
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight md:text-4xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Pick a plan
          </h1>
        </header>
        <section
          className="grid gap-4 rounded-2xl border p-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Pricing cards go here. Wire each card's CTA to POST /api/stripe/create-checkout
              with { priceId } where priceId is the Stripe price matching the lookup_key
              (pro, studio, etc.). Set in Stripe dashboard → Product catalog. */}
          <p style={{ color: 'var(--color-text-secondary)' }}>Pricing cards go here.</p>
        </section>
      </div>
    </main>
  )
}
