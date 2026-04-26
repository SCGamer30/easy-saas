import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Lazy-init so a missing UPSTASH_REDIS_REST_URL/TOKEN doesn't print warnings
// at module load (and doesn't break builds that don't actually hit a
// rate-limited route). When Upstash isn't configured, `checkRateLimit`
// returns `{ success: true }` — i.e. rate limiting becomes a no-op rather
// than failing closed and blocking every request.

export type RatelimitKind = 'ai' | 'email' | 'api'

let _limiters: Record<RatelimitKind, Ratelimit> | null = null

export function isRateLimitConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

function getLimiters(): Record<RatelimitKind, Ratelimit> {
  if (_limiters) return _limiters
  const redis = Redis.fromEnv()
  _limiters = {
    ai: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'rl:ai',
    }),
    email: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'rl:email',
    }),
    // General-purpose limiter for authenticated API routes (checkout, billing
    // portal, contact, etc.). Wider than aiRatelimit because typical user
    // actions don't need to be as tight as LLM calls.
    api: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      analytics: true,
      prefix: 'rl:api',
    }),
  }
  return _limiters
}

export async function checkRateLimit(kind: RatelimitKind, identifier: string) {
  if (!isRateLimitConfigured()) {
    // No Upstash configured — treat every request as allowed. The user can
    // wire Upstash later via /setup; until then, routes still work.
    return { success: true, limit: Infinity, remaining: Infinity, reset: 0 }
  }
  const { success, limit, remaining, reset } = await getLimiters()[kind].limit(identifier)
  return { success, limit, remaining, reset }
}
