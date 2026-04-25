import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { createBillingPortalSession, isStripeConfigured } from '@/lib/stripe'
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { returnUrl } = await req.json().catch(() => ({ returnUrl: null }))

  const subscription = await convex.query(api.subscriptions.getSubscriptionByClerkId, {
    clerkId: userId,
  })

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer for this user' }, { status: 400 })
  }

  const session = await createBillingPortalSession({
    customerId: subscription.stripeCustomerId,
    returnUrl: returnUrl ?? `${appUrl}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
