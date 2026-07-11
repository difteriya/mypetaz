# CLAUDE.md — mypet.az

Project context for Claude Code. Read this first; see `PLAN.md` (full product plan),
`SETUP.md` (fresh-machine setup), and `arxiv/skills/` (archived global skills).

## What this is

**mypet.az** — an all-in-one pet portal for Azerbaijan: pet profiles + listings +
business accounts + blog + reviews, with a separate vet platform (`vet.mypet.az`)
sharing the same DB. Phase-1 is AZ-only. Product language: **UI strings, category/breed/
city names are Azerbaijani; code identifiers and enum values are English.**

## Stack & layout

pnpm 9 + Turborepo · Next.js 15 (App Router) · TypeScript · Prisma 6 / PostgreSQL 17 ·
Auth.js (NextAuth v5) · Tailwind CSS 4 · next/font (Nunito). Windows dev box.

```
apps/web   → mypet.az (:3000)      apps/vet → vet.mypet.az (:3001, Phase 1.5 skeleton)
packages/db    → Prisma schema + client + slugify (@mypet/db)
packages/auth  → NextAuth config, password, schemas (@mypet/auth, @mypet/auth/password)
packages/ui    → Button (@mypet/ui)
packages/config→ tsconfig/eslint/tailwind presets
```

Commands: `pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` ·
`pnpm db:up|db:migrate|db:seed|db:seed:demo|db:studio`.

## Progress

Phase-1 plan is 20 steps (see PLAN.md §6). **Steps 1–19 done & committed**; **step 20
(VPS deploy: Nginx/PM2/Docker/SSL + Search Console/GA4) NOT started.** A full
frontend-design pass + many UX fixes are also done. The `main` branch is pushed to
GitHub (`difteriya/mypetaz`).

Deferred (noted in commits): admin CRUD for PetBreed/PetCategoryField/ServiceCategory/
BlogCategory; vet platform (Phase 1.5); migrate `package.json#prisma` seed →
`prisma.config.ts`; real category/demo photos (currently AI-sourced hero/sides only).

## Conventions & key mechanisms

- **Moderation:** listings/business/blog/reviews default `PENDING`, become `ACTIVE` only
  via admin (`/admin`, role=ADMIN). Public queries filter `status: ACTIVE`.
- **Dynamic pet fields (§4.1):** `PetCategoryField` rows → runtime Zod schema + form
  (`apps/web/lib/pets/fields.ts`). Unknown keys stripped.
- **Image pipeline (§3.1):** `apps/web/lib/uploads.ts` (sharp) → WebP variants
  thumb/card/detail/full, SEO slug filenames, EXIF-stripped. DB stores the stem;
  `imageVariant(stem, variant)` builds the URL. Admin CMS upload capped at 5 MB.
- **CMS:** `ContentBlock` (admin `/admin/content`), cached via `unstable_cache`
  (tag `'cms'`, 300s TTL); `revalidateTag('cms')` on edit. Home hero + side images +
  footer + ad zones come from here (`HOME`/`FOOTER`/`GLOBAL` blocks).
- **Auth in layout:** root layout does NOT call `auth()` (keeps pages ISR-friendly);
  `SiteHeader` + `AccountNav` check the session client-side via `/api/auth/session`.
- **Account nav** is global (`components/site/account-nav.tsx`), shown on account paths.
- **No emojis** anywhere — use SVG icons (`components/icons.tsx`,
  `components/category-icons.tsx`).
- **Ownership transfer** lives on the pet page (`/pet/[id]`), petId-based.
- **Health-record attribution:** `PetHealthRecord.addedById`; label helper
  `lib/pets/health-label.ts` → "{ad} tərəfindən", "… (keçmiş sahib)", or "{klinika} tərəfindən".

## Windows gotchas (important)

- **Stop the dev server before `prisma generate` / `pnpm lint`** — a running Next dev
  locks `query_engine-windows.dll.node` → `EPERM` rename. (`pnpm lint` triggers db build.)
- **Never run `pnpm build` while `pnpm dev` is running** — the prod build clobbers dev's
  `.next` → 500s. Kill dev first, or build in a separate checkout.
- After setting a CMS block via raw SQL (bypassing the action), the cache is stale until
  the 300s TTL or `revalidateTag('cms')` (or clear `.next/cache`).
- `docker` isn't on the shell PATH by default; prepend
  `/c/Program Files/Docker/Docker/resources/bin`.

## Demo data

`pnpm db:seed:demo` → `admin@mypet.az` / `user@mypet.az` / `shop@mypet.az`, password
`demo1234`. Uploaded images are NOT in git (`public/uploads/` ignored).
