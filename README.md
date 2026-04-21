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
