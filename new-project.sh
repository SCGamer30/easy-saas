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
GITHUB_USER="scgamer30"
PROJECTS_DIR="$HOME/Documents/GitHub"
TARGET_DIR="$PROJECTS_DIR/$PROJECT_NAME"

# Clone boilerplate into new folder
echo "Cloning boilerplate into $TARGET_DIR..."
git clone "https://github.com/$GITHUB_USER/boilerplate.git" "$TARGET_DIR"
cd "$TARGET_DIR"

# Remove boilerplate remote
git remote remove origin

# Update package.json name
sed -i '' "s/\"name\": \"boilerplate\"/\"name\": \"$PROJECT_NAME\"/" package.json

# Update CLAUDE.md title
sed -i '' "s/# Boilerplate — Claude Context/# $PROJECT_NAME — Claude Context/" CLAUDE.md

# Copy env example
cp .env.example .env.local

# Install dependencies
echo "Installing dependencies..."
npm install

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
