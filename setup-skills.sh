#!/usr/bin/env bash

# Installs the agent skills used by this starter.
# Safe to rerun. By default this installs the full stack used by new-project.sh.

set -u

MODE="full"
FAILED=()

usage() {
  cat <<'EOF'
Usage: ./setup-skills.sh [--full|--core|--list]

Options:
  --full   Install every recommended skill (default).
  --core   Install only discovery, Next.js, React, shadcn, TypeScript, and Zod/form skills.
  --list   Print the install plan without running network commands.
EOF
}

log() {
  printf '%s\n' "==> $*"
}

warn() {
  printf '%s\n' "Warning: $*" >&2
}

install_skill() {
  local label="$1"
  shift

  log "$label"
  if [ "$MODE" = "list" ]; then
    printf '    npx skills add %s\n' "$*"
    return 0
  fi

  if ! npx skills add "$@"; then
    FAILED+=("$label")
    warn "$label failed"
  fi
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --full)
      MODE="full"
      ;;
    --core)
      MODE="core"
      ;;
    --list)
      MODE="list"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf '%s\n' "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

if [ "$MODE" != "list" ] && ! command -v npx >/dev/null 2>&1; then
  printf '%s\n' "Error: npx is required to install skills." >&2
  exit 1
fi

log "Installing $MODE agent skill set"

install_skill "Skill discovery" "https://github.com/vercel-labs/skills" "--skill" "find-skills"
install_skill "Next.js skills" "vercel-labs/next-skills"
install_skill "Vercel/React agent skills" "vercel-labs/agent-skills"
install_skill "shadcn/ui patterns" "shadcn/ui"
install_skill "TypeScript and Node patterns" "wshobson/agents"
install_skill "Zod, React Hook Form, and Framer Motion" "pproenca/dot-skills"

if [ "$MODE" = "full" ] || [ "$MODE" = "list" ]; then
  install_skill "Clerk auth" "clerk/skills"
  install_skill "Convex database" "get-convex/agent-skills"
  install_skill "Resend API" "resend/resend-skills"
  install_skill "React Email" "resend/react-email"
  install_skill "Email best practices" "resend/email-best-practices"
  install_skill "Upstash" "upstash/skills"
  install_skill "Upstash rate limiting" "upstash/ratelimit-js"
  install_skill "Trigger.dev" "triggerdotdev/skills"
  install_skill "PostHog for Claude" "posthog/posthog-for-claude"
  install_skill "PostHog Next.js App Router" "https://github.com/posthog/skills" "--skill" "integration-nextjs-app-router"
  install_skill "PostHog feature flags" "https://github.com/posthog/skills" "--skill" "feature-flags-nextjs"
  install_skill "PostHog error tracking" "https://github.com/posthog/skills" "--skill" "error-tracking-nextjs"
  install_skill "Sentry" "sentry/dev"
  install_skill "GSAP" "greensock/gsap-skills"
  install_skill "Three.js" "cloudai-x/threejs-skills"
  install_skill "Framer Motion animation" "patricio0312rev/skills"
  install_skill "Stripe" "stripe/ai"
  install_skill "Playwright best practices" "currents-dev/playwright-best-practices-skill"
  install_skill "Web app testing patterns" "anthropics/skills"
  install_skill "Web quality and performance" "addyosmani/web-quality-skills"
  install_skill "Design engineering" "emilkowalski/skill"
  install_skill "UI craft" "ibelick/ui-skills"
  install_skill "Security review" "getsentry/skills"

  log "Installing ui-ux-pro-max"
  if [ "$MODE" = "list" ]; then
    printf '    npm install -g uipro-cli\n'
    printf '    uipro init --ai all --yes\n'
  else
    if ! command -v uipro >/dev/null 2>&1; then
      npm install -g uipro-cli || FAILED+=("ui-ux-pro-max CLI")
    fi
    if command -v uipro >/dev/null 2>&1; then
      uipro init --ai all --yes || uipro init --ai all --non-interactive || FAILED+=("ui-ux-pro-max init")
    fi
  fi

  log "Installing 21st.dev Magic MCP"
  if [ "$MODE" = "list" ]; then
    printf '    npx -y @21st-dev/cli@latest install claude\n'
  elif ! npx -y @21st-dev/cli@latest install claude; then
    FAILED+=("21st.dev Magic MCP")
    warn "21st.dev Magic MCP failed. Visit https://21st.dev/magic-mcp for manual setup if needed."
  fi
fi

if [ "${#FAILED[@]}" -gt 0 ]; then
  printf '\n%s\n' "The following installs failed:"
  printf '  - %s\n' "${FAILED[@]}"
  exit 1
fi

log "Skill install complete"
