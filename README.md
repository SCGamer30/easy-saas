# Boilerplate

A production-ready Next.js 15 SaaS starter that **Claude Code provisions for you**. Clone the boilerplate, run one script, answer four questions in chat, and you have a deployed app with auth, database, email, analytics, error monitoring, rate limiting, and (optionally) payments — all wired up.

You can use the whole thing or just the parts you need. Everything is modular — Stripe is opt-in, all services have ergonomic fallbacks, and every integration is documented in `CLAUDE.md` so future Claude sessions know what to do.

## What's inside

- **Framework** — Next.js 15 (App Router, React 19, TypeScript strict)
- **Auth** — Clerk
- **Database** — Convex (realtime, typed, RSC-safe)
- **Payments** — Stripe (opt-in — disabled by default, enable with `/add-stripe`)
- **Email** — Resend + React Email templates
- **Analytics** — PostHog
- **Error monitoring** — Sentry (client + server + edge)
- **Rate limiting** — Upstash Redis
- **Background jobs** — Trigger.dev
- **Styling** — Tailwind CSS v4 + shadcn/ui + Phosphor Icons
- **Motion** — Framer Motion + GSAP + Anime.js + Barba.js + Lenis
- **Visual** — three.js + R3F + drei (WebGL), Rive, Lottie, AutoAnimate, mix-blend-mode utility
- **Quality of life** — Security headers, SEO metadata, sitemap, robots, OG image, 404 page, loading skeleton, GitHub Actions CI (lint + typecheck), error boundaries, MIT license

## How automation works

This boilerplate is unusual — it's designed to be provisioned through Claude Code, not by hand. The `/setup` slash command provisions everything via CLIs and MCP servers. Here's what gets automated for you:

| Service | How it's provisioned |
| --- | --- |
| **Convex** | `npx convex dev` (CLI) — creates the deployment, sets env vars |
| **Vercel** | `vercel link` + `vercel env pull` (CLI) — links the project, pulls env |
| **Clerk** | Clerk MCP — creates the application, JWT template, webhook |
| **Resend** | Resend MCP — creates API key, domain, verifies it |
| **Sentry** | Sentry MCP — creates the project, grabs DSN |
| **Cloudflare DNS** | Cloudflare MCP — writes DNS records (Vercel CNAME + Resend MX/SPF/DKIM) |
| **Upstash Redis** | Upstash MCP — creates the database, returns REST URL/token |
| **PostHog** | PostHog MCP — creates the project, returns API key |
| **Stripe** | Stripe MCP / CLI — creates products, prices, webhook (only when you run `/add-stripe`) |
| **Trigger.dev** | `npx trigger.dev init` (CLI) |
| **GitHub** | `gh` CLI — creates the repo, pushes initial commit |
| **Design theme** | `curl` from VoltAgent's awesome-design-md, written to `DESIGN.md` |

After all that runs, the only manual step is grabbing **Stripe API keys** (and only if you opted into payments) — Stripe doesn't expose secret keys via API, so you copy two values from the Stripe dashboard. That's it.

## Prerequisites

### CLIs (one-time install)

```bash
brew install gh                                # GitHub CLI
brew install stripe/stripe-cli/stripe          # Stripe CLI (only needed if you'll use payments)
npm i -g vercel                                # Vercel CLI
```

You'll also need:

- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **[Claude Code](https://claude.com/claude-code)** — this is what runs `/setup` and the MCPs

### MCP servers (recommended — install once, reuse for every project)

These are the magic. Install whichever you want — `/setup` works with whatever subset you have, with fallback paths for missing ones.

**Highly recommended (covers 90% of automation):**

| MCP | Install | What it does |
| --- | --- | --- |
| **Clerk** | https://github.com/clerk/mcp-server | Provisions auth apps + webhooks |
| **Convex** | https://docs.convex.dev/ai/mcp | Inspects data, debugs functions |
| **Resend** | https://resend.com/docs/mcp | API keys + domain creation/verify |
| **Vercel** | Built-in via Claude Code plugin marketplace | Deployments, env vars, logs |
| **Sentry** | https://docs.sentry.io/platforms/javascript/guides/nextjs/profiling/ (claude.ai connector) | Project creation + DSN |
| **Cloudflare** | claude.ai connector | DNS records for Vercel + Resend |

**Nice to have:**

| MCP | Install | What it does |
| --- | --- | --- |
| **Stripe** | https://github.com/stripe/agent-toolkit | Manage products / refunds / webhooks |
| **Upstash** | https://github.com/upstash/mcp-server | Create Redis DBs |
| **PostHog** | https://posthog.com/docs/ai-engineering/mcp | Create projects + run analytics queries |
| **Context7** | `npx ctx7` | Up-to-date library docs (used automatically by Claude) |
| **Playwright** | Built-in | Browser automation for e2e tests |

For each MCP, follow the linked docs to add it to `~/.claude.json`. Restart Claude Code, then run `/mcp` to confirm `connected`. The `/setup` command checks which MCPs are available and uses them — you'll never get a "missing MCP" error, just a fallback to manual instructions for that one service.

## Use it modular or full-stack

You don't have to use everything. Common patterns:

- **Marketing site / portfolio** — keep Next.js, Tailwind, Framer Motion, GSAP, WebGL, Sentry, PostHog, SEO. Delete `convex/`, `app/sign-in/`, `app/sign-up/`, `app/api/stripe/`, `app/api/webhooks/clerk/`, `middleware.ts`, `hooks/use-user.ts`, `lib/stripe.ts`. ~5 minutes of pruning.
- **SaaS without payments yet** — answer "later" to the payments question in `/setup`. Stripe scaffolding stays in place but stays dormant. Run `/add-stripe` when you're ready to monetize.
- **Full SaaS with payments on day one** — answer "now" to the payments question. Everything wires up.
- **Just the design system** — copy `app/globals.css`, `components/ui/`, the icon/motion conventions from `CLAUDE.md`. Skip everything else.

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

`/setup` will ask you four questions:

1. **What are you building?** (one sentence)
2. **Who is it for?** (audience)
3. **Brand / aesthetic preference?** (or "you pick")
4. **Payments now or later?** (default: later)

Then it provisions everything. After it finishes, you start prompting Claude to build features. Total time from `./new-project.sh` to "I'm building features": ~3 minutes.

## Slash commands

| Command | What it does |
| --- | --- |
| `/setup` | Full project provisioning (auth, DB, email, analytics, errors, rate limit, jobs) |
| `/add-stripe` | Enable payments on a project that scaffolded without them |
| `/design-taste-frontend` | Senior UI/UX rules — design tokens, motion intensity, density, anti-patterns |

## Running locally

After `/setup`:

```bash
npm run dev          # Next.js on http://localhost:3000
npm run convex:dev   # Convex dev server (second terminal)
npm run email:dev    # React Email preview on http://localhost:3001
```

If you enabled Stripe via `/add-stripe`, also run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook   # third terminal
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
  api/stripe/           # checkout, billing portal, webhook (opt-in)
  api/webhooks/clerk/   # Clerk user sync
.claude/commands/       # /setup, /add-stripe, /design-taste-frontend
components/             # React components (shadcn/ui in components/ui/)
convex/                 # Convex schema, queries, mutations
emails/                 # React Email templates
hooks/                  # useUser() hook (Clerk + Convex + subscription)
lib/                    # stripe, resend, ratelimit, errors, metadata, gsap, anime
trigger/                # Trigger.dev background jobs
```

## Conventions

`CLAUDE.md` at the repo root is the design bible — icons, motion library decision tree, error handling, Stripe-is-opt-in, email primitives, design theme workflow, MCP/CLI usage rules. Claude Code reads it automatically every session. If you're editing manually, skim it once before you change anything.

## Why this stack

Every service has a generous free tier. You can build, launch, and get real users for **$0/month**. When you outgrow the free tiers, every service stays cheap — most are $20–30/mo at the next tier, scaling linearly with usage. No seat-based pricing, no "contact sales" walls.

| Service | Free tier | When you'd outgrow it |
| --- | --- | --- |
| **Vercel** (hosting) | 100 GB bandwidth | ~10k–50k monthly visitors |
| **Clerk** (auth) | 10,000 MAU | After 10k MAU → $25/mo + $0.02/MAU |
| **Convex** (database) | 1M function calls, 1 GB storage | Months for early-stage SaaS |
| **Stripe** (payments) | No monthly fee | 2.9% + 30¢ per transaction |
| **Resend** (email) | 3,000 emails/month | After 3k → $20/mo for 50k |
| **PostHog** (analytics) | 1M events/month | Most products send <1M for a long time |
| **Sentry** (errors) | 5,000 errors/month | Only matters at high error rates |
| **Upstash** (Redis) | 10,000 commands/day | Plenty for rate limiting |
| **Trigger.dev** (jobs) | 5,000 runs/month | Most apps run <5k jobs/month |
| **GitHub** | Unlimited private repos, 2,000 CI min | CI here is ~1 min per PR |

## Deploying

`/setup` links the project to Vercel. Push to `master` and it deploys. Environment variables are synced via `vercel env`. Nothing else to configure.

When you do `/add-stripe` (or enable payments during initial setup), the slash command also pushes Stripe env vars to Vercel and registers the production webhook automatically.

## License

MIT. Do whatever you want with it.
