import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import * as Sentry from '@sentry/nextjs'
import { stripe } from '@/lib/stripe'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import {
  sendSubscriptionCanceledEmail,
  sendSubscriptionConfirmedEmail,
} from '@/lib/resend'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

const PRODUCT_NAME = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? 'Your App'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function formatAmount(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0]
  const unit = (item?.price.unit_amount ?? 0) / 100
  const currency = (item?.price.currency ?? 'usd').toUpperCase()
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(unit)
}

function formatDate(unixSeconds: number | null | undefined) {
  if (!unixSeconds) return undefined
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.CONVEX_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing CONVEX_WEBHOOK_SECRET' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const clerkId = session.metadata?.clerkId
      const customerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

      if (!clerkId || !customerId || !subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const plan = subscription.items.data[0]?.price.lookup_key ?? 'default'

      await convex.mutation(api.subscriptions.upsertSubscription, {
        webhookSecret,
        clerkId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: subscription.status,
        plan,
      })

      const email = session.customer_details?.email
      const customerName = session.customer_details?.name ?? undefined
      if (email) {
        try {
          const item = subscription.items.data[0]
          const interval = item?.price.recurring?.interval === 'year' ? 'year' : 'month'
          await sendSubscriptionConfirmedEmail({
            to: email,
            name: customerName,
            productName: PRODUCT_NAME,
            planName: plan.charAt(0).toUpperCase() + plan.slice(1),
            amount: formatAmount(subscription),
            interval,
            nextBillingDate: formatDate(item?.current_period_end),
            manageUrl: `${APP_URL}/dashboard/billing`,
          })
        } catch (err) {
          Sentry.captureException(err)
        }
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId =
        typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
      const plan = subscription.items.data[0]?.price.lookup_key ?? 'default'

      await convex.mutation(api.subscriptions.updateSubscriptionByStripeCustomer, {
        webhookSecret,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        plan,
      })

      if (event.type === 'customer.subscription.deleted') {
        try {
          const customer = await stripe.customers.retrieve(customerId)
          if (customer && !customer.deleted && customer.email) {
            const item = subscription.items.data[0]
            await sendSubscriptionCanceledEmail({
              to: customer.email,
              name: customer.name ?? undefined,
              productName: PRODUCT_NAME,
              planName: plan.charAt(0).toUpperCase() + plan.slice(1),
              endsAt: formatDate(item?.current_period_end) ?? 'the end of this billing period',
              resubscribeUrl: `${APP_URL}/pricing`,
            })
          }
        } catch (err) {
          Sentry.captureException(err)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
