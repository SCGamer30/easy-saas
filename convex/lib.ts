// Shared guards and helpers for Convex functions.

/**
 * Verifies the shared webhook secret forwarded by Next.js API routes that
 * receive externally-verified events (Clerk, Stripe). Because these mutations
 * are public Convex functions, the secret prevents direct browser invocation.
 *
 * Configure in the Convex dashboard: Settings → Environment Variables.
 */
export function assertWebhookSecret(secret: string) {
  const expected = process.env.CONVEX_WEBHOOK_SECRET
  if (!expected) throw new Error('CONVEX_WEBHOOK_SECRET not configured in Convex env')
  if (secret !== expected) throw new Error('Invalid webhook secret')
}
