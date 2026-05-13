#!/bin/bash
# Update c7-fire-nights: stage all changes, commit with timestamp, push to main.
# GitHub Pages auto-rebuilds within 1–2 minutes.

set -e
cd "$(dirname "$0")"

if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to commit."
  exit 0
fi

git add -A
git commit -m "Update $(date +%Y-%m-%d_%H:%M)"
git push origin main

echo ""
echo "✓ Pushed. Live in 1–2 min:"
echo "  https://bethreewater.github.io/c7-fire-nights/"
