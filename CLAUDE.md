# Boilerplate — Claude Context

## Stack

- **Framework:** Next.js 15 (App Router, React 19, TypeScript strict) — root layout at `app/layout.tsx`
- **Auth:** Clerk (`@clerk/nextjs` v6) — middleware at `middleware.ts`, sign-in/up at `/sign-in` and `/sign-up`, webhook at `app/api/webhooks/clerk/route.ts`
- **Database:** Convex — schema at `convex/schema.ts`, functions at `convex/*.ts`, HTTP router at `convex/http.ts`
- **Payments:** Stripe — helper at `lib/stripe.ts`, routes at `app/api/stripe/*`, subscription sync in `convex/subscriptions.ts`
- **Email:** Resend — helper at `lib/resend.ts`, React Email templates at `emails/*.tsx` (welcome, subscription-confirmed, subscription-canceled, transactional base). `FROM_EMAIL` and `NEXT_PUBLIC_PRODUCT_NAME` env vars control sender / branding. Preview locally via `npm run email:dev`.
- **Analytics:** PostHog — initialized in `components/providers.tsx`
- **Error Monitoring:** Sentry — `instrumentation.ts` + `instrumentation-client.ts` at repo root, server/edge configs at `sentry.{server,edge}.config.ts`, `withSentryConfig` wraps `next.config.ts`, error boundaries at `app/error.tsx` and `app/global-error.tsx`
- **Rate Limiting:** Upstash Redis — limiters at `lib/ratelimit.ts`
- **Background Jobs:** Trigger.dev — config at `trigger.config.ts`, tasks under `trigger/`
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) — NO `tailwind.config.ts`, config lives in `app/globals.css`
- **UI Components:** shadcn/ui (add via `npx shadcn@latest add <component>`) — base Skeleton at `components/ui/skeleton.tsx`
- **Icons:** `@phosphor-icons/react` exclusively — no lucide, no heroicons, no emoji
- **Motion:** `framer-motion` (primary, React-declarative) and `gsap` + `ScrollTrigger` (imperative timelines, scroll-driven). Import GSAP from `lib/gsap.ts`, never directly. Page transitions: `components/page-transition.tsx` (Framer + AnimatePresence, App Router–native).
- **WebGL:** `three` + `@react-three/fiber` + `@react-three/drei` — wrapper at `components/webgl-scene.tsx`. Always import via `next/dynamic({ ssr: false })` to keep three.js out of the initial bundle.
- **Rive:** `@rive-app/react-canvas` — wrapper at `components/rive-scene.tsx`. Use for interactive/stateful animations with input-driven state machines.
- **Lottie:** `@lottiefiles/dotlottie-react` — wrapper at `components/lottie-player.tsx`. Use for designer-exported playback animations (.lottie format preferred over legacy .json).
- **AutoAnimate:** `@formkit/auto-animate/react` — hook at `hooks/use-auto-animate.ts`. Drop a single ref on a list container to auto-animate add/remove/reorder.
- **Blend modes:** `components/blend-layer.tsx` — `<BlendLayer mode="difference">` for photo-negative cursors, crisp accent overlays. Keep blended subtrees small (compositor cost).
- **Smooth Scroll:** `lenis` — wired globally via `components/smooth-scroll.tsx` inside `Providers`. Opt-out a region with `data-lenis-prevent` on the scroll container.
- **Forms:** `react-hook-form` + `zod` (via `@hookform/resolvers/zod`). Always use Zod schemas for form validation, never hand-rolled. Wire via shadcn's `<Form>` primitives (`npx shadcn@latest add form`).
- **Toasts:** `sonner` via `<Toaster>` mounted in `components/providers.tsx`. Import `import { toast } from 'sonner'` and call `toast.success(...)` / `toast.error(...)` / `toast.promise(...)`. Never use `alert()`, never hand-roll a toast component.
- **Theme toggle:** `next-themes` wired in `components/providers.tsx` (`attribute="data-theme"`, system default). UI component at `components/theme-toggle.tsx`. Don't touch `data-theme` directly — always go through `useTheme()` from `next-themes`.
- **Env validation:** `lib/env.ts` parses `process.env` through a Zod schema at module load. Import from `@/lib/env` instead of reading `process.env.X` directly — you get typed access plus build-time errors for missing required vars. Add new env vars to BOTH `.env.example` AND the schema in `lib/env.ts`.
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

## Stripe is OPTIONAL — opt-in, not on by default

Most projects don't need payments on day one. The boilerplate ships with `STRIPE_SECRET_KEY` empty, and `lib/stripe.ts` lazy-inits — the app runs fine without it. **Never assume the user wants Stripe** unless they've explicitly said so or set `STRIPE_SECRET_KEY` in `.env.local`.

- `isStripeConfigured()` from `lib/stripe.ts` is the source of truth. `getStripe()` throws `StripeNotConfiguredError` if called when env vars are missing — handle this in any new Stripe-touching route.
- Existing routes (`/api/stripe/*`) already return `503` with a "run /add-stripe" message when not configured. Follow the same pattern for any new payment-touching code.
- The webhook handler (`/api/stripe/webhook/route.ts`) returns 200 with `skipped: 'stripe-not-configured'` if env vars are missing — never let it 500.
- If the user asks for something payment-related and `isStripeConfigured()` returns false, **stop and ask first** whether they want to enable payments now (run `/add-stripe`) or whether they want the feature stubbed without billing.

To enable payments later, the user runs `/add-stripe` — that command provisions products, prices, the webhook, and writes env vars. Until then, leave the Stripe scaffolding alone and don't generate Stripe-dependent code.

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

## Motion & WebGL — which tool for which job

Four animation tools are available. Pick the right one per use case, don't reach for all of them on every project:

| Use case | Tool | Why |
| --- | --- | --- |
| Component entrance, hover, layout animations | **Framer Motion** | Declarative, React-native, spring physics built-in |
| Scroll-driven sequences (pin, parallax, story scroll) | **GSAP + ScrollTrigger** | Timelines with labels, scrubbing, snap — nothing else comes close |
| Route transitions (App Router) | `components/page-transition.tsx` | Framer `AnimatePresence` keyed on `usePathname()` — RSC-safe |
| SVG path morphing, stroke-dash | **GSAP** | Use the same GSAP install — no separate library needed |
| Hero 3D, shader backgrounds, GPU-driven visuals | `components/webgl-scene.tsx` (react-three-fiber) | Dynamic-imported, lazy-loaded, drei helpers included |
| Designer-exported playback animation (empty state, hero illustration, success confetti) | `components/lottie-player.tsx` (dotLottie) | Designer owns the animation, you embed the `.lottie` file |
| Interactive, input-driven animation (mascots, illustrated toggles, scrubbable characters) | `components/rive-scene.tsx` (Rive) | State machines respond to pointer/scroll/app state in real time |
| List/grid enter-leave-reorder animations | `hooks/use-auto-animate.ts` (AutoAnimate) | One ref, zero config — animates any children change automatically |
| Inverted cursor / high-contrast overlays | `components/blend-layer.tsx` (`mix-blend-mode: difference`) | Compositor-level, works with any content underneath |

Rules:

- **Never install a new animation library.** The four above cover everything. If you think you need something else (Motion One, Theatre.js, etc.), first check whether GSAP or Framer already does it.
- **GSAP in React:** always wrap timelines in `gsap.context(() => {...}, rootRef)` and call `ctx.revert()` on cleanup. Without this, animations leak on route changes.
- **three.js imports:** always via `next/dynamic({ ssr: false })`. three.js is ~600KB gzipped — it should never hit pages that don't need it.
- **mix-blend-mode cost:** forces an isolated compositor layer. Fine for small overlays, disastrous if you wrap the whole page.
- **Respect `prefers-reduced-motion`:** gate non-essential animations with `useReducedMotion()` from Framer, or check `window.matchMedia('(prefers-reduced-motion: reduce)')` in GSAP/Anime.

## Design Theme (IMPORTANT — DO THIS BEFORE WRITING ANY UI)

On a fresh project, a `DESIGN.md` file at the project root is required before any UI work. During `/setup`, **auto-pick a theme for the user** using the heuristic below — only fall back to asking if the project intent is ambiguous.

### Project interview (required before theme selection)

During `/setup`, ask the user these three questions FIRST — before picking a theme or writing any code:

1. **What are you building?** (one-sentence description)
2. **Who is it for?** (audience — devs, designers, consumers, enterprise, specific niche)
3. **Brand/aesthetic preference?** (dark + minimal, warm + editorial, data-dense, playful, or "you pick")

The answers drive theme selection, `NEXT_PUBLIC_PRODUCT_NAME`, and the tone of all placeholder copy. Skip the interview only if the user has already answered these things in-session.

### Auto-pick heuristic (after the interview)

Use the interview answers as the primary signal, and the project name as a fallback:

| Signal in project name / README | Default theme |
| --- | --- |
| AI / chat / agent / LLM | Claude |
| Dev tools / CLI / API / SDK | Linear |
| Payments / billing / fintech | Stripe |
| Data / analytics / dashboard | Vercel |
| Design / creative / media | Figma |
| Database / infra / backend | Supabase |
| Marketing site / landing-first | Apple |
| Productivity / docs / notes | Notion |
| Build tool / framework | Vercel |
| Nothing specific | Linear (safe default) |

Then, **without prompting the user**:

1. Pick the theme using the table (if no clear match, default to **Linear**).
2. Fetch `https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<site>/DESIGN.md` and save it to the project root as `DESIGN.md`.
3. Announce the choice in one line: e.g. `Auto-selected Linear theme — see DESIGN.md. Say "switch theme to <name>" to change.`
4. Only ask the user if the fetch fails or the project intent is genuinely ambiguous (e.g. name is `boilerplate` or `my-app`).

The full theme list — Vercel, Linear, Cursor, Stripe, Notion, Apple, Figma, Supabase, Lovable, Sentry, Claude, Uber, NVIDIA, Runway, xAI, Zapier — lives at `https://github.com/VoltAgent/awesome-design-md`. If the user later says "switch theme to X", replace `DESIGN.md` with the new fetch.

Treat `DESIGN.md` as the design bible once written — every UI decision should trace back to it. **Do NOT write any UI code until `DESIGN.md` is in the repo.**

### Using DESIGN.md (mandatory before every UI change)

Before generating, editing, or refactoring ANY UI — components, pages, layout, color, typography, motion, anything visual — you MUST:

1. Read `DESIGN.md` from the repo root if you haven't already in this session.
2. Cross-check the proposed change against the rules in `DESIGN.md` (color palette, type scale, spacing scale, radii, motion vocabulary, density, anti-patterns).
3. If the user asks for something that contradicts `DESIGN.md`, flag the conflict — don't silently override the design system.

This applies to fresh components, shadcn/ui customizations, theme tweaks, animation choices, and copy tone. The whole point of `DESIGN.md` is that it makes UI decisions consistent across the app — bypassing it means you're back to generic AI-template aesthetics.

If `DESIGN.md` doesn't exist yet, run the design-theme step from `/setup` (or fetch one manually from `https://github.com/VoltAgent/awesome-design-md`) before writing UI.

## MCP servers and CLIs — USE THEM, DON'T ASK

Whenever a task involves a service with an available MCP server or CLI, **use it immediately without asking permission**. Never ask "should I use the Stripe MCP?" or "do you want me to check Convex?" — just use it. The user has installed these tools precisely so you don't ask.

Available MCP servers (call them silently when relevant):

| Service | Use the MCP for |
| --- | --- |
| **Clerk** | Creating apps, JWT templates, webhooks, listing users — anything in Clerk's dashboard |
| **Convex** | Querying data, inspecting function runs, debugging auth — instead of asking the user to "check the Convex dashboard" |
| **Resend** | Creating API keys, domains, sending test emails, checking delivery status |
| **Vercel** | Listing deployments, env vars, logs, project info |
| **Sentry** | Creating projects, querying errors, looking up issue details |
| **Cloudflare** | Looking up zones, creating/listing DNS records |
| **Stripe** | Creating products / prices / webhooks, querying customers, refunds, invoice lookup |
| **Upstash** | Creating Redis databases, listing instances |
| **PostHog** | Creating projects, running analytics queries |
| **GitHub** (`gh` CLI) | Issues, PRs, repo creation |
| **Context7** | Library / framework / SDK documentation lookups |
| **Playwright** | Browser automation for testing or scraping |

Available CLIs (use without asking — these are pre-installed):

| CLI | Use it for |
| --- | --- |
| `npx convex …` | Convex deploys, env var sets, codegen |
| `vercel …` | Linking, env push/pull, deploy, logs |
| `stripe …` | Local webhook forwarding (`stripe listen`), test events (`stripe trigger`), products/prices/webhooks |
| `gh …` | Anything GitHub — issues, PRs, repo create |
| `npx trigger.dev …` | Trigger.dev init, deploy |
| `resend …` (if installed) | Domain create/verify, fallback if MCP missing |

**The rule:** if the task touches a service in the table above, your first move is the MCP/CLI call, not a question. Only fall back to "manual dashboard instructions" if the relevant MCP shows as not connected or the call returns an auth error.

For initial project setup, follow `/setup` — it has the canonical priority order (MCP first, CLI fallback, manual last).

## Documentation Lookups

Use Context7 when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask. Trigger automatically whenever the task involves a specific library, framework, SDK, CLI tool, or cloud service — even well-known ones (Next.js, React, Tailwind, Stripe, Convex, Clerk, Resend, etc.). Your training data may be stale; verify against current docs before writing code that touches a third-party API.

Skip Context7 for: refactoring, business logic debugging, code review, general programming concepts.

## Manual Setup Reminder

The user is not familiar with dashboard navigation. Whenever a manual setup step is required (grabbing an API key, configuring a webhook, creating a domain record, etc.), provide **exact, click-by-click instructions** — specific page names, button labels, and where to find each value. Never say "grab your API key from the dashboard" — always spell it out. The `/setup` slash command at `.claude/commands/setup.md` is the canonical reference for what manual instructions should look like.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in. See `/setup` for exact steps. Groups:

- **App:** `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PRODUCT_NAME`
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
npm run email:dev    # React Email preview server at http://localhost:3001
npm run build        # Production build
npm run format       # Prettier
npm run lint         # ESLint
```

## Emails

- Templates live in `emails/*.tsx` (React Email). Shared layout primitives at `emails/components/layout.tsx`.
- Typed helpers in `lib/resend.ts`: `sendWelcomeEmail`, `sendSubscriptionConfirmedEmail`, `sendSubscriptionCanceledEmail`, `sendTransactionalEmail`, plus the legacy `sendEmail` for raw HTML.
- Wiring: welcome email fires on Clerk `user.created`. Subscription confirmation fires on Stripe `checkout.session.completed`. Subscription cancellation fires on Stripe `customer.subscription.deleted`. Email failures are Sentry-captured but do not break the webhook.
- When adding a new email: copy `emails/transactional.tsx` as a starting point, export `default` + a `PreviewProps` literal so it shows in `email:dev`, then add a typed `sendXxxEmail` helper to `lib/resend.ts`.
- Never ship inline-style soup — use the primitives from `emails/components/layout.tsx` (`EmailLayout`, `Heading`, `Paragraph`, `ActionButton`, `DetailRow`).

## Bootstrap

New clone? Open Claude Code in the project directory and run `/setup`. It handles everything automatically and walks you through the remaining manual steps.
