# Contributing

## Setup

```bash
git clone https://github.com/SCGamer30/easy-saas.git
cd easy-saas
npm install
cp .env.example .env.local
# Fill in .env.local, then:
npx convex dev   # in one terminal
npm run dev      # in another
```

## Rules

**AGENTS.md = CLAUDE.md — always.** Every coding agent reads a different file. Edit `AGENTS.md`, then run `cp AGENTS.md CLAUDE.md` before committing. CI fails if they drift.

**No secrets in commits.** Never commit `.env.local` or paste real keys. If it starts with `sk_`, `re_`, `pk_`, `whsec_` — it's a secret, it stays out.

**Every new env var** goes in both `.env.example` (with a placeholder) and `lib/env.ts` (in the right schema). Skip one and CI breaks.

**Every API route needs:**

- Zod body validation (400 on failure)
- `checkRateLimit()` call
- `auth()` check if it's an authenticated route

**Commit style** — conventional commits enforced by commitlint:

```
feat: add feedback widget
fix: open redirect in billing portal
chore: bump dependencies
docs: update setup instructions
```

## Testing

```bash
npm run test          # vitest unit tests
npm run test:e2e      # playwright end-to-end
npm run lint          # eslint
npx tsc --noEmit      # type check
```

## PR checklist

See `.github/PULL_REQUEST_TEMPLATE.md` — it appears automatically when you open a PR.

## Stack

Full stack docs in `CLAUDE.md` / `AGENTS.md`. Read that before touching any code.
