import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export const aiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'rl:ai',
})

export const emailRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: 'rl:email',
})

// General-purpose limiter for authenticated API routes (checkout, billing
// portal, contact, etc.). Wider than aiRatelimit because typical user actions
// don't need to be as tight as LLM calls.
export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '60 s'),
  analytics: true,
  prefix: 'rl:api',
})

export type RatelimitKind = 'ai' | 'email' | 'api'

const LIMITERS: Record<RatelimitKind, Ratelimit> = {
  ai: aiRatelimit,
  email: emailRatelimit,
  api: apiRatelimit,
}

export async function checkRateLimit(kind: RatelimitKind, identifier: string) {
  const { success, limit, remaining, reset } = await LIMITERS[kind].limit(identifier)
  return { success, limit, remaining, reset }
}
