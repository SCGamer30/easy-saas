import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { createCheckoutSession, createStripeCustomer, isStripeConfigured } from '@/lib/stripe'
import { checkRateLimit } from '@/lib/ratelimit'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Payments are not enabled in this project. Run `/add-stripe` in Claude Code to provision Stripe.' },
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
      { status: 429, headers: { 'Retry-After': String(Math.max(0, Math.ceil((reset - Date.now()) / 1000))) } },
    )
  }

  const { priceId, successUrl, cancelUrl } = await req.json()
  if (!priceId) {
    return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
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
    const customer = await createStripeCustomer({
      email,
      name: user?.fullName ?? undefined,
      clerkId: userId,
    })
    customerId = customer.id
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
