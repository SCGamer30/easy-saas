// Shared guards and helpers for Convex functions.

/**
 * Timing-safe string comparison using XOR across all characters.
 * Prevents timing attacks where an attacker measures response time to
 * guess the secret one character at a time.
 */
function timingSafeEqual(a: string, b: string): boolean {
  // Compare in constant time. Length mismatch must not short-circuit — burn
  // the same number of iterations as the longer string to avoid leaking length.
  if (a.length !== b.length) {
    let dummy = 0
    for (let i = 0; i < b.length; i++) dummy |= b.charCodeAt(i) ^ b.charCodeAt(i)
    void dummy
    return false
  }
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
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
