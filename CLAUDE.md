# Boilerplate — Claude Context

## Stack
- **Framework:** Next.js 15 (App Router, React 19, TypeScript strict)
- **Auth:** Clerk (`@clerk/nextjs` v6) — middleware at `middleware.ts`, sign-in/up at `/sign-in` and `/sign-up`
- **Database:** Convex — schema at `convex/schema.ts`, functions at `convex/*.ts`
- **Email:** Resend — helper at `lib/resend.ts`
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) — NO `tailwind.config.ts`, config lives in `app/globals.css`
- **UI Components:** shadcn/ui (add via `npx shadcn@latest add <component>`)
- **Icons:** `@phosphor-icons/react` exclusively — no lucide, no heroicons
- **Motion:** `framer-motion` — use `useMotionValue`/`useTransform` for continuous animations, never `useState`
- **Utilities:** `cn()` from `lib/utils.ts` for class merging

## Theme
- CSS custom properties defined in `app/globals.css` under `@theme`
- Supports light + dark mode via `prefers-color-scheme` and `[data-theme]` attribute
- Accent color: Emerald (`--color-accent`). Do NOT use purple/blue gradients.
- Font: Geist / Satoshi (sans), Geist Mono / JetBrains Mono (mono). Inter is banned.

## Path Aliases
- `@/*` maps to repo root — use `@/components`, `@/lib`, `@/convex`, etc.

## Architecture Rules
- Default to **Server Components**. Only add `'use client'` when needed (interactivity, hooks, motion).
- Wrap all providers in `components/providers.tsx` (already done: Clerk + Convex).
- Isolate heavy animations in their own leaf Client Components — never co-locate with data fetching.
- Use `min-h-[100dvh]` for full-height sections. Never `h-screen`.
- Use CSS Grid over flex math for layouts.

## Convex
- Run `npx convex dev` alongside `npm run dev` during development.
- `convex/_generated/` is gitignored — it's auto-generated.
- Users table syncs with Clerk via `convex/users.ts` — call `upsertUser` on sign-in.
- To add a new table: update `convex/schema.ts`, add query/mutation files.

## Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — from Clerk dashboard
- `NEXT_PUBLIC_CONVEX_URL` — from `npx convex dev` output
- `RESEND_API_KEY` — from Resend dashboard
- Update `FROM_EMAIL` in `lib/resend.ts` to your verified domain

## Design Principles (from `/design-taste-frontend`)
- DESIGN_VARIANCE: 8 — asymmetric layouts, masonry, fractional grids
- MOTION_INTENSITY: 6 — fluid CSS transitions + Framer Motion spring physics
- VISUAL_DENSITY: 4 — daily app spacing, not cockpit, not gallery
- No emoji, no Inter, no centered heroes, no 3-equal-card rows, no purple glows
- Use `@phosphor-icons/react` for all icons
- Invoke `/design-taste-frontend` for full design rules

## Adding shadcn Components
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
```
Always customize shadcn defaults to match the project palette — never use out-of-the-box styling.

## Scripts
```bash
npm run dev          # Next.js dev server
npm run convex:dev   # Convex dev (run in parallel with above)
npm run build        # Production build
npm run format       # Prettier
npm run lint         # ESLint
```
