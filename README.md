# mypet.az

Monorepo for **mypet.az** (pet portal) and **vet.mypet.az** (veterinary platform),
sharing one PostgreSQL database and Prisma schema. See [PLAN.md](./PLAN.md) for the
full product plan.

## Stack

Node 22 LTS · pnpm 9 · Turborepo 2 · Next.js 15 (App Router) · TypeScript 5 ·
Prisma 6 / PostgreSQL 17 · Tailwind CSS 4 · Auth.js (NextAuth v5).

## Layout

```
apps/
  web/          → mypet.az        (Next.js, port 3000)
  vet/          → vet.mypet.az    (Next.js, port 3001)
packages/
  db/           → @mypet/db       (Prisma schema + shared client)
  ui/           → @mypet/ui       (shared React components)
  config/       → @mypet/config   (tsconfig / eslint / tailwind presets)
```

## Getting started

```bash
pnpm install
cp packages/db/.env.example packages/db/.env   # set DATABASE_URL
pnpm db:generate                                # generate Prisma client
pnpm dev                                        # run all apps (turbo)
```

## Scripts (root)

| Command | What it does |
|---|---|
| `pnpm dev` | Run every app in dev (Turborepo) |
| `pnpm build` | Build all apps + packages |
| `pnpm typecheck` | Type-check the whole workspace |
| `pnpm lint` | Lint the whole workspace |
| `pnpm db:generate` | `prisma generate` |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |

> **Status:** Phase 1 — step 1 (monorepo skeleton) complete. Next: step 2 (full
> Prisma schema + seed), then step 3 (auth). See PLAN.md §6.
