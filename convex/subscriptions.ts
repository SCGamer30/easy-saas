import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const upsertSubscription = mutation({
  args: {
    clerkId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
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
      ...args,
      updatedAt: Date.now(),
    })
  },
})

export const updateSubscriptionByStripeCustomer = mutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
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
