// Shared guards and helpers for Convex functions.

/**
 * Timing-safe string comparison using XOR across all characters.
 * Prevents timing attacks where an attacker measures response time to
 * guess the secret one character at a time.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length)
  let result = a.length === b.length ? 0 : 1
  for (let i = 0; i < maxLen; i++) {
    // Wrap index to avoid short-circuit on length mismatch leaking info
    result |= a.charCodeAt(i % a.length) ^ b.charCodeAt(i % b.length)
  }
  return result === 0
}

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
  if (!timingSafeEqual(secret, expected)) throw new Error('Invalid webhook secret')
}
