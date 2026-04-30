import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { z } from 'zod'
import { api } from '@/convex/_generated/api'
import {
  createCheckoutSession,
  createStripeCustomer,
  getCheckoutPriceForPlan,
  getStripe,
  isStripeConfigured,
} from '@/lib/stripe'
import { checkRateLimit } from '@/lib/ratelimit'
import { clientEnv } from '@/lib/env'

const convex = new ConvexHttpClient(clientEnv.NEXT_PUBLIC_CONVEX_URL)

const appUrl = clientEnv.NEXT_PUBLIC_APP_URL

const checkoutBodySchema = z.object({
  plan: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/),
  successUrl: z
    .string()
    .url()
    .refine(
      (url) => {
        try {
          return new URL(url).origin === new URL(appUrl).origin
        } catch {
          return false
        }
      },
      { message: 'successUrl must be on the same origin as the app' },
    )
    .optional(),
  cancelUrl: z
    .string()
    .url()
    .refine(
      (url) => {
        try {
          return new URL(url).origin === new URL(appUrl).origin
        } catch {
          return false
        }
      },
      { message: 'cancelUrl must be on the same origin as the app' },
    )
    .optional(),
})

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          'Payments are not enabled in this project. Run `/add-stripe` in Claude Code to provision Stripe.',
      },
      { status: 503 },
    )
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success, reset } = await checkRateLimit('api', userId)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.max(0, Math.ceil((reset - Date.now()) / 1000))) },
      },
    )
  }

  const parsed = checkoutBodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { plan, successUrl, cancelUrl } = parsed.data

  const priceId = await getCheckoutPriceForPlan(plan)
  if (!priceId) {
    return NextResponse.json({ error: 'Unknown or inactive plan' }, { status: 400 })
  }

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress

  if (!email) {
    return NextResponse.json({ error: 'Missing user email' }, { status: 400 })
  }

  const existing = await convex.query(api.subscriptions.getSubscriptionByClerkId, {
    clerkId: userId,
  })

  let customerId = existing?.stripeCustomerId
  if (!customerId) {
    // Guard against TOCTOU: two concurrent requests may both see no customer
    // in Convex and both try to create one. Search Stripe by clerkId metadata
    // first — if a customer was already created by a racing request, reuse it.
    const stripe = getStripe()
    const stripeSearch = await stripe.customers.search({
      query: `metadata['clerkId']:'${userId}'`,
      limit: 1,
    })
    if (stripeSearch.data.length > 0) {
      customerId = stripeSearch.data[0]!.id
    } else {
      const customer = await createStripeCustomer({
        email,
        name: user?.fullName ?? undefined,
        clerkId: userId,
      })
      customerId = customer.id
    }
  }

  const session = await createCheckoutSession({
    customerId,
    priceId,
    clerkId: userId,
    successUrl: successUrl ?? `${appUrl}/dashboard?checkout=success`,
    cancelUrl: cancelUrl ?? `${appUrl}/dashboard?checkout=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
