#!/usr/bin/env bash
# Update the vibe-launchpad plugin that is installed on this computer to the
# version on GitHub main, then verify the installed version.
# Run this after a version PR is merged to main.
set -euo pipefail
cd "$(dirname "$0")/.."

want=$(git show origin/main:.claude-plugin/plugin.json 2>/dev/null | grep '"version"' | sed -E 's/.*"([0-9.]+)".*/\1/')
[ -n "$want" ] || { echo "ERROR: cannot read the version on origin/main. Run 'git fetch' first." >&2; exit 1; }

claude plugin marketplace update vibe-launchpad
claude plugin update vibe-launchpad@vibe-launchpad

have=$(claude plugin list --json 2>/dev/null | grep -A6 '"vibe-launchpad@vibe-launchpad"' | grep '"version"' | head -1 | sed -E 's/.*"([0-9.]+)".*/\1/')
if [ "$have" = "$want" ]; then
  echo "OK: installed vibe-launchpad is $have (same as origin/main). Start a new session to load it."
else
  echo "ERROR: installed version is '${have:-unknown}', origin/main is $want." >&2
  echo "Check that the PR bumped the version in .claude-plugin/plugin.json and marketplace.json." >&2
  exit 1
fi
