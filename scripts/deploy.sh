#!/usr/bin/env bash
# Plesk Git "Additional deployment actions" script — runs on the server after each
# pull. Installs deps, generates the Prisma client, applies DB migrations, builds
# both apps, then restarts both Passenger apps.
#
# Set it in Plesk → Domain → Git → Deploy actions as:  bash scripts/deploy.sh
set -euo pipefail

# Make pnpm available (corepack ships with Node 16.13+). Adjust if you installed
# pnpm globally instead.
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.15.9 --activate >/dev/null 2>&1 || true

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
