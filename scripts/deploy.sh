#!/usr/bin/env bash
# Plesk Git "Additional deployment actions" script — runs on the server after each
# pull. Installs deps, generates the Prisma client, applies DB migrations, builds
# both apps, then restarts both Passenger apps.
#
# Set it in Plesk → Domain → Git → Deploy actions as:  bash scripts/deploy.sh
set -euo pipefail

# Make pnpm available. On shared Plesk hosting `corepack enable` fails with
# EACCES (it symlinks into the root-owned Node dir), so prefer the per-user
# install at ~/.local/share/pnpm (see DEPLOY-PLESK.md step 6).
export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
export PATH="$PNPM_HOME:$PATH"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found — install it once with:"
  echo "  curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=9.15.9 sh -"
  exit 1
fi

echo "→ install"
pnpm install --frozen-lockfile

echo "→ prisma generate + migrate deploy"
pnpm db:generate
pnpm db:deploy

echo "→ build (web + vet)"
# Next builds are memory-hungry; raise the heap if the server OOM-kills the build.
export NODE_OPTIONS="--max-old-space-size=2048"
pnpm build

echo "→ restart Passenger apps"
mkdir -p apps/web/tmp apps/vet/tmp
touch apps/web/tmp/restart.txt apps/vet/tmp/restart.txt

echo "✓ deploy complete"
