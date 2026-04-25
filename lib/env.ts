// Runtime env validation with Zod. Import from here instead of reading
// process.env directly — you'll get typesafe access AND build-time errors
// if a required variable is missing.
//
// Usage:
//   import { env } from '@/lib/env'
//   const stripeKey = env.STRIPE_SECRET_KEY  // typed as string | undefined
//
// Adding a new env var:
//   1. Add it to .env.example
//   2. Add a field to the appropriate schema below
//   3. Decide: required everywhere (always-on), required-in-prod, or optional
//
// Note: NEXT_PUBLIC_* vars must be referenced literally in source code for
// Next.js to inline them. The validation here doesn't replace that — it adds
// a typed mirror.

import { z } from 'zod'

// Required in every environment — without these the app fundamentally
// can't run. Build fails fast if missing.
const requiredEverywhere = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_PRODUCT_NAME: z.string().min(1).default('App'),
  NEXT_PUBLIC_CONVEX_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  CLERK_SECRET_KEY: z.string().startsWith('sk_'),
})

// Optional — features degrade gracefully if missing. Stripe is the
// canonical example: undefined STRIPE_SECRET_KEY just means payments
// are disabled, not that the app crashes.
const optional = z.object({
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  CONVEX_WEBHOOK_SECRET: z.string().optional(),

  // Stripe (opt-in via /add-stripe)
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // Analytics + observability
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Background jobs
  TRIGGER_SECRET_KEY: z.string().optional(),
})

const schema = requiredEverywhere.merge(optional)

// Skip validation during `next build` if SKIP_ENV_VALIDATION=1 (useful for
// CI typecheck without a full env). In all other cases, parse and throw on
// first missing required var.
function parseEnv() {
  if (process.env.SKIP_ENV_VALIDATION === '1') {
    return process.env as unknown as z.infer<typeof schema>
  }

  const result = schema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(
      `Invalid or missing environment variables:\n${issues}\n\n` +
        `Check .env.local against .env.example, or run /setup in Claude Code.`,
    )
  }
  return result.data
}

export const env = parseEnv()
