import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// See convex/subscriptions.ts for the shared-secret pattern. The Clerk webhook
// route forwards CONVEX_WEBHOOK_SECRET so this public mutation cannot be
// spoofed from the browser.
function assertWebhookSecret(secret: string) {
  const expected = process.env.CONVEX_WEBHOOK_SECRET
  if (!expected) throw new Error('CONVEX_WEBHOOK_SECRET not configured in Convex env')
  if (secret !== expected) throw new Error('Invalid webhook secret')
}

export const upsertUser = mutation({
  args: {
    webhookSecret: v.string(),
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertWebhookSecret(args.webhookSecret)

    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique()

    if (existing) {
      return ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      })
    }

    return ctx.db.insert('users', {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    })
  },
})

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity || identity.subject !== args.clerkId) {
      throw new Error('Unauthorized')
    }
    return ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique()
  },
})
