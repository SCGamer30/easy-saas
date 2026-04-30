#!/usr/bin/env bash

# Usage: ./new-project.sh <project-name> [--local] [--github|--no-github] [--dry-run]
# Example: ./new-project.sh my-saas-app

set -euo pipefail

TEMPLATE_REPO="${TEMPLATE_REPO:-https://github.com/SCGamer30/easy-saas.git}"
PROJECTS_DIR="${PROJECTS_DIR:-$HOME/Documents/GitHub}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME=""
USE_LOCAL_TEMPLATE=0
CREATE_GITHUB=1
DRY_RUN=0

usage() {
  cat <<'EOF'
Usage: ./new-project.sh <project-name> [options]

Options:
  --local       Copy the current local template instead of cloning GitHub.
  --github     Create and push a private GitHub repo (default).
  --no-github  Skip GitHub repo creation.
  --dry-run    Print what would happen without making changes.
  -h, --help   Show this help.

Environment:
  PROJECTS_DIR    Destination parent directory. Default: ~/Documents/GitHub
  TEMPLATE_REPO   Git repo to clone. Default: https://github.com/SCGamer30/easy-saas.git
EOF
}

log() {
  printf '%s\n' "==> $*"
}

warn() {
  printf '%s\n' "Warning: $*" >&2
}

die() {
  printf '%s\n' "Error: $*" >&2
  exit 1
}

need_bin() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required CLI: $1"
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --local)
      USE_LOCAL_TEMPLATE=1
      ;;
    --github)
      CREATE_GITHUB=1
      ;;
    --no-github)
      CREATE_GITHUB=0
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      die "Unknown option: $1"
      ;;
    *)
      if [ -n "$PROJECT_NAME" ]; then
        die "Only one project name is allowed."
      fi
      PROJECT_NAME="$1"
      ;;
  esac
  shift
done

[ -n "$PROJECT_NAME" ] || {
  usage
  exit 1
}

TARGET_DIR="$PROJECTS_DIR/$PROJECT_NAME"

log "Project name: $PROJECT_NAME"
log "Target directory: $TARGET_DIR"
if [ "$USE_LOCAL_TEMPLATE" -eq 1 ]; then
  log "Template source: local checkout at $SCRIPT_DIR"
else
  log "Template source: $TEMPLATE_REPO"
fi
if [ "$CREATE_GITHUB" -eq 1 ]; then
  log "GitHub repo: create and push private repo"
else
  log "GitHub repo: skipped"
fi

if [ "$DRY_RUN" -eq 1 ]; then
  log "Dry run only. No files will be changed."
  exit 0
fi

need_bin git
need_bin node
need_bin npm
need_bin npx

if [ "$CREATE_GITHUB" -eq 1 ]; then
  need_bin gh
fi

[ ! -e "$TARGET_DIR" ] || die "$TARGET_DIR already exists."
mkdir -p "$PROJECTS_DIR"

log "Creating project at $TARGET_DIR"
if [ "$USE_LOCAL_TEMPLATE" -eq 1 ]; then
  need_bin rsync
  rsync -a \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='graphify-out' \
    --exclude='convex/_generated' \
    "$SCRIPT_DIR/" "$TARGET_DIR/"
  cd "$TARGET_DIR"
  git init
else
  git clone "$TEMPLATE_REPO" "$TARGET_DIR"
  cd "$TARGET_DIR"
  git remote remove origin 2>/dev/null || true
fi

log "Updating project metadata"
node -e "
const fs = require('fs');
const name = process.argv[1];
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = name;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
for (const file of ['AGENTS.md', 'CLAUDE.md']) {
  if (!fs.existsSync(file)) continue;
  const body = fs.readFileSync(file, 'utf8')
    .replace('# Project Context for AI Agents', '# ' + name + ' - Project Context for AI Agents');
  fs.writeFileSync(file, body);
}
" "$PROJECT_NAME"

if [ -f AGENTS.md ]; then
  cp AGENTS.md CLAUDE.md
fi

if [ -f .env.example ]; then
  log "Creating .env.local from .env.example"
  cp .env.example .env.local
else
  warn "No .env.example found; skipping .env.local creation."
fi

log "Installing agent skills"
if [ -x ./setup-skills.sh ]; then
  ./setup-skills.sh --full || warn "Some skills failed to install. You can rerun ./setup-skills.sh --full after setup."
else
  warn "setup-skills.sh is missing; skipping skill install."
fi

log "Installing dependencies"
npm install

log "Building graphify knowledge graph"
if command -v python3 >/dev/null 2>&1 && python3 -c "import graphify" 2>/dev/null; then
  python3 -m graphify . --output graphify-out/
  log "graphify-out/ created."
else
  warn "graphify is not installed. Run: pip3 install graphify && python3 -m graphify . --output graphify-out/"
fi

if [ "$CREATE_GITHUB" -eq 1 ]; then
  log "Creating GitHub repo"
  GITHUB_USER="$(gh api user --jq .login 2>/dev/null || true)"
  [ -n "$GITHUB_USER" ] || die "Could not detect GitHub user. Run: gh auth login"
  gh repo create "$GITHUB_USER/$PROJECT_NAME" --private --source=. --remote=origin --push
fi

cat <<EOF

============================================================
  Project ready at $TARGET_DIR
============================================================

Next step:
  cd "$TARGET_DIR"
  claude
  /setup

Claude Code will handle Convex, Vercel, Sentry, Cloudflare,
and the remaining service configuration through MCPs/CLIs.
EOF
