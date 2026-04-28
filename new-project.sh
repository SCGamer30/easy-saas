#!/bin/bash

# Usage: ./new-project.sh <project-name>
# Example: ./new-project.sh my-saas-app

set -e

if [ -z "$1" ]; then
  echo "Usage: ./new-project.sh <project-name>"
  exit 1
fi

# Preflight: ensure required CLIs are installed before we do anything destructive.
missing=()
for bin in gh vercel npx; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    missing+=("$bin")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "Missing required CLIs: ${missing[*]}"
  echo ""
  echo "Install with:"
  for bin in "${missing[@]}"; do
    case "$bin" in
      gh)     echo "  gh      → brew install gh           (https://cli.github.com)" ;;
      vercel) echo "  vercel  → npm i -g vercel           (https://vercel.com/docs/cli)" ;;
      npx)    echo "  npx     → install Node.js           (https://nodejs.org)" ;;
    esac
  done
  exit 1
fi

PROJECT_NAME="$1"
GITHUB_USER=$(gh api user --jq .login 2>/dev/null)
if [ -z "$GITHUB_USER" ]; then
  echo "Could not detect GitHub user. Run: gh auth login"
  exit 1
fi
PROJECTS_DIR="$HOME/Documents/GitHub"
TARGET_DIR="$PROJECTS_DIR/$PROJECT_NAME"

# Clone Easy SaaS boilerplate into new folder
echo "Cloning Easy SaaS into $TARGET_DIR..."
git clone "https://github.com/SCGamer30/easy-saas.git" "$TARGET_DIR"
cd "$TARGET_DIR"

# Remove boilerplate remote
git remote remove origin

# Update package.json name
sed -i '' "s/\"name\": \"easy-saas\"/\"name\": \"$PROJECT_NAME\"/" package.json
sed -i '' "s/\"name\": \"boilerplate\"/\"name\": \"$PROJECT_NAME\"/" package.json

# Update AGENTS.md and CLAUDE.md titles (kept as real duplicate files — see CI guard)
sed -i '' "s/# Project Context for AI Agents/# $PROJECT_NAME — Project Context for AI Agents/" AGENTS.md
cp AGENTS.md CLAUDE.md

# Copy env example
cp .env.example .env.local

# Install dependencies
echo "Installing dependencies..."
npm install

# Install Claude Code skills for the stack
echo "Installing agent skills..."
npx skills add https://github.com/vercel-labs/skills --skill find-skills  # skill discovery — lets the agent search for more skills on its own

# Core framework
npx skillsadd vercel-labs/next-skills      # Next.js 15 best practices + caching
npx skillsadd vercel-labs/agent-skills     # React 19, RSC composition, Vercel deploy
npx skillsadd shadcn/ui                    # shadcn component patterns
npx skillsadd wshobson/agents              # TypeScript advanced types + Node.js patterns
npx skillsadd pproenca/dot-skills          # Zod, React Hook Form, Framer Motion best practices

# Auth
npx skillsadd clerk/skills                 # Clerk Next.js patterns, webhooks, React patterns

# Database
npx skillsadd get-convex/agent-skills      # Convex queries, auth, schema patterns

# Email
npx skillsadd resend/resend-skills         # Resend API + CLI
npx skillsadd resend/react-email           # React Email component patterns
npx skillsadd resend/email-best-practices  # Email deliverability + best practices

# Rate limiting + background jobs
npx skillsadd upstash/skills               # Upstash Redis
npx skillsadd upstash/ratelimit-js         # Upstash rate limiting (matches lib/ratelimit.ts)
npx skillsadd triggerdotdev/skills         # Trigger.dev tasks, config, agents, realtime

# Analytics + observability
npx skillsadd posthog/posthog-for-claude   # PostHog instrumentation (built for Claude)
npx skills add https://github.com/posthog/skills --skill integration-nextjs-app-router  # PostHog + Next.js App Router
npx skills add https://github.com/posthog/skills --skill feature-flags-nextjs           # Feature flags for Next.js
npx skills add https://github.com/posthog/skills --skill error-tracking-nextjs          # Error tracking for Next.js
npx skillsadd sentry/dev                   # Sentry CLI workflows

# Animation + WebGL (all in the stack)
npx skillsadd greensock/gsap-skills        # GSAP + ScrollTrigger patterns
npx skillsadd cloudai-x/threejs-skills     # Three.js fundamentals, shaders, animation, lighting
npx skillsadd patricio0312rev/skills       # Framer Motion animator

# Payments
npx skillsadd stripe/ai                    # Official Stripe AI skills — best practices + upgrade guides

# Testing
npx skillsadd currents-dev/playwright-best-practices-skill  # Playwright testing
npx skillsadd anthropics/skills                             # Web app testing patterns (57K installs)

# Web quality, performance, accessibility
npx skillsadd addyosmani/web-quality-skills  # Core Web Vitals, accessibility, SEO, performance — Addy Osmani

# Design engineering + UI craft
npx skillsadd emilkowalski/skill  # Design engineering — Emil Kowalski (Sonner author)
npx skillsadd ibelick/ui-skills   # Motion performance, accessibility, metadata — ibelick

# Security
npx skillsadd getsentry/skills  # Security review patterns (OWASP, input validation, secrets)

# Create GitHub repo and push
echo "Creating GitHub repo..."
gh repo create "$GITHUB_USER/$PROJECT_NAME" --private --source=. --remote=origin --push

echo ""
echo "============================================================"
echo "  Project ready at $TARGET_DIR"
echo "============================================================"
echo ""
echo "Next step:"
echo "  1. cd $TARGET_DIR"
echo "  2. Open Claude Code and run:  /setup"
echo ""
echo "Claude Code will handle Convex, Vercel, Sentry, Cloudflare,"
echo "and walk you through the remaining manual dashboard steps."
