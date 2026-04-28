---
name: setup
description: Fully provision this boilerplate — installs deps, links Convex + Vercel + Sentry + Cloudflare + Trigger.dev, auto-picks a design theme, then walks the user through every remaining manual step with exact click-by-click instructions.
---

# /setup

You are setting up a fresh clone of this boilerplate for the user. The user is NOT familiar with dashboard navigation. Do every automated step yourself, then give them copy-paste-grade manual instructions for the rest.

## 0. Ask what the user is building (REQUIRED — theme depends on this)

Before picking a theme, have a short conversation to understand the project. Project name alone is often not enough (`my-app`, `saas-starter`, etc.). Ask these exact questions in one message, numbered, so the user can answer inline:

1. **What are you building?** One sentence — "a dashboard for tracking crypto portfolios", "a marketing site for a design agency", "an AI writing tool", etc.
2. **Who is it for?** Developers, designers, general consumers, enterprise buyers, a specific niche?
3. **Do you already have a brand / aesthetic in mind?** (dark + minimal, warm + editorial, data-dense, playful, etc.) — or should you pick one based on the domain?
4. **Are you adding payments now, or later?** Default is **later**. Most projects don't need Stripe on day one — ship the product first, add billing when there's something worth charging for. If "later," skip section B (Stripe) entirely; the user can run `/add-stripe` to enable it whenever they're ready. The boilerplate's `lib/stripe.ts` lazy-inits, so the app runs fine without `STRIPE_SECRET_KEY` set.

Wait for the answers before moving on. Use them to:
- Override the name-based theme heuristic if the project is clearly in a different category than the name suggests.
- Inform `NEXT_PUBLIC_PRODUCT_NAME` and the tone of copy in placeholder pages.
- Guide all future UI decisions (density, motion, color, typography) alongside `DESIGN.md`.

## 0a. Auto-pick a design theme (based on the answers above)

Using the answers from step 0, infer an appropriate theme. Use the auto-pick heuristic table in `CLAUDE.md` → "Design Theme" as the baseline, but let the user's answers override the name-based guess. Default to **Linear** if nothing matches.

Then, without prompting:

```bash
THEME=linear   # or the slug you picked — see CLAUDE.md for the table
curl -fsSL "https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/$THEME/DESIGN.md" -o DESIGN.md
```

Announce the choice in one line: `Auto-selected <Theme> theme — see DESIGN.md. Say "switch theme to <name>" to change.` Only ask the user if the curl fails or the project intent is genuinely ambiguous (e.g. name is literally `boilerplate` or `my-app`).

Also set `NEXT_PUBLIC_PRODUCT_NAME` in `.env.local` to a reasonable display name inferred from the project name (Title Case) — this shows in email subjects and headers.

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

### 3a. Set Convex deployment env vars

Generate a random shared secret for webhook → Convex mutations and set it in both `.env.local` and the Convex deployment:

```bash
# Generate a 32-byte hex secret
CONVEX_WEBHOOK_SECRET=$(openssl rand -hex 32)

# Write to .env.local (append if missing)
grep -q '^CONVEX_WEBHOOK_SECRET=' .env.local \
  && sed -i '' "s|^CONVEX_WEBHOOK_SECRET=.*|CONVEX_WEBHOOK_SECRET=$CONVEX_WEBHOOK_SECRET|" .env.local \
  || echo "CONVEX_WEBHOOK_SECRET=$CONVEX_WEBHOOK_SECRET" >> .env.local

# Push to Convex deployment
npx convex env set CONVEX_WEBHOOK_SECRET "$CONVEX_WEBHOOK_SECRET"
```

Later, after the user completes step **A** (Clerk) and has their JWT issuer domain, set that in Convex too:

```bash
# Issuer URL looks like https://<your-subdomain>.clerk.accounts.dev
# Find it in the Clerk dashboard → JWT Templates → convex → "Issuer" field
npx convex env set CLERK_JWT_ISSUER_DOMAIN <issuer-url>
```

Without `CLERK_JWT_ISSUER_DOMAIN` set in Convex, `ctx.auth.getUserIdentity()` silently returns `null` — authenticated queries/mutations will think every caller is anonymous.

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

If the Trigger.dev MCP is connected, use it to create the project and retrieve the API key directly. Install the MCP once with:

```bash
npx trigger.dev@latest install-mcp --client claude-code
```

If the MCP is not connected, run the CLI init which will prompt to create or select a project and write `TRIGGER_PROJECT_ID` into `trigger.config.ts`:

```bash
npx trigger.dev@latest init
```

If the user skips this step (e.g. not using background jobs yet), remove `@trigger.dev/sdk`, `trigger.config.ts`, and the `trigger/` directory later.

---

## Manual checklist — DO THESE AFTER the automated steps

Print this checklist verbatim to the user. Every step must be specific enough that someone who has never opened these dashboards can follow it exactly. Do NOT say "grab your API key" — tell them where to click.

### A. Clerk — Publishable Key, Secret Key, Webhook, JWT Template for Convex (Clerk MCP–driven)

If the Clerk MCP is connected, do everything via the MCP. No dashboard clicks.

1. **Create the application** via the Clerk MCP. Name it after the project. Enable **Email** + **Google** sign-in methods.
2. **Read the publishable + secret keys** from the MCP and write them into `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_`)
3. **Create the Convex JWT template** via the MCP. Template name must be exactly `convex` (not `Convex`, not anything else — `convex/auth.config.ts` looks for that exact name). Read the issuer URL from the MCP response and run:
   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN <issuer-url>
   ```
   Without `CLERK_JWT_ISSUER_DOMAIN` set in Convex, `ctx.auth.getUserIdentity()` silently returns `null`.
4. **Create the webhook endpoint** via the MCP:
   - URL: `https://<your-vercel-domain>/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Read the signing secret from the MCP response → `.env.local` as `CLERK_WEBHOOK_SECRET`.

**Fallback if Clerk MCP is not connected:**

1. https://dashboard.clerk.com → **Create application** → enable Email + Google.
2. **API Keys** in sidebar → copy **Publishable key** (`pk_test_…`) and **Secret key** (`sk_test_…`) into `.env.local`.
3. **JWT Templates** → **New template** → **Convex** preset → name must be `convex` → **Apply changes** → copy **Issuer** URL → run `npx convex env set CLERK_JWT_ISSUER_DOMAIN <issuer-url>`.
4. **Webhooks** → **Add Endpoint** → URL `https://<your-domain>/api/webhooks/clerk` → check `user.created`, `user.updated`, `user.deleted` → **Create** → copy **Signing Secret** (`whsec_…`) into `.env.local` as `CLERK_WEBHOOK_SECRET`.

### B. Stripe — Publishable Key, Secret Key, Products, Webhook (mostly CLI-driven)

Install the Stripe CLI once: `brew install stripe/stripe-cli/stripe` (macOS) or see [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli).

**B1. Authenticate (one browser click):**

```bash
stripe login
```

This opens a browser — click **Allow access**. The CLI now acts against your Stripe account.

**B2. Grab API keys (the only dashboard step left):**

1. Go to https://dashboard.stripe.com/test/apikeys — **Test mode** must be on.
2. Copy the **Publishable key** (`pk_test_…`) → `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Click **Reveal test key** next to the **Secret key**. Copy (`sk_test_…`) → `.env.local` as `STRIPE_SECRET_KEY`.

There's no API for fetching the secret key — this is the one dashboard step Stripe doesn't allow to be scripted.

**B3. Create products, prices, and webhook via CLI:**

```bash
# Pro plan — $20/month, lookup_key=pro
PRO_PRODUCT=$(stripe products create --name="Pro" --format=json | jq -r '.id')
stripe prices create \
  --product="$PRO_PRODUCT" \
  --unit-amount=2000 \
  --currency=usd \
  -d "recurring[interval]=month" \
  --lookup-key=pro

# Studio plan — $50/month, lookup_key=studio
STUDIO_PRODUCT=$(stripe products create --name="Studio" --format=json | jq -r '.id')
stripe prices create \
  --product="$STUDIO_PRODUCT" \
  --unit-amount=5000 \
  --currency=usd \
  -d "recurring[interval]=month" \
  --lookup-key=studio

# Production webhook — replace <your-domain> with your Vercel URL
WEBHOOK_SECRET=$(stripe webhook_endpoints create \
  --url="https://<your-domain>/api/stripe/webhook" \
  --enabled-events=checkout.session.completed \
  --enabled-events=customer.subscription.updated \
  --enabled-events=customer.subscription.deleted \
  --format=json | jq -r '.secret')
echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET"
```

Paste the printed `STRIPE_WEBHOOK_SECRET` into `.env.local`.

> **Lookup key discipline:** `pro` and `studio` map to `useUser()` booleans `isPro` / `isStudio`. If you change these, update `hooks/use-user.ts` in the same commit — mismatches cause silent billing bugs.

**B4. Local dev webhook forwarding (keep running in a terminal):**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The command prints a different `whsec_…` for local — use that in `.env.local` during dev, and swap in the production `whsec_…` when deploying.

### C. Resend — API Key + Verified Domain (Resend MCP–driven)

If the Resend MCP is connected, do everything through it. No CLI install, no dashboard.

1. **Create a project-scoped API key** via the Resend MCP. Name it after the project. Write the returned key (`re_…`) into `.env.local` as `RESEND_API_KEY`.
2. **Create the domain** via the Resend MCP. Use the user's chosen domain (e.g. `yourdomain.com`), region `us-east-1`. Capture the returned DNS records (MX, SPF/TXT, DKIM/TXT) — you'll need them in step 3.
3. **Write the DNS records:**
   - **If the Cloudflare MCP is connected** — for each record returned in step 2, call Cloudflare MCP to create it. Disable the orange-cloud proxy on every record (Resend records must be DNS-only). MX gets priority + target as printed; TXT records get the exact `name` and `content` as printed.
   - **If Cloudflare MCP is NOT connected** — print the records to the user with click-by-click fallback instructions (Cloudflare dashboard → DNS → Records → Add for each; or Vercel DNS; or registrar's DNS panel).
4. **Verify the domain** via the Resend MCP. Verification can take up to 10 minutes for DNS propagation — retry the verify call until it returns success.

**Fallback if Resend MCP is not connected — CLI-driven:**

Install the Resend CLI: `npm i -g resend-cli` (or `npx resend-cli@latest`).

1. **Bootstrap API key (one-time, dashboard):** https://resend.com/api-keys → **Create API Key** → name it `cli` → **Full access** → copy (`re_…`).
2. Save to shell profile so every project picks it up:
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export RESEND_API_KEY="<the key you just copied>"
   ```
   Reload: `source ~/.zshrc`. Also write the same value to the project's `.env.local`.
3. Create the domain:
   ```bash
   DOMAIN="yourdomain.com"
   resend domains create --name "$DOMAIN" --region us-east-1
   ```
4. Add the printed DNS records via Cloudflare MCP if available, otherwise dashboard at your DNS provider.
5. Verify:
   ```bash
   DOMAIN_ID=$(resend domains list --format json | jq -r ".data[] | select(.name == \"$DOMAIN\") | .id")
   resend domains verify "$DOMAIN_ID"
   ```

**C5. Update sender email:**

```bash
sed -i '' "s|^FROM_EMAIL=.*|FROM_EMAIL=noreply@$DOMAIN|" .env.local
```

### D. Upstash Redis — REST URL, REST Token (API-driven if you have a management key)

**D1. Get a management API key (one-time, reused across all your projects):**

1. Go to https://console.upstash.com/account/api
2. Click **Create API Key**. Name it `cli`. Copy it.
3. Save it to your shell profile so it's available for every project:
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export UPSTASH_EMAIL="you@example.com"
   export UPSTASH_API_KEY="<the key you just copied>"
   ```
   Reload: `source ~/.zshrc`.

**D2. Create the Redis database via API:**

```bash
PROJECT_NAME=$(node -p "require('./package.json').name")
RESPONSE=$(curl -s -u "$UPSTASH_EMAIL:$UPSTASH_API_KEY" \
  -X POST "https://api.upstash.com/v2/redis/database" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$PROJECT_NAME\",\"region\":\"us-east-1\",\"tls\":true}")

REST_URL=$(echo "$RESPONSE" | jq -r '.rest_endpoint')
REST_TOKEN=$(echo "$RESPONSE" | jq -r '.rest_token')

# Write to .env.local
sed -i '' "s|^UPSTASH_REDIS_REST_URL=.*|UPSTASH_REDIS_REST_URL=https://$REST_URL|" .env.local
sed -i '' "s|^UPSTASH_REDIS_REST_TOKEN=.*|UPSTASH_REDIS_REST_TOKEN=$REST_TOKEN|" .env.local
```

**Fallback if you don't want a management key:** create the database manually at https://console.upstash.com → **Create Database** → Redis → copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the **REST API** section into `.env.local`.

### E. PostHog — Project API Key (API-driven if you have a personal key)

**E1. Get a personal API key (one-time, reused across all your projects):**

1. Go to https://us.posthog.com/settings/user-api-keys
2. Click **Create personal API key**. Scope: **Project:Create** + **Project:Read**. Copy it.
3. Save to your shell profile:
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export POSTHOG_PERSONAL_API_KEY="<the key you just copied>"
   ```
   Reload: `source ~/.zshrc`.

**E2. Create the project via API:**

```bash
PROJECT_NAME=$(node -p "require('./package.json').name")
RESPONSE=$(curl -s -X POST "https://us.posthog.com/api/projects/" \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$PROJECT_NAME\"}")

POSTHOG_KEY=$(echo "$RESPONSE" | jq -r '.api_token')

sed -i '' "s|^NEXT_PUBLIC_POSTHOG_KEY=.*|NEXT_PUBLIC_POSTHOG_KEY=$POSTHOG_KEY|" .env.local
```

`NEXT_PUBLIC_POSTHOG_HOST` stays as `https://us.i.posthog.com` unless you're on EU cloud.

**Fallback:** https://us.posthog.com → project selector → **New project** → **Project settings** → **Project API keys** → copy into `.env.local`.

> PostHog only initializes in production builds (see `components/providers.tsx`). You won't see events during `npm run dev`.

### F. Trigger.dev (skip if you didn't run step 7)

If the Trigger.dev MCP is connected, it can retrieve the API key automatically — no dashboard visit needed.

If the MCP is not connected:
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
