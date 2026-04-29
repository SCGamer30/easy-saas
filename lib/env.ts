// Runtime env validation with Zod. Import from here instead of reading
// process.env directly — typesafe access plus build-time errors for
// missing required variables.
//
// Two schemas:
//   - clientSchema: NEXT_PUBLIC_* only. Safe to import from client components.
//   - serverSchema: all server vars. Only readable on the server.
//
// Usage:
//   import { env } from '@/lib/env'         // server + client (server vars undefined on client)
//   import { clientEnv } from '@/lib/env'    // client-safe subset
//
// Adding a new env var:
//   1. Add to .env.example
//   2. Add to the appropriate schema below
//   3. Required everywhere = required(), optional via .optional()

import { z } from 'zod'

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_PRODUCT_NAME: z.string().min(1).default('App'),
  NEXT_PUBLIC_CONVEX_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
})

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().startsWith('sk_'),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  CONVEX_WEBHOOK_SECRET: z.string().optional(),

  // Stripe (opt-in via /add-stripe)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FEEDBACK_EMAIL: z.string().email().optional(),

  // Observability
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Background jobs
  TRIGGER_SECRET_KEY: z.string().optional(),
})

// NEXT_PUBLIC_* must be referenced literally for Next.js to inline them.
// Listing each property explicitly is what makes the inlining work.
const rawClient = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_PRODUCT_NAME: process.env.NEXT_PUBLIC_PRODUCT_NAME,
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
}

function fail(label: string, issues: z.ZodIssue[]): never {
  const detail = issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')
  throw new Error(
    `${label} environment variables invalid:\n${detail}\n\nCheck .env.local against .env.example, or run /setup in Claude Code.`,
  )
}

function parseClient() {
  if (process.env.SKIP_ENV_VALIDATION === '1') return rawClient as z.infer<typeof clientSchema>
  const result = clientSchema.safeParse(rawClient)
  if (!result.success) fail('Client', result.error.issues)
  return result.data
}

function parseServer() {
  if (process.env.SKIP_ENV_VALIDATION === '1')
    return process.env as unknown as z.infer<typeof serverSchema>
  const result = serverSchema.safeParse(process.env)
  if (!result.success) fail('Server', result.error.issues)
  return result.data
}

export const clientEnv = parseClient()

// On the server, validate server vars too. On the client, server vars
// don't exist — return an empty proxy that throws if accessed (to prevent
// accidental client usage of secrets).
const isServer = typeof window === 'undefined'

export const env: z.infer<typeof clientSchema> & Partial<z.infer<typeof serverSchema>> = isServer
  ? { ...clientEnv, ...parseServer() }
  : (new Proxy(clientEnv as Record<string, unknown>, {
      get(target, prop) {
        if (prop in target) return target[prop as string]
        if (typeof prop === 'string' && !prop.startsWith('NEXT_PUBLIC_')) {
          throw new Error(
            `Tried to read server env var "${prop}" on the client. Server-only vars must be read in Server Components or Route Handlers.`,
          )
        }
        return undefined
      },
    }) as z.infer<typeof clientSchema> & Partial<z.infer<typeof serverSchema>>)
