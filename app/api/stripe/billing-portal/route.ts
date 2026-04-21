import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { createBillingPortalSession } from '@/lib/stripe'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
