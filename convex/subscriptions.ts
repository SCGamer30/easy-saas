import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Shared-secret guard for webhook-triggered writes. The Next.js API route that
// receives verified Stripe events forwards CONVEX_WEBHOOK_SECRET with each call
// so the mutation cannot be invoked from the browser even though it is public.
// Configure in Convex dashboard: Settings → Environment Variables.
function assertWebhookSecret(secret: string) {
  const expected = process.env.CONVEX_WEBHOOK_SECRET
  if (!expected) throw new Error('CONVEX_WEBHOOK_SECRET not configured in Convex env')
  if (secret !== expected) throw new Error('Invalid webhook secret')
}

export const upsertSubscription = mutation({
  args: {
    webhookSecret: v.string(),
    clerkId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    assertWebhookSecret(args.webhookSecret)

    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique()

    if (existing) {
      return ctx.db.patch(existing._id, {
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        status: args.status,
        plan: args.plan,
        updatedAt: Date.now(),
      })
    }

    return ctx.db.insert('subscriptions', {
      clerkId: args.clerkId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      status: args.status,
      plan: args.plan,
      updatedAt: Date.now(),
    })
  },
})

export const updateSubscriptionByStripeCustomer = mutation({
  args: {
    webhookSecret: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    assertWebhookSecret(args.webhookSecret)

    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_stripe_customer_id', (q) => q.eq('stripeCustomerId', args.stripeCustomerId))
      .unique()

    if (!existing) return null

    return ctx.db.patch(existing._id, {
      stripeSubscriptionId: args.stripeSubscriptionId,
      status: args.status,
      plan: args.plan,
      updatedAt: Date.now(),
    })
  },
})

export const getSubscriptionByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity || identity.subject !== args.clerkId) {
      throw new Error('Unauthorized')
    }
    return ctx.db
      .query('subscriptions')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique()
  },
})

export const getSubscriptionByStripeCustomer = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('subscriptions')
      .withIndex('by_stripe_customer_id', (q) => q.eq('stripeCustomerId', args.stripeCustomerId))
      .unique()
  },
})
