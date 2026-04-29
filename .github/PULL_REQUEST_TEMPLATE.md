## Summary

<!-- What does this PR do? 1-3 sentences. -->

## Changes

<!-- Bullet list of what changed and why. -->

## Checklist

- [ ] `AGENTS.md` edited → `cp AGENTS.md CLAUDE.md` run before committing
- [ ] No secrets committed (`.env.local`, API keys, `sk_*`, `re_*`, `whsec_*`)
- [ ] New API routes validate input with Zod and call `checkRateLimit`
- [ ] New client components have `'use client'` and a loading skeleton
- [ ] New env vars added to both `.env.example` and `lib/env.ts`
- [ ] UI changes verified in both light and dark mode
- [ ] `npm run lint` and `npx tsc --noEmit` pass locally
- [ ] Tests added or updated if behaviour changed

## Screenshots / recordings

<!-- For UI changes, paste before/after screenshots or a screen recording. -->
