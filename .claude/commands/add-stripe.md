---
name: add-stripe
description: Provision Stripe payments on an existing project — products, prices, webhook, and env vars. Run this when you're ready to add billing to a project that was scaffolded without it.
---

# /add-stripe

Use this command when the user has an existing project from this boilerplate that does NOT yet have Stripe configured, and wants to enable payments. The boilerplate ships with `STRIPE_SECRET_KEY` empty by default — `lib/stripe.ts` lazy-inits, so the rest of the app runs fine without it. This command turns it on.

## Preflight

Check that:

1. The project is from this boilerplate (`lib/stripe.ts` exists with `isStripeConfigured` export).
2. `STRIPE_SECRET_KEY` is currently empty or unset in `.env.local`. If it's already set, ask the user whether to re-provision or abort.
3. The user has a Vercel deployment URL. If not, run `vercel link` first — Stripe needs the production URL for the webhook.

## 1. Stripe authentication

If the Stripe MCP is connected, use it directly. Otherwise, install + login the Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe   # macOS, first time only
stripe login                            # opens browser, click Allow
```

## 2. Grab API keys (only dashboard step — Stripe doesn't expose keys via API)

Walk the user through this exactly:

1. Open https://dashboard.stripe.com/test/apikeys (test mode must be on).
2. Copy the **Publishable key** (`pk_test_…`) → write to `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Click **Reveal test key** next to **Secret key**. Copy (`sk_test_…`) → write to `.env.local` as `STRIPE_SECRET_KEY`.

## 3. Create products + prices via CLI (or Stripe MCP)

If the Stripe MCP is connected, prefer it. Otherwise:

```bash
PRO_PRODUCT=$(stripe products create --name="Pro" --format=json | jq -r '.id')
stripe prices create \
  --product="$PRO_PRODUCT" \
  --unit-amount=2000 \
  --currency=usd \
  -d "recurring[interval]=month" \
  --lookup-key=pro

STUDIO_PRODUCT=$(stripe products create --name="Studio" --format=json | jq -r '.id')
stripe prices create \
  --product="$STUDIO_PRODUCT" \
  --unit-amount=5000 \
  --currency=usd \
  -d "recurring[interval]=month" \
  --lookup-key=studio
```

> **Lookup key discipline:** `pro` and `studio` are wired into `useUser()` (`isPro`, `isStudio` booleans). If you change them, update `hooks/use-user.ts` in the same commit — mismatches cause silent billing bugs where paid users show as unpaid.

Set `STRIPE_ALLOWED_PLANS=pro,studio` in `.env.local`. Checkout accepts plan lookup keys from this allowlist and resolves the active Stripe price server-side; never send raw price IDs from the client.

## 4. Create the production webhook

Replace `<your-domain>` with the Vercel production URL (run `vercel ls` if unsure):

```bash
WEBHOOK_SECRET=$(stripe webhook_endpoints create \
  --url="https://<your-domain>/api/stripe/webhook" \
  --enabled-events=checkout.session.completed \
  --enabled-events=customer.subscription.updated \
  --enabled-events=customer.subscription.deleted \
  --format=json | jq -r '.secret')

# Write to .env.local
sed -i '' "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env.local || \
  echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.local
```

## 5. Push env vars to Vercel

```bash
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_ALLOWED_PLANS production
```

## 6. Local dev webhook forwarding

Tell the user to keep this running in a third terminal whenever they're working on Stripe locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The command prints a different `whsec_…` for local — they should swap that into `.env.local` during dev, then swap back to the production secret before deploying.

## 7. Verify

```bash
# Trigger a test event
stripe trigger checkout.session.completed
```

The local webhook handler should log a successful Convex mutation. If it doesn't, check that `stripe listen` is running and `STRIPE_WEBHOOK_SECRET` matches what the listen command printed.

## Done

Tell the user payments are now live:

- `useUser()` hook now exposes `isPro`, `isStudio`, `isPaid` based on Convex subscription data
- `/api/stripe/create-checkout` creates a Stripe Checkout Session
- `/api/stripe/billing-portal` opens the customer portal
- Subscription confirmed/canceled emails fire automatically via Resend on the matching webhook events
