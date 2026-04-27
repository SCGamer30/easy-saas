# Easy SaaS

Production-ready Next.js 15 starter for shipping a SaaS in an afternoon. Provisioned by Claude Code — clone, answer four questions, and you have a deployed app with auth, database, email, analytics, error monitoring, and rate limiting wired up.

**Setup time: ~3 minutes.** **Cost to run: $0/month** until real users show up.

---

## Features

- **Auth + user data** — Clerk + Convex, synced via webhook
- **Realtime database** — Convex with typed queries and reactive subscriptions
- **Payments (opt-in)** — Stripe Checkout, billing portal, webhook handlers — disabled until you run `/add-stripe`
- **AI features (opt-in)** — Vercel AI SDK + OpenRouter — disabled until you run `/add-ai`
- **Transactional email** — Resend + React Email templates from your own domain
- **Analytics** — PostHog with feature flags and session replay
- **Errors** — Sentry across client / server / edge
- **Rate limiting** — Upstash Redis sliding-window limiters
- **Background jobs** — Trigger.dev with graceful shutdown
- **Forms** — React Hook Form + Zod
- **Toasts + theme** — Sonner + next-themes (light / system / dark)
- **Motion** — Framer Motion + GSAP + Lenis smooth scroll
- **Visual** — three.js + R3F + drei for WebGL, Rive for state-machine animations, Lottie for designer playback, AutoAnimate for list reorders
- **SEO + app shell** — metadata API, sitemap, robots, OG image, 404, loading skeleton, error boundaries
- **Security headers + CI** — HSTS, X-Frame-Options, GitHub Actions lint + typecheck on every PR
- **Auto-picked design system** — `/setup` writes a `DESIGN.md` matching your project type (Linear / Vercel / Stripe / Apple / etc.)

---

## $0 until you scale

Every service has a free tier large enough to launch and acquire your first thousand users without paying anything. Total monthly cost from clone to first paying customer: **$0**.

| Service | Free tier | Outgrown around |
| --- | --- | --- |
| **Vercel** (hosting) | 100 GB bandwidth | 10k–50k visitors/mo |
| **Clerk** (auth) | 10,000 MAU | 10k MAU → $25/mo |
| **Convex** (database) | 1M function calls, 1 GB | Months of early-stage traffic |
| **Resend** (email) | 3,000 emails/month | 3k → $20/mo for 50k |
| **PostHog** (analytics) | 1M events/month | Most products take a long time to hit 1M |
| **Sentry** (errors) | 5,000 errors/month | Only matters at high error rates |
| **Upstash** (Redis) | 10,000 commands/day | Plenty for rate limiting |
| **Trigger.dev** (jobs) | 5,000 runs/month | Most apps run <5k/month early on |
| **Stripe** (payments) | No monthly fee | 2.9% + 30¢ per charge — pay only when you earn |
| **Total** | **$0/month** | |

When you do outgrow a tier, every service is $20–30/mo at the next step and scales linearly. No seat-based pricing, no enterprise sales gates.

---

## Quick start

### Prerequisites (one-time)

```bash
brew install gh                                # GitHub CLI
brew install stripe/stripe-cli/stripe          # only if you'll use payments
npm i -g vercel                                # Vercel CLI
```

You'll also need [Node.js 20+](https://nodejs.org) and [Claude Code](https://claude.com/claude-code).

### Create a project

```bash
cd ~/Documents/GitHub/easy-saas
./new-project.sh my-app
cd ~/Documents/GitHub/my-app
claude
```

Inside Claude Code:

```
/setup
```

Answer four questions — what you're building, who it's for, brand preference, payments now or later — and Claude provisions everything. From clone to running locally: about three minutes.

### Run it

```bash
npm run dev          # Next.js on http://localhost:3000
npm run convex:dev   # Convex (second terminal)
npm run email:dev    # React Email preview on http://localhost:3001
```

---

## Slash commands

| Command | What it does |
| --- | --- |
| `/setup` | Provisions auth, DB, email, analytics, errors, rate limit, jobs, design theme |
| `/add-stripe` | Enables payments on a project that scaffolded without them |
| `/add-ai` | Wires Vercel AI SDK + OpenRouter for chat/generation/agents |

The senior UI/UX rules used to be a slash command — they're now a standing reference at [`TASTE.md`](./TASTE.md), mandated by AGENTS.md before any UI work.

---

## How automation works

`/setup` provisions services through a mix of CLIs and MCP servers. You install the MCPs once for your account; they're reused across every project you scaffold from this boilerplate.

| Service | Provisioned via |
| --- | --- |
| Convex | `npx convex dev` (CLI) |
| Vercel | `vercel link` (CLI) |
| Clerk | Clerk MCP — creates app, JWT template, webhook |
| Resend | Resend MCP — creates API key, domain, verifies it |
| Cloudflare DNS | Cloudflare MCP — writes Vercel CNAME + Resend MX/SPF/DKIM |
| Sentry | Sentry MCP — creates project, returns DSN |
| Upstash | Upstash MCP — creates Redis DB |
| PostHog | PostHog MCP — creates project, returns API key |
| Stripe | Stripe MCP / CLI (only on `/add-stripe`) |
| Trigger.dev | `npx trigger.dev init` (CLI) |
| GitHub | `gh` CLI — creates repo, pushes initial commit |
| Design theme | `curl` from VoltAgent's awesome-design-md → `DESIGN.md` |

After all that, the only manual click left is grabbing two **Stripe API keys** from the dashboard — and only if you opted into payments. Stripe doesn't expose secret keys via API, by design.

### Recommended MCP servers

Install whichever you want — `/setup` works with whatever subset you have and falls back to manual instructions for anything missing. Each MCP is a one-time install in `~/.claude.json`; reused across every project.

| MCP | Install command (Claude Code) | Docs |
| --- | --- | --- |
| Clerk | `claude mcp add clerk --transport http https://mcp.clerk.com/mcp` | [clerk.com](https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server) |
| Convex | `claude mcp add-json convex '{"type":"stdio","command":"npx","args":["convex","mcp","start"]}'` | [docs.convex.dev](https://docs.convex.dev/ai/convex-mcp-server) |
| Resend | `claude mcp add resend -e RESEND_API_KEY=<your_key> -- npx -y resend-mcp` | [resend.com](https://resend.com/docs/mcp-server) |
| Vercel | `claude mcp add --transport http vercel https://mcp.vercel.com` | [vercel.com](https://vercel.com/docs/agent-resources/vercel-mcp#claude-code) |
| Sentry | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` | [docs.sentry.io](https://docs.sentry.io/product/sentry-mcp/) |
| Cloudflare | Add via the Claude.ai → Settings → Connectors marketplace (no CLI yet) | [developers.cloudflare.com](https://developers.cloudflare.com/agents/model-context-protocol/) |
| Stripe | `claude mcp add --transport http stripe https://mcp.stripe.com/` | [docs.stripe.com](https://docs.stripe.com/mcp) |
| Upstash | `claude mcp add --scope user upstash -- npx -y @upstash/mcp-server@latest --email <your_email> --api-key <your_key>` | [github.com/upstash/mcp-server](https://github.com/upstash/mcp-server) |
| PostHog | `claude mcp add --transport http posthog https://mcp.posthog.com/mcp -s user` | [posthog.com](https://posthog.com/docs/model-context-protocol/claude-code) |
| Context7 | `npx ctx7` (auto-config) | [context7.com](https://context7.com) |
| Playwright | Built into Claude Code | — |

After running each command, restart Claude Code and run `/mcp` to confirm `connected`. Most use OAuth — Claude will prompt you to authorize on first use. The Resend and Upstash entries take an API key inline; grab those from each provider's dashboard first.

MCP install patterns evolve quickly — if a command above stops working, the linked docs page is canonical.

---

## Buy your domain at Porkbun, manage DNS at Cloudflare

`.com` for ~$11/yr at [Porkbun](https://porkbun.com), nameservers pointed to Cloudflare. The Cloudflare MCP wired into `/setup` and `/add-stripe` writes every record you need automatically (Vercel CNAME, Resend MX/SPF/DKIM). After this one-time setup, you never touch DNS again.

The boilerplate already configures custom-domain email — change `FROM_EMAIL` in `.env.local` to `hello@yourdomain.com`, `team@`, whatever — every Resend email respects it.

---

## Use it modular or full-stack

You don't need everything. Common patterns:

- **Marketing site** — keep Next.js, Tailwind, motion stack, SEO, analytics. Delete `convex/`, `app/sign-in/`, `app/api/stripe/`, `middleware.ts`. ~5 minutes of pruning.
- **SaaS without payments yet** — answer "later" to `/setup`'s payment question. Stripe scaffolding stays dormant until `/add-stripe`.
- **Full SaaS** — answer "now". Everything wires up in one shot.

---

## Project layout

```
app/                    # Next.js App Router pages + API routes
.claude/commands/       # /setup, /add-stripe, /add-ai
TASTE.md                # standing UI/UX rules (mandatory before any UI work)
DESIGN.md               # project-specific theme (auto-fetched by /setup)
components/             # React components (shadcn/ui in components/ui/)
convex/                 # Convex schema, queries, mutations
emails/                 # React Email templates
hooks/                  # useUser() — Clerk + Convex + subscription
lib/                    # stripe, resend, ratelimit, errors, env, ai
trigger/                # Trigger.dev background jobs
```

---

## Conventions

`AGENTS.md` (also linked as `CLAUDE.md` for Claude Code compat) is the source of truth for every architectural rule — icons, motion library decision tree, error handling, Stripe-is-opt-in, security non-negotiables, MCP/CLI usage rules. Every coding agent reads it automatically. If you're editing manually, skim it once.

---

## Deploying

`/setup` links the project to Vercel. Push to `master` — it deploys. Env vars are synced via `vercel env`. `/add-stripe` and `/add-ai` push their own env vars to Vercel automatically.

---

## License

**Apache License 2.0.** See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

You're free to use, modify, distribute, and build commercial products on top of this — no permission needed. Two requirements:

1. **Keep the `LICENSE` and `NOTICE` files** in any distribution (source or binary).
2. **Credit the original author** somewhere visible — README, "About" page, credits screen, footer. Suggested attribution:
   > *Built on Easy SaaS Boilerplate by Shaurya Chowdhri — https://github.com/SCGamer30/easy-saas*

That's it. Ship whatever you want.

For questions: shauryachowdhri@gmail.com
