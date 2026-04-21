import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export async function createStripeCustomer({
  email,
  name,
  clerkId,
}: {
  email: string
  name?: string
  clerkId: string
}) {
  return stripe.customers.create({
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
  return stripe.checkout.sessions.create({
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
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function retrieveSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}
