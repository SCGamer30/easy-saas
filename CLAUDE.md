# Boilerplate — Claude Context

## Stack

- **Framework:** Next.js 15 (App Router, React 19, TypeScript strict) — root layout at `app/layout.tsx`
- **Auth:** Clerk (`@clerk/nextjs` v6) — middleware at `middleware.ts`, sign-in/up at `/sign-in` and `/sign-up`, webhook at `app/api/webhooks/clerk/route.ts`
- **Database:** Convex — schema at `convex/schema.ts`, functions at `convex/*.ts`, HTTP router at `convex/http.ts`
- **Payments:** Stripe — helper at `lib/stripe.ts`, routes at `app/api/stripe/*`, subscription sync in `convex/subscriptions.ts`
- **Email:** Resend — helper at `lib/resend.ts`, `FROM_EMAIL` env var controls the sender
- **Analytics:** PostHog — initialized in `components/providers.tsx`
- **Error Monitoring:** Sentry — `instrumentation.ts` + `instrumentation-client.ts` at repo root, server/edge configs at `sentry.{server,edge}.config.ts`, `withSentryConfig` wraps `next.config.ts`, error boundaries at `app/error.tsx` and `app/global-error.tsx`
- **Rate Limiting:** Upstash Redis — limiters at `lib/ratelimit.ts`
- **Background Jobs:** Trigger.dev — config at `trigger.config.ts`, tasks under `trigger/`
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) — NO `tailwind.config.ts`, config lives in `app/globals.css`
- **UI Components:** shadcn/ui (add via `npx shadcn@latest add <component>`) — base Skeleton at `components/ui/skeleton.tsx`
- **Icons:** `@phosphor-icons/react` exclusively — no lucide, no heroicons, no emoji
- **Motion:** `framer-motion` — use `useMotionValue`/`useTransform` for continuous animations, never `useState`
- **Smooth Scroll:** `lenis` — wired globally via `components/smooth-scroll.tsx` inside `Providers`. Opt-out a region with `data-lenis-prevent` on the scroll container.
- **Utilities:** `cn()` from `lib/utils.ts`, typed errors in `lib/errors.ts`, SEO in `lib/metadata.ts`
- **Hooks:** `useUser()` from `hooks/use-user.ts` — combined Clerk + Convex + subscription

## Theme

- CSS custom properties defined in `app/globals.css` under `@theme`
- Supports light + dark mode via `prefers-color-scheme` and `[data-theme]` attribute
- Accent color: Emerald (`--color-accent`). Do NOT use purple/blue gradients.
- Font: Geist / Satoshi (sans), Geist Mono / JetBrains Mono (mono). Inter is banned.

## Path Aliases

- `@/*` maps to repo root — use `@/components`, `@/lib`, `@/convex`, `@/hooks`, etc.

## Architecture Rules

- Default to **Server Components**. Only add `'use client'` when needed (interactivity, hooks, motion).
- Wrap all providers in `components/providers.tsx` (Clerk + Convex + PostHog already wired).
- Isolate heavy animations in their own leaf Client Components — never co-locate with data fetching.
- Use `min-h-[100dvh]` for full-height sections. Never `h-screen`.
- Use CSS Grid over flex math for layouts.

## Stripe — DO NOT CREATE DUPLICATE ROUTES

- **Webhook:** `app/api/stripe/webhook/route.ts` — already handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Never add a second one. If you need new events, add cases inside the existing `switch`.
- **Checkout:** `app/api/stripe/create-checkout/route.ts` — POST `{ priceId, successUrl?, cancelUrl? }`. Clerk-protected. Creates the Stripe customer on first call.
- **Billing portal:** `app/api/stripe/billing-portal/route.ts` — POST `{ returnUrl? }`. Clerk-protected.
- **Frontend gating:** always use `useUser()` from `hooks/use-user.ts` — it exposes `isPro`, `isStudio`, `isPaid`, and the raw `subscription` record. Never call Clerk and Convex separately.
- **Plan slug:** derived from the Stripe price `lookup_key`. Set the lookup key to `pro`, `studio`, etc. when creating prices in the Stripe dashboard.
- **⚠️ lookup_key discipline:** when adding a new Stripe price, the `lookup_key` you set in the Stripe dashboard must match **exactly** what the frontend gating (`useUser()` → `isPro`, `isStudio`, etc.) and the Convex `subscriptions.plan` field expect. Mismatched or renamed lookup keys cause silent billing bugs where paid users show as unpaid. When you introduce a new plan slug, update: (1) the Stripe price lookup key, (2) any new boolean in `hooks/use-user.ts`, and (3) any plan-gated UI in one atomic change.

## Rate Limiting

- Import limiters from `lib/ratelimit.ts`.
- `aiRatelimit` — 10 requests / 10s sliding window. Apply to every AI route.
- `emailRatelimit` — 5 requests / 60s sliding window. Apply to every email/contact route.
- Key the limiter by `userId` when the request is authenticated, else by IP.
- Use `checkRateLimit('ai' | 'email', identifier)` for the generic helper.

## Error Handling

- Import error classes from `lib/errors.ts`: `AppError`, `UnauthorizedError`, `NotFoundError`, `RateLimitError`.
- In every catch block, call `Sentry.captureException(error)` before rethrowing or returning an error response. `handleError()` in `lib/errors.ts` does this for you.
- **NEVER use `console.log` in production code.** Replace with `Sentry.captureMessage()` for breadcrumbs, or remove entirely. `console.log` is a smell — delete it.

## SEO

- Use `generateMeta()` from `lib/metadata.ts` on every page's exported `metadata`.
- For authenticated/private pages (dashboard, settings, etc.), pass `noIndex: true`.
- Base URL comes from `NEXT_PUBLIC_APP_URL` — set it in `.env.local`.

## Hooks

- Always use `useUser()` from `hooks/use-user.ts` instead of calling `useUser()` from Clerk + a Convex query separately. It returns `{ clerkUser, user, subscription, isPro, isStudio, isPaid, isSignedIn, isLoaded }`.

## Convex

- Run `npx convex dev` alongside `npm run dev` during development.
- `convex/_generated/` is gitignored — it's auto-generated.
- Users table syncs automatically from Clerk via `app/api/webhooks/clerk/route.ts` → `upsertUser`.
- Subscriptions table syncs from Stripe via `app/api/stripe/webhook/route.ts` → `upsertSubscription`.
- **Auth:** `convex/auth.config.ts` reads `CLERK_JWT_ISSUER_DOMAIN` from the Convex deployment env — set it with `npx convex env set CLERK_JWT_ISSUER_DOMAIN <your-issuer-url>`. Without it, `ctx.auth.getUserIdentity()` silently returns `null` in every mutation/query.
- **Webhook mutations:** `upsertUser`, `upsertSubscription`, and `updateSubscriptionByStripeCustomer` are public but gated by a shared `CONVEX_WEBHOOK_SECRET`. The secret lives in both Next.js env (for the webhook route to send) and Convex env (for the mutation to verify). Never remove the secret check — without it, anyone with the Convex URL can spoof user or subscription records.
- To add a new table: update `convex/schema.ts`, add query/mutation files.

## Forms

- **Contact / simple forms:** Formspree. Just set the form `action` to your Formspree endpoint — no backend needed.
- **Embeddable forms:** Youform. Paste the embed snippet.
- **Newsletter signups:** beehiiv. Use the embed form or its API.
- Only build a custom backend form when none of the above fit (e.g. the submission must trigger server-side logic).

## Design Theme (IMPORTANT — DO THIS BEFORE WRITING ANY UI)

Before writing any UI on a fresh project, **ask the user which design theme they want**. Point them at the curated list:

- Source: `https://github.com/VoltAgent/awesome-design-md` — try to `WebFetch` the README for the current list.
- Known options (non-exhaustive): Vercel, Linear, Cursor, Stripe, Notion, Apple, Figma, Supabase, Lovable, Sentry, Claude, Uber, NVIDIA, Runway, xAI, Zapier.

Once the user picks:

1. Fetch the DESIGN.md at `https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<site>/DESIGN.md` and save it to the project root as `DESIGN.md`.
2. Also browse `https://designprompts.dev` for a matching aesthetic prompt and reference any useful excerpts.
3. Treat `DESIGN.md` as the design bible — every UI decision should trace back to it.

**Do NOT write any UI code until the theme is confirmed and `DESIGN.md` is in the repo.**

## Manual Setup Reminder

The user is not familiar with dashboard navigation. Whenever a manual setup step is required (grabbing an API key, configuring a webhook, creating a domain record, etc.), provide **exact, click-by-click instructions** — specific page names, button labels, and where to find each value. Never say "grab your API key from the dashboard" — always spell it out. The `/setup` slash command at `.claude/commands/setup.md` is the canonical reference for what manual instructions should look like.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in. See `/setup` for exact steps. Groups:

- **App:** `NEXT_PUBLIC_APP_URL`
- **Clerk:** publishable key, secret key, webhook secret
- **Convex:** `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `CONVEX_WEBHOOK_SECRET` (must also be set in Convex env), `CLERK_JWT_ISSUER_DOMAIN` (set in Convex env only, not `.env.local`)
- **Resend:** `RESEND_API_KEY`, `FROM_EMAIL`
- **Stripe:** publishable key, secret key, webhook secret
- **PostHog:** key, host
- **Sentry:** DSN, org, project, auth token
- **Upstash:** REST URL, REST token
- **Trigger.dev:** secret key

## Design Principles (from `/design-taste-frontend`)

- DESIGN_VARIANCE: 8 — asymmetric layouts, masonry, fractional grids
- MOTION_INTENSITY: 6 — fluid CSS transitions + Framer Motion spring physics
- VISUAL_DENSITY: 4 — daily app spacing, not cockpit, not gallery
- No emoji, no Inter, no centered heroes, no 3-equal-card rows, no purple glows
- Use `@phosphor-icons/react` for all icons
- Full rules live in `.claude/commands/design-taste-frontend.md`. Invoke `/design-taste-frontend` for the full spec.

## Adding shadcn Components

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
```

**Customize every shadcn component the moment you add it — non-negotiable.** The default shadcn styling screams "generic AI template" (zinc-on-white, flat shadows, stock radii). Every time you run `npx shadcn@latest add <component>`:

1. Open the new file under `components/ui/`.
2. Swap any hardcoded `bg-*`, `text-*`, `border-*` utility classes for the project CSS custom properties (`var(--color-surface)`, `var(--color-text-primary)`, `var(--color-border)`, `var(--color-accent)`, etc.).
3. Match the project radii (`rounded-2xl` or whatever `DESIGN.md` specifies) and spacing scale.
4. Replace any lucide icon imports with `@phosphor-icons/react`.
5. Apply the project's motion vocabulary (spring physics via Framer Motion where applicable).

Never ship shadcn output in its default state.

## Scripts

```bash
npm run dev          # Next.js dev server
npm run convex:dev   # Convex dev (run in parallel with above)
npm run build        # Production build
npm run format       # Prettier
npm run lint         # ESLint
```

## Bootstrap

New clone? Open Claude Code in the project directory and run `/setup`. It handles everything automatically and walks you through the remaining manual steps.
