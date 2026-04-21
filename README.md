# Boilerplate

A production-ready Next.js 15 SaaS starter. Clone it, run one script, answer a few prompts, and you have a live app with auth, payments, email, analytics, and error monitoring wired up.

## What's inside

- **Framework** — Next.js 15 (App Router, React 19, TypeScript strict)
- **Auth** — Clerk
- **Database** — Convex (realtime, typed)
- **Payments** — Stripe (checkout + billing portal + webhook already wired)
- **Email** — Resend + React Email templates (welcome, subscription confirmed, subscription canceled)
- **Analytics** — PostHog
- **Error monitoring** — Sentry (client + server + edge, with error boundaries)
- **Rate limiting** — Upstash Redis
- **Background jobs** — Trigger.dev
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **Icons** — Phosphor Icons
- **Motion** — Framer Motion + Lenis smooth scroll

Security headers, SEO metadata, sitemap, robots.txt, 404 page, loading skeletons, and a GitHub Actions CI workflow (lint + typecheck) are all included.

## Why I chose this stack

Every service here has a generous free tier. You can build, launch, and get real users before paying a single dollar — and when you do start paying, it scales linearly with usage, not with a surprise enterprise invoice.

Rough free-tier limits (verify current pricing on each provider's site — these change):

| Service | Free tier | When you'd outgrow it |
| --- | --- | --- |
| **Vercel** (hosting) | 100 GB bandwidth, unlimited deploys | ~10k–50k monthly visitors |
| **Clerk** (auth) | 10,000 monthly active users | After 10k MAU → $25/mo + $0.02/MAU |
| **Convex** (database) | 1M function calls, 1 GB storage, 1 GB bandwidth | Typical early-stage SaaS stays free for months |
| **Stripe** (payments) | No monthly fee | 2.9% + 30¢ per transaction — only pay when you make money |
| **Resend** (email) | 3,000 emails/month, 100/day | After 3k emails → $20/mo for 50k |
| **PostHog** (analytics) | 1M events/month, session recording, feature flags | Most products send <1M events for a long time |
| **Sentry** (errors) | 5,000 errors + 10,000 performance units/month | Only matters if you're throwing a lot of errors |
| **Upstash** (Redis / rate limiting) | 10,000 commands/day, 256 MB | Plenty for rate limiting a small app |
| **Trigger.dev** (background jobs) | 5,000 runs/month | Most apps run <5k jobs/month early on |
| **GitHub** | Unlimited private repos, 2,000 CI minutes/month | CI here is lint + typecheck, ~1 min per PR |
| **Total** | **$0/month** | Until you have real paying users |

Once you cross the free tiers, every service stays cheap — most are $20–30/mo at the next tier, and they scale with usage. No seat-based pricing, no "contact sales" walls.

Why this specific combination:

- **Clerk + Convex** — auth and database that sync automatically via a webhook. No hand-rolled user table, no session management, no ORM boilerplate.
- **Stripe** — industry standard. The webhook in this boilerplate handles the three events you actually need (checkout complete, subscription updated, subscription canceled) and syncs to Convex.
- **Resend + React Email** — write emails as React components instead of HTML string soup. Preview them locally at `npm run email:dev`.
- **Sentry + PostHog** — separate tools for separate jobs. Sentry catches errors, PostHog tells you what users actually do.
- **Upstash + Trigger.dev** — serverless Redis and serverless background jobs. No "spin up a worker" infrastructure.
- **Next.js + Vercel** — deploy on push. Zero DevOps.

The total cost to go from empty repo to live SaaS collecting payments is **$0** until you have real usage. That's why this stack.

## Prerequisites

Install these once:

```bash
brew install gh                    # GitHub CLI
npm i -g vercel                    # Vercel CLI
```

You'll also need Node.js 20+ ([nodejs.org](https://nodejs.org)) and [Claude Code](https://claude.com/claude-code).

## Create a new project

From this boilerplate directory:

```bash
cd ~/Documents/GitHub/boilerplate
./new-project.sh my-app
cd ~/Documents/GitHub/my-app
claude
```

Then inside Claude Code:

```
/setup
```

The `/setup` command walks you through every dashboard (Clerk, Convex, Stripe, Resend, PostHog, Sentry, Upstash, Trigger.dev) with click-by-click instructions — specific page names, button labels, and where to find each value. It auto-picks a design theme based on your project name and writes a `DESIGN.md` the AI will follow for every UI decision.

## What the scaffold script does

`new-project.sh my-app` will:

1. Clone this boilerplate to `~/Documents/GitHub/my-app`
2. Detach the boilerplate git remote
3. Rename `package.json` and `CLAUDE.md` to use your project name
4. Copy `.env.example` → `.env.local`
5. Run `npm install`
6. Create a private GitHub repo and push

You end up with a fresh, independent project. The original boilerplate is untouched.

## Running locally

After `/setup` fills in your env vars:

```bash
npm run dev          # Next.js on http://localhost:3000
npm run convex:dev   # Convex dev server (run in a second terminal)
npm run email:dev    # React Email preview on http://localhost:3001
```

Other scripts:

```bash
npm run build        # production build
npm run lint         # ESLint
npm run format       # Prettier
```

## Project layout

```
app/                    # Next.js App Router pages + API routes
  api/stripe/           # checkout, billing portal, webhook
  api/webhooks/clerk/   # Clerk user sync
components/             # React components (shadcn/ui in components/ui/)
convex/                 # Convex schema, queries, mutations
emails/                 # React Email templates
hooks/                  # useUser() hook (Clerk + Convex + subscription)
lib/                    # stripe, resend, ratelimit, errors, metadata
trigger/                # Trigger.dev background jobs
```

## Conventions

`CLAUDE.md` at the repo root documents every architectural rule — icons, motion, error handling, Stripe webhook discipline, email primitives, design theme workflow. Claude Code reads it automatically. If you're editing the project yourself, skim it once.

## Deploying

The `/setup` command links the project to Vercel. Push to `master` and it deploys. Environment variables set during `/setup` are already synced to Vercel.

You still need to do these manually (the setup guide tells you exactly where to click):

- Point your production Clerk, Stripe, and Convex deployments at your Vercel URL
- Add your domain to Clerk's allowed origins
- Create Stripe products with `lookup_key` set to `pro`, `studio`, etc. (matching the keys `useUser()` checks)
- Point the Stripe webhook at `https://yourdomain.com/api/stripe/webhook`
- Point the Clerk webhook at `https://yourdomain.com/api/webhooks/clerk`

## License

MIT. Do whatever you want with it.
