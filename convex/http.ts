import { httpRouter } from 'convex/server'

const http = httpRouter()

// Stripe webhooks are handled by the Next.js API route at
// `app/api/stripe/webhook/route.ts` — not here. Webhook signature
// verification requires the raw request body, which is easier to
// handle in Next's edge/node runtime than a Convex HTTP action.
// Add Convex-native webhooks (e.g. Clerk JWT-synced actions) here.

export default http
