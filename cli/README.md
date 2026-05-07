# easy-saas

One-command bootstrap for the [easy-saas](https://github.com/SCGamer30/easy-saas) Next.js 16 + Clerk + Convex + Stripe SaaS starter.

## Recommended flow

1. Create a fresh GitHub repo in the browser (private or public — your call).
2. Clone it locally and `cd` into it.
3. Run:

   ```bash
   npx easy-saas init
   ```

4. Open Claude Code (or Cursor → Claude Code) in the directory and run `/setup`.

That's it. The CLI fetches the boilerplate, installs dependencies, installs the agent skills (Next.js, Clerk, Convex, Stripe, PostHog, Sentry, GSAP, three.js, ui-ux-pro-max, 21st.dev Magic, etc.), builds the graphify knowledge graph, and hands you off to Claude Code's `/setup` slash command for the remaining service wiring.

## Why "init" instead of "create"

Most scaffolders (`create-next-app`, `create-vite`) take a project name and create a new directory. `easy-saas init` is the opposite — it expects you to already have an empty git repo (the one you just made on GitHub) and bootstraps the boilerplate **into that repo**. This way:

- Your project's git history starts at commit 1, not as a fork of the boilerplate.
- You don't have to `gh repo create` from the CLI or set up a remote.
- Anything that's already in the directory (your README, LICENSE, .gitignore) is preserved.

## Options

```text
npx easy-saas init [options]

  --force          Bootstrap even if the directory has unexpected files
  --no-skills      Skip the agent-skills install
  --no-install     Skip 'npm install'
  --ref <branch>   Pull from a non-default branch
```

## What gets installed

- All of [easy-saas](https://github.com/SCGamer30/easy-saas)'s files (app, components, lib, convex, emails, e2e tests, scripts, etc.)
- Production dependencies (`npm install`)
- Claude Code agent skills for the entire stack (`./setup-skills.sh --full`)
- [ui-ux-pro-max](https://github.com/zachblume/uipro) — free UI/UX intelligence for all AI assistants
- [21st.dev Magic MCP](https://21st.dev/magic-mcp) — AI-accessible curated component library
- A graphify knowledge graph at `graphify-out/` (best-effort; requires `pip3 install graphify`)

## Requirements

- Node.js 20+
- git
- npm

For full functionality after init, you'll also need:

- The GitHub CLI (`gh`) — used by `/setup` for some integrations
- Vercel CLI (`vercel`) — for environment variable management

## License

Apache-2.0 — same as the upstream boilerplate.
