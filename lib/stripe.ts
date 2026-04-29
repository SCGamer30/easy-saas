import Stripe from 'stripe'

// Stripe is OPTIONAL in this boilerplate. Most projects don't need payments
// on day one — they ship a product first, get users, then add billing.
//
// We lazy-init the client so the absence of `STRIPE_SECRET_KEY` doesn't
// crash module loads on routes that have nothing to do with payments. The
// helpers below all call `getStripe()` which throws ONLY when something
// actually tries to use Stripe. Routes that depend on Stripe should catch
// `StripeNotConfiguredError` and return a 503.
//
// To enable payments later: run `/add-stripe` (or the Stripe section of
// `/setup`) — it provisions products, webhooks, and writes env vars.

export class StripeNotConfiguredError extends Error {
  constructor() {
    super(
      'Stripe is not configured for this project. Set STRIPE_SECRET_KEY in .env.local, or run `/add-stripe` in Claude Code to provision payments.',
    )
    this.name = 'StripeNotConfiguredError'
  }
}

let _stripe: Stripe | null = null

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new StripeNotConfiguredError()
  _stripe = new Stripe(key, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
  })
  return _stripe
}

export async function createStripeCustomer({
  email,
  name,
  clerkId,
}: {
  email: string
  name?: string
  clerkId: string
}) {
  return getStripe().customers.create({
    email,
    name,
    metadata: { clerkId },
  })
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  clerkId,
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  clerkId: string
}) {
  return getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { clerkId },
    },
    metadata: { clerkId },
  })
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function retrieveSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId)
}
