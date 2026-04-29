---
name: add-newsletter
description: Wire beehiiv newsletter signups into an existing project — API route, signup component, and env vars. Run when you're ready to add a newsletter to a project scaffolded without one.
---

# /add-newsletter

Provision beehiiv newsletter signup on an existing project. The boilerplate ships without this by default because not every SaaS needs a newsletter. This command adds a rate-limited API route and a reusable `<NewsletterSignup />` component.

## Preflight

Check that:

1. The project is from this boilerplate (`lib/ratelimit.ts` and `lib/env.ts` exist).
2. `BEEHIIV_API_KEY` is not already set in `.env.local`. If it is, ask whether to re-provision or abort.

## 1. Get beehiiv credentials

### MCP path (preferred — try this first)

Check if the beehiiv MCP is connected. If it is, use it directly:

1. Call the beehiiv MCP's **authenticate** tool — it will open the OAuth flow in the browser. The user authorizes once and the MCP holds the token.
2. Call **list publications** to find the publication ID (`pub_...`).
3. Call **create API key** (or list existing keys) to get a `bk-...` key scoped to this project.
4. Write both to `.env.local` automatically — no manual copy-paste needed.

If the MCP call returns an auth error or the beehiiv MCP is not listed, fall back to the manual steps below.

### Manual path (fallback)

Walk the user through this exactly:

1. Open https://app.beehiiv.com — sign in or create an account.
2. Go to **Settings → Integrations → API**.
3. Click **Generate new API Key**. Name it after the project.
4. Copy the API key (`bk-...` prefix).
5. Go to **Settings → Publication** (or the publication homepage).
6. Copy the **Publication ID** — it looks like `pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

Add both to `.env.local`:

```
BEEHIIV_API_KEY=bk-...
BEEHIIV_PUBLICATION_ID=pub_...
```

## 2. Add env vars to lib/env.ts

Open `lib/env.ts` and add inside `serverSchema`:

```ts
BEEHIIV_API_KEY: z.string().startsWith('bk-').optional(),
BEEHIIV_PUBLICATION_ID: z.string().startsWith('pub_').optional(),
```

Add to `.env.example`:

```
# beehiiv newsletter (opt-in via /add-newsletter)
BEEHIIV_API_KEY=bk-...
BEEHIIV_PUBLICATION_ID=pub_...
```

## 3. Push env vars to Vercel

```bash
vercel env add BEEHIIV_API_KEY production
vercel env add BEEHIIV_PUBLICATION_ID production
```

## 4. Create the newsletter helper

Create `lib/beehiiv.ts`:

```ts
export class BeehiivNotConfiguredError extends Error {
  constructor() {
    super(
      'beehiiv is not configured. Set BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in .env.local — run /add-newsletter in Claude Code.',
    )
    this.name = 'BeehiivNotConfiguredError'
  }
}

export function isBeehiivConfigured(): boolean {
  return Boolean(process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID)
}

export async function subscribeToNewsletter({
  email,
  referringSite,
  utmSource,
  utmMedium,
  utmCampaign,
  customFields,
}: {
  email: string
  referringSite?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  customFields?: Array<{ name: string; value: string }>
}): Promise<{ id: string; status: string }> {
  if (!isBeehiivConfigured()) throw new BeehiivNotConfiguredError()

  const publicationId = process.env.BEEHIIV_PUBLICATION_ID!
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        referring_site: referringSite,
        custom_fields: customFields,
      }),
    },
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`beehiiv API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  return { id: data.data.id, status: data.data.status }
}
```

## 5. Create the API route

Create `app/api/newsletter/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { subscribeToNewsletter, isBeehiivConfigured } from '@/lib/beehiiv'
import { checkRateLimit } from '@/lib/ratelimit'

const schema = z.object({
  email: z.string().email(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
})

export async function POST(req: Request) {
  if (!isBeehiivConfigured()) {
    return NextResponse.json(
      { error: 'Newsletter is not enabled. Run /add-newsletter in Claude Code.' },
      { status: 503 },
    )
  }

  // Rate-limit by IP (public endpoint, no auth required)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous'

  const { success, reset } = await checkRateLimit('email', ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.max(0, Math.ceil((reset - Date.now()) / 1000))) },
      },
    )
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const result = await subscribeToNewsletter({
      email: parsed.data.email,
      utmSource: parsed.data.utmSource,
      utmMedium: parsed.data.utmMedium,
      utmCampaign: parsed.data.utmCampaign,
      referringSite: req.headers.get('origin') ?? undefined,
    })
    return NextResponse.json({ ok: true, status: result.status })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
```

Add `/api/newsletter` to the public routes in `middleware.ts` (newsletter signups don't require auth):

```ts
'/api/newsletter',
```

## 6. Create the NewsletterSignup component

Create `components/newsletter-signup.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowRight, CircleNotch } from '@phosphor-icons/react'

const emailSchema = z.string().email()

interface NewsletterSignupProps {
  /** Shown above the input. Default: 'Stay in the loop' */
  heading?: string
  /** Shown below the heading. Default: 'Get updates when we ship.' */
  subheading?: string
  /** Button label. Default: 'Subscribe' */
  cta?: string
  /** UTM params for tracking which placement drove the signup */
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  className?: string
}

export function NewsletterSignup({
  heading = 'Stay in the loop',
  subheading = 'Get updates when we ship.',
  cta = 'Subscribe',
  utmSource,
  utmMedium,
  utmCampaign,
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const result = emailSchema.safeParse(email)
    if (!result.success) {
      toast.error('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, utmSource, utmMedium, utmCampaign }),
      })
      if (!res.ok) throw new Error('Failed to subscribe')
      setDone(true)
      toast.success("You're on the list!")
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      {heading && (
        <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {heading}
        </p>
      )}
      {subheading && (
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {subheading}
        </p>
      )}

      {done ? (
        <p className="mt-4 text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
          You're subscribed.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="min-w-0 flex-1 rounded-xl border bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)]"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {loading ? (
              <CircleNotch size={14} className="animate-spin" />
            ) : (
              <ArrowRight size={14} weight="bold" />
            )}
            {cta}
          </button>
        </form>
      )}
    </div>
  )
}
```

## 7. Use the component

Drop it anywhere — landing page, footer, dashboard sidebar:

```tsx
import { NewsletterSignup } from '@/components/newsletter-signup'

// On the landing page
<NewsletterSignup
  heading="Stay in the loop"
  subheading="Product updates, no spam."
  utmSource="landing"
  utmMedium="organic"
  utmCampaign="homepage"
/>

// Minimal — just the form, no heading
<NewsletterSignup heading="" subheading="" cta="Get updates" />
```

## 8. Verify

Test locally with a real email:

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com"}'
# → { "ok": true, "status": "validating" }
```

Check the subscriber appears in your beehiiv dashboard under **Audience → Subscribers**.

## Done

Tell the user newsletter signups are now live:

- `POST /api/newsletter` — public, rate-limited, beehiiv-backed
- `<NewsletterSignup />` — drop anywhere, supports UTM tracking
- beehiiv sends the welcome email automatically (`send_welcome_email: true`)
- Existing subscribers are not re-subscribed (`reactivate_existing: false`) — no duplicates
- To send a welcome email from Resend instead: set `send_welcome_email: false` and call `sendWelcomeEmail()` from `lib/resend.ts` after the subscription call
