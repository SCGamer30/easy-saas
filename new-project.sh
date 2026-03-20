#!/bin/bash

# Usage: ./new-project.sh <project-name>
# Example: ./new-project.sh my-saas-app

set -e

if [ -z "$1" ]; then
  echo "Usage: ./new-project.sh <project-name>"
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
echo "Done! Your project is ready at $TARGET_DIR"
echo ""
echo "Next steps:"
echo "  1. Fill in .env.local with your Clerk, Convex, and Resend keys"
echo "  2. Run: npm run dev"
echo "  3. In a second terminal: npx convex dev"
