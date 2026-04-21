---
name: setup
description: Fully provision this boilerplate — installs deps, links Convex + Vercel + Sentry + Cloudflare + Trigger.dev, then walks the user through every remaining manual step with exact click-by-click instructions.
---

# /setup

You are setting up a fresh clone of this boilerplate for the user. The user is NOT familiar with dashboard navigation. Do every automated step yourself, then give them copy-paste-grade manual instructions for the rest.

## 1. Ensure `.env.local` exists

If `.env.local` is missing, copy `.env.example` to `.env.local`.

```bash
[ -f .env.local ] || cp .env.example .env.local
```

## 2. Install dependencies

```bash
npm install
```

## 3. Provision Convex

Run Convex dev once to create the deployment and capture the URL. Capture stdout and extract the `NEXT_PUBLIC_CONVEX_URL` value — it will be printed in the output. Write it into `.env.local`.

```bash
npx convex dev --once --configure=new
```

If the command prints a URL like `https://<name>.convex.cloud`, update `NEXT_PUBLIC_CONVEX_URL` in `.env.local` to that value.

## 4. Link Vercel and pull env

```bash
vercel link
vercel env pull .env.local
```

Tell the user: if they don't have a Vercel project yet, the `vercel link` command will prompt them to create one — accept the defaults unless they have a reason to override.

## 5. Sentry — use the connected Sentry MCP

If the Sentry MCP is connected, call it to:

- Create a new Sentry project (platform: `javascript-nextjs`)
- Capture the DSN, organization slug, and project slug
- Write those values into `.env.local` as `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`

If the Sentry MCP is NOT connected, add Sentry to the manual checklist below.

## 6. Cloudflare DNS — use the connected Cloudflare MCP

Ask the user: "Do you have a custom domain you want to point at this project? If so, what is it?"

If yes, and the Cloudflare MCP is connected, use it to:

- Look up the zone for that domain
- Create a CNAME record pointing `@` (or the chosen subdomain) to `cname.vercel-dns.com`
- Confirm the record was created

If no custom domain or MCP not connected, skip.

## 7. Initialize Trigger.dev

Run the Trigger.dev init command to link the project. It will prompt to create a Trigger.dev project or select an existing one and write `TRIGGER_PROJECT_ID` into `trigger.config.ts`.

```bash
npx trigger.dev@latest init
```

If the user skips this step (e.g. not using background jobs yet), remove `@trigger.dev/sdk`, `trigger.config.ts`, and the `trigger/` directory later.

---

## Manual checklist — DO THESE AFTER the automated steps

Print this checklist verbatim to the user. Every step must be specific enough that someone who has never opened these dashboards can follow it exactly. Do NOT say "grab your API key" — tell them where to click.

### A. Clerk — Publishable Key, Secret Key, Webhook Secret, JWT Template for Convex

1. Go to https://dashboard.clerk.com and sign in (or create an account).
2. Click **Create application** in the top right. Name it anything. Enable **Email** and **Google** as sign-in methods. Click **Create application**.
3. On the application dashboard, click **API Keys** in the left sidebar.
4. Copy the **Publishable key** (starts with `pk_test_`) — paste into `.env.local` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
5. Click the eye icon next to **Secret keys** to reveal it. Copy it (starts with `sk_test_`) — paste into `.env.local` as `CLERK_SECRET_KEY`.
6. **JWT Template for Convex (REQUIRED — Convex auth silently fails without this):**
   - In the left sidebar, click **JWT Templates**.
   - Click **New template**. Select the **Convex** preset.
   - The name must be exactly `convex` — do NOT change it.
   - Click **Apply changes**.
7. **Webhooks:**
   - In the left sidebar, click **Webhooks**, then click **Add Endpoint**.
   - **Endpoint URL:** `https://<your-domain>/api/webhooks/clerk` (use your Vercel production URL).
   - Under **Subscribe to events**, check `user.created`, `user.updated`, and `user.deleted`.
   - Click **Create**.
   - On the endpoint detail page, click **Signing Secret** → copy (starts with `whsec_`) → paste into `.env.local` as `CLERK_WEBHOOK_SECRET`.

### B. Stripe — Publishable Key, Secret Key, Webhook Secret, Products

1. Go to https://dashboard.stripe.com and sign in. Make sure the **Test mode** toggle (top right) is ON.
2. Click **Developers** in the top nav, then **API keys** in the left sidebar.
3. Copy the **Publishable key** (starts with `pk_test_`) — paste into `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Click **Reveal test key** next to the **Secret key**. Copy it (starts with `sk_test_`) — paste into `.env.local` as `STRIPE_SECRET_KEY`.
5. **Webhooks (production):**
   - In the left sidebar under Developers, click **Webhooks**, then **Add endpoint**.
   - **Endpoint URL:** `https://<your-domain>/api/stripe/webhook`.
   - Click **Select events** and check:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click **Add events**, then **Add endpoint**.
   - On the endpoint detail page, click **Reveal** under **Signing secret**. Copy (starts with `whsec_`) → paste into `.env.local` as `STRIPE_WEBHOOK_SECRET`.
6. **Webhooks (local dev):** Stripe can't POST to localhost, so forward events locally:
   ```bash
   brew install stripe/stripe-cli/stripe   # first time only
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   The `stripe listen` command prints a `whsec_...` signing secret. For local dev, paste that into `.env.local` as `STRIPE_WEBHOOK_SECRET` (different from production).
7. **Create products and prices — CRITICAL, lookup_key must match exactly:**
   - In the left sidebar, click **Product catalog** → **Add product**.
   - Create a product called **Pro**. Add a recurring price (e.g. $20/month).
   - After creating the price, click it to open its detail page. Click **Edit price** → scroll to **Lookup key** → set it to `pro` (exactly that slug, lowercase).
   - Repeat for **Studio**: create the product, add a price, set the **Lookup key** to `studio`.
   - If you plan to gate features by plan name (e.g. `isPro`, `isStudio` from `useUser()`), the lookup key in Stripe must match **exactly** — the Convex `subscriptions.plan` field stores whatever Stripe sends in `price.lookup_key`. Mismatches cause silent billing bugs (paid users show as unpaid).

### C. Resend — API Key + Verified Domain

1. Go to https://resend.com/api-keys and sign in.
2. Click **Create API Key**. Name it after your project. Permission: **Full access**. Click **Add**.
3. Copy the key (starts with `re_`) — paste into `.env.local` as `RESEND_API_KEY`.
4. **Verify your domain (required to send from anything other than Resend's sandbox):**
   - In the Resend sidebar, click **Domains** → **Add Domain**.
   - Enter the domain you'll send email from (e.g. `yourdomain.com`). Click **Add**.
   - Resend shows a list of DNS records (usually 3: MX, TXT/SPF, TXT/DKIM). You must add these at your DNS provider (Cloudflare, Vercel DNS, etc.):
     - If using **Cloudflare**, log in → select the domain → **DNS** → **Records** → **Add record** for each one. **Turn off the orange cloud (proxy)** for MX and TXT records — they must be DNS-only.
     - If using **Vercel DNS**, go to the project → **Settings** → **Domains** → the domain → **Add record** for each.
   - Back in Resend, click **Verify DNS Records**. Wait up to 10 minutes for propagation. When all three show green, the domain is verified.
5. Update `FROM_EMAIL` in `.env.local` to a sender at that domain (e.g. `noreply@yourdomain.com`).

### D. Upstash Redis — REST URL, REST Token

1. Go to https://console.upstash.com and sign in.
2. Click **Create Database** (top right). Choose **Redis**. Name it after your project. Region: the nearest one to your Vercel region. Click **Create**.
3. On the database page, scroll down to **REST API**.
4. Copy **UPSTASH_REDIS_REST_URL** — paste into `.env.local` with the same name.
5. Copy **UPSTASH_REDIS_REST_TOKEN** — paste into `.env.local` with the same name.

### E. PostHog (optional, skip if not using analytics)

1. Go to https://us.posthog.com and sign in.
2. Click the project selector (top left), then **New project**. Name it.
3. Go to **Project settings** (gear icon, bottom left) → **Project API keys**.
4. Copy the **Project API key** — paste into `.env.local` as `NEXT_PUBLIC_POSTHOG_KEY`.
5. `NEXT_PUBLIC_POSTHOG_HOST` stays as `https://us.i.posthog.com` unless you're on EU cloud.
6. Note: PostHog only initializes in production builds (see `components/providers.tsx`). You will NOT see events during `npm run dev`.

### F. Trigger.dev (skip if you didn't run step 7)

1. Go to https://cloud.trigger.dev and sign in.
2. Click **New Project**. Name it.
3. Go to **API Keys** in the left sidebar. Copy the **DEV Server** key (starts with `tr_dev_`).
4. Paste into `.env.local` as `TRIGGER_SECRET_KEY`.

---

## Final step — push env vars to Vercel

Every secret you just added to `.env.local` also needs to exist in Vercel for production builds. Critical ones that break in production if missing:

- `NEXT_PUBLIC_APP_URL` — must be set to the production URL (e.g. `https://yourdomain.com`). `generateMeta()` uses this for canonical URLs, and Stripe `create-checkout` uses it for success/cancel redirects. Without it, meta tags and Stripe redirects silently fall back to localhost.
- `NEXT_PUBLIC_CONVEX_URL` — your production Convex deployment URL.
- `CLERK_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET` — production values, different from local.
- All other keys (Clerk, Stripe, Resend, Upstash, Sentry, PostHog, Trigger).

Push them via CLI:

```bash
# Add to production (will prompt for value)
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_CONVEX_URL production
# ...repeat for each secret

# Or bulk: open the Vercel dashboard
# https://vercel.com/<you>/<project>/settings/environment-variables
```

Re-pull to sync local with prod values:

```bash
vercel env pull .env.local
```

---

## Start dev

```bash
npm run dev
```

In a second terminal:

```bash
npx convex dev
```

In a third (if using Stripe locally):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The app should be live at http://localhost:3000.
