---
name: add-ai
description: Wire AI features into an existing project — Vercel AI SDK + OpenRouter for unified access to Claude, GPT, Gemini, Llama, etc. Run when you're ready to add chat, generation, or agent features. AI is opt-in (same model as Stripe) — not in the default boilerplate.
---

# /add-ai

Provision AI features on an existing project. The boilerplate ships *without* AI dependencies because most projects don't need them on day one — when they do, run this command to install Vercel AI SDK + OpenRouter and create a typed helper.

## Why OpenRouter (and not direct provider SDKs)

OpenRouter is a unified API that fronts every major model — Claude (Anthropic), GPT (OpenAI), Gemini (Google), Llama (Meta), DeepSeek, Mistral, and others — behind one API key, one billing account, and the OpenAI-compatible chat completions format. The Vercel AI SDK has a first-class OpenRouter provider (`@openrouter/ai-sdk-provider`).

**Tradeoffs:**
- ✅ One key, one bill, swap models with a string change
- ✅ Cheaper models for cheap tasks, premium models when needed
- ✅ Failover: if one provider is down, fall back to another
- ❌ Adds ~5–10% margin vs going direct to provider
- ❌ One more vendor in the trust chain

If you specifically want direct Anthropic/OpenAI/Gemini, swap the provider in `lib/ai.ts` after install — the AI SDK's interface is the same.

## 1. Install dependencies

```bash
npm install ai @openrouter/ai-sdk-provider zod
```

(`zod` is already installed in this boilerplate. The above is idempotent — npm will skip already-installed packages.)

## 2. Get an OpenRouter API key

1. Go to https://openrouter.ai/keys
2. Click **Create Key**. Name it after the project. Set a credit limit if you want (recommended: $5–10 to start).
3. Copy the key (`sk-or-v1-...`).
4. Add to `.env.local`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-xxx
   ```
5. Push to Vercel:
   ```bash
   vercel env add OPENROUTER_API_KEY production
   ```

## 3. Create the AI helper

Create `lib/ai.ts`:

```ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export class AINotConfiguredError extends Error {
  constructor() {
    super(
      'AI is not configured. Set OPENROUTER_API_KEY in .env.local — run /add-ai or grab a key from https://openrouter.ai/keys.',
    )
    this.name = 'AINotConfiguredError'
  }
}

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY)
}

let _openrouter: ReturnType<typeof createOpenRouter> | null = null

export function getOpenRouter() {
  if (_openrouter) return _openrouter
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new AINotConfiguredError()
  _openrouter = createOpenRouter({ apiKey: key })
  return _openrouter
}

// Default model — swap freely. OpenRouter's model strings are
// `<provider>/<model>` — see https://openrouter.ai/models
export const defaultModel = () => getOpenRouter()('anthropic/claude-3.5-sonnet')

// Cheaper option for low-stakes tasks (classification, summarization)
export const cheapModel = () => getOpenRouter()('anthropic/claude-3.5-haiku')
```

## 4. Create a streaming chat route (optional starter)

Create `app/api/ai/chat/route.ts`:

```ts
import { auth } from '@clerk/nextjs/server'
import { streamText, convertToCoreMessages } from 'ai'
import { defaultModel, isAIConfigured } from '@/lib/ai'
import { checkRateLimit } from '@/lib/ratelimit'

export const maxDuration = 60

export async function POST(req: Request) {
  if (!isAIConfigured()) {
    return Response.json(
      { error: 'AI is not enabled in this project. Run /add-ai in Claude Code.' },
      { status: 503 },
    )
  }

  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = await checkRateLimit('ai', userId)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const { messages } = await req.json()

  const result = streamText({
    model: defaultModel(),
    messages: convertToCoreMessages(messages),
  })

  return result.toDataStreamResponse()
}
```

This route is auth-gated (Clerk), rate-limited (10/10s via the existing `aiRatelimit`), and degrades gracefully if `OPENROUTER_API_KEY` is missing.

## 5. Update the env validation

Add to `lib/env.ts`'s `serverSchema`:

```ts
OPENROUTER_API_KEY: z.string().optional(),
```

And to `.env.example`:

```
# AI (opt-in via /add-ai)
OPENROUTER_API_KEY=
```

## 6. Update CLAUDE.md / AGENTS.md

Append a row to the Stack section so future agents know AI is wired:

```markdown
- **AI:** `lib/ai.ts` — Vercel AI SDK + OpenRouter (unified Claude/GPT/Gemini/etc). `isAIConfigured()` is the source of truth. Default model: Claude 3.5 Sonnet. Streaming chat route at `/api/ai/chat`. Always rate-limit AI routes via `checkRateLimit('ai', userId)`.
```

## 7. Verify

Quick smoke test from the project root:

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: $(your-clerk-session-cookie)" \
  -d '{"messages":[{"role":"user","content":"Say hi"}]}'
```

If you get a streaming response, AI is wired. If you get 503, env var isn't loaded — restart `npm run dev`.

## Done

Tell the user:

- AI is now enabled. Default model is Claude 3.5 Sonnet via OpenRouter.
- Switch models by editing `lib/ai.ts` or passing a different model to `streamText()` per route.
- Costs accrue per token — set a credit limit at https://openrouter.ai/keys if you're worried about runaway usage.
- The `aiRatelimit` (10 requests / 10s) automatically applies to any route that calls `checkRateLimit('ai', userId)`.
