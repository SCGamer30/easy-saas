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

export type RatelimitKind = 'ai' | 'email'

export async function checkRateLimit(kind: RatelimitKind, identifier: string) {
  const limiter = kind === 'ai' ? aiRatelimit : emailRatelimit
  const { success, limit, remaining, reset } = await limiter.limit(identifier)
  return { success, limit, remaining, reset }
}
