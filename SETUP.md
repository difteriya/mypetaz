# Quraşdırma (yeni kompüterdə)

mypet.az monorepo-nu sıfırdan qaldırmaq üçün.

## Tələblər

- **Node.js 22+**
- **pnpm 9** (`npm i -g pnpm@9` və ya `corepack enable`)
- **Docker Desktop** (lokal PostgreSQL üçün)
- **Git**

## Addımlar

```bash
# 1. Clone
git clone https://github.com/difteriya/mypetaz.git
cd mypetaz

# 2. Asılılıqlar
pnpm install
```

### 3. Mühit dəyişənləri (.env — repo-da YOXDUR, yaradın)

`packages/db/.env`:

```env
DATABASE_URL="postgresql://mypet:mypet@localhost:5432/mypet?schema=public"
```

`apps/web/.env.local`:

```env
DATABASE_URL="postgresql://mypet:mypet@localhost:5432/mypet?schema=public"
AUTH_SECRET="<yaradın: npx auth secret>"
APP_URL="http://localhost:3000"
# İstəyə bağlı: social login + email
# AUTH_GOOGLE_ID=
# AUTH_GOOGLE_SECRET=
# RESEND_API_KEY=
```

`apps/vet/.env.local` (web ilə eyni `AUTH_SECRET`):

```env
DATABASE_URL="postgresql://mypet:mypet@localhost:5432/mypet?schema=public"
AUTH_SECRET="<web ilə eyni dəyər>"
```

> Nümunə üçün `.env.example` fayllarına baxın. `.env`-lər gitignore-dadır — secret-lər repo-ya düşmür.

### 4. Baza + seed

```bash
pnpm db:up          # Docker PostgreSQL 17 qaldırır
pnpm db:migrate     # migrasiyaları tətbiq edir
pnpm db:seed        # baza məlumatları: şəhərlər, kateqoriyalar, cinslər, sahələr
pnpm db:seed:demo   # İSTƏYƏ BAĞLI: demo istifadəçilər, elanlar, biznes, bloq
```

**Demo giriş** (`db:seed:demo`-dan sonra) — şifrə hamısı `demo1234`:

| E-poçt | Rol |
|---|---|
| `admin@mypet.az` | Admin (`/admin` panel) |
| `user@mypet.az` | Fərdi (pet + elan + bloq) |
| `shop@mypet.az` | Biznes (storefront) |

### 5. İşə sal

```bash
pnpm dev            # web → http://localhost:3000, vet → http://localhost:3001
```

## Faydalı əmrlər

| Əmr | İş |
|---|---|
| `pnpm build` | Bütün app-ləri build et |
| `pnpm typecheck` | Bütün workspace-i type-check |
| `pnpm lint` | Lint |
| `pnpm db:studio` | Prisma Studio (baza GUI) |
| `pnpm db:down` | Postgres konteynerini dayandır |

## Qeydlər

- **Yüklənmiş şəkillər köçmür.** `public/uploads/` gitignore-dadır (hero, kateqoriya, demo şəkilləri). Yeni maşında olmayacaq — admin paneldən (`/admin/content`) yenidən əlavə edin, ya da qovluğu əl ilə köçürün. Şəkil olmayan yerdə səliqəli placeholder göstərilir.
- **Prod deploy** (VPS: Nginx + PM2/Docker + SSL) hələ konfiqurasiya edilməyib — bu, planın 20-ci addımıdır.
- **Claude Code yaddaşı/skill-ləri** `~/.claude/` qovluğundadır, git ilə köçmür — hər maşında ayrıca.
