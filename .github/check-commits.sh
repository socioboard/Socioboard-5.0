#!/usr/bin/env bash
# Checks every non-merge commit in BASE..HEAD (CONTRIBUTING.md, AGENTS.md):
#   - it carries a Developer Certificate of Origin sign-off by its own author;
#   - it names no AI as an author: no AI "Co-Authored-By" trailer, no "Generated with" footer.
#     The person who opens the pull request is its author.
# Used by CI for every pull request.
#   .github/check-commits.sh <base> <head>
set -euo pipefail
base="$1"
head="$2"
# Co-author trailers naming a coding assistant or its makers' no-reply addresses.
ai_coauthor='co-authored-by:[^'$'\n'']*(claude|anthropic|codex|openai|chatgpt|copilot|cursor|gemini|devin)'
generated='generated (with|by) \[?(claude|codex|chatgpt|copilot|cursor|gemini|devin)'
shopt -s nocasematch
failed=0
for commit in $(git rev-list --no-merges "${base}..${head}"); do
  author="$(git show -s --format='%an <%ae>' "$commit")"
  subject="$(git show -s --format='%h %s' "$commit")"
  # Plain string and regex matches on the whole message (no grep pipe: `grep -q` stopping early
  # breaks the pipe, which pipefail would count as a failure).
  message="$(git show -s --format='%B' "$commit")"
  if [[ "$message" != *"Signed-off-by: ${author}"* ]]; then
    echo "::error::${subject} has no 'Signed-off-by: ${author}' (git commit -s; see CONTRIBUTING.md)"
    failed=1
  fi
  if [[ "$message" =~ $ai_coauthor || "$message" =~ $generated ]]; then
    echo "::error::${subject} names an AI as an author ('${BASH_REMATCH[0]}'); remove the line (AGENTS.md)"
    failed=1
  fi
done
[ "$failed" = 0 ] && echo "Every commit is signed off, with no AI attribution."
exit "$failed"
