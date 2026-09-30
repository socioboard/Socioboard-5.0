#!/usr/bin/env bash
# Checks that every non-merge commit in BASE..HEAD carries a Developer Certificate of Origin
# sign-off by its own author (CONTRIBUTING.md). Used by CI for pull requests from forks.
#   .github/check-dco.sh <base> <head>
set -euo pipefail
base="$1"
head="$2"
missing=0
for commit in $(git rev-list --no-merges "${base}..${head}"); do
  author="$(git show -s --format='%an <%ae>' "$commit")"
  # A plain string match on the whole message (no grep pipe: `grep -q` stopping early breaks
  # the pipe, which pipefail would count as a failure).
  message="$(git show -s --format='%B' "$commit")"
  if [[ "$message" != *"Signed-off-by: ${author}"* ]]; then
    echo "::error::$(git show -s --format='%h %s' "$commit") has no 'Signed-off-by: ${author}' (git commit -s; see CONTRIBUTING.md)"
    missing=1
  fi
done
[ "$missing" = 0 ] && echo "Every commit is signed off."
exit "$missing"
