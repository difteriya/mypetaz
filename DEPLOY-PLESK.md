# Deploying mypet.az to Plesk (Git + Phusion Passenger + PostgreSQL)

This monorepo runs **two Node.js apps** that share one database and one login
session:

| Domain          | App        | Passenger app root      | Startup file |
| --------------- | ---------- | ----------------------- | ------------ |
| `mypet.az`      | `apps/web` | `<repo>/apps/web`       | `server.js`  |
| `vet.mypet.az`  | `apps/vet` | `<repo>/apps/vet`       | `server.js`  |

Both are Next.js 15 (SSR + Server Actions) — they need a **Node runtime**, not a
static export. The repo is cloned **once**; each domain's Passenger app points at
a different subfolder.

---

## 0. Server prerequisites (once)

- **Node.js** 20 LTS available in Plesk (Node.js extension / Passenger). Pick it
  per domain.
- **pnpm 9** — provided by `corepack` (the deploy script activates it), or
  `npm i -g pnpm@9.15.9` over SSH.
- **PostgreSQL** component installed in Plesk (Tools & Settings → Updates →
  add "PostgreSQL server"), or an external Postgres (Neon/Supabase).
- **Let's Encrypt** for `mypet.az` **and** `vet.mypet.az` (secure cookies require
  HTTPS on both).

## 1. DNS + domains

1. Point `mypet.az` A-record → server IP.
2. Add subdomain `vet.mypet.az` in Plesk (A-record → same IP).
3. Issue Let's Encrypt certificates for both (include `www` if used).

## 2. PostgreSQL database

Plesk → Databases → Add Database → server type **PostgreSQL**:

- DB name `mypet`, user `mypet`, a strong password.
- Build the connection string:
  `postgresql://mypet:PASSWORD@localhost:5432/mypet?schema=public`

## 3. Clone the repo via Plesk Git (on the `mypet.az` domain only)

1. Plesk → `mypet.az` → **Git** → add repository.
2. Repo is **private**, so authenticate one of these ways:
   - Add the server's SSH key (Plesk shows it) as a **Deploy key** on the GitHub
     repo, and use the `git@github.com:difteriya/mypetaz.git` URL; **or**
   - Use an HTTPS URL with a GitHub Personal Access Token.
3. Set the deployment path, e.g. `/httpdocs/mypetaz` (note the absolute path Plesk
   shows — you'll reuse it below as `<repo>`).
4. Deployment mode: **automatic** (deploy on push) or manual — your choice.

## 4. Environment variables (both apps)

Copy `.env.production.example` values into Plesk → each domain's **Node.js →
Custom environment variables**. Reminders:

- `AUTH_SECRET`, `AUTH_COOKIE_DOMAIN=.mypet.az`, `DATABASE_URL` — **identical** on
  both apps.
- `AUTH_URL` — the app's **own** domain (`https://mypet.az` vs
  `https://vet.mypet.az`).
- Generate the secret once: `openssl rand -base64 32`.

## 5. Configure the two Passenger apps

For **each** domain: Plesk → domain → **Node.js**:

| Field                    | mypet.az                 | vet.mypet.az             |
| ------------------------ | ------------------------ | ------------------------ |
| Node version             | 20.x                     | 20.x                     |
| Application mode         | production               | production               |
| Application root         | `<repo>/apps/web`        | `<repo>/apps/vet`        |
| Application startup file | `server.js`              | `server.js`              |
| Document root            | `<repo>/apps/web/public` | `<repo>/apps/vet/public` |

Do **not** click Plesk's "NPM install" button — it runs `npm` at the app root and
breaks the pnpm workspace. Dependencies are installed by the deploy script (below).

## 6. First deploy

Over SSH, from `<repo>`:

```bash
corepack enable && corepack prepare pnpm@9.15.9 --activate
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:deploy          # creates all tables from prisma/migrations
# optional first-time content/taxonomy seed (NOT the demo accounts):
# pnpm db:seed
pnpm build              # builds web + vet
mkdir -p apps/web/tmp apps/vet/tmp
touch apps/web/tmp/restart.txt apps/vet/tmp/restart.txt   # restart Passenger
```

Then set Plesk Git **Additional deployment actions** to `bash scripts/deploy.sh`
so every future push repeats install → migrate → build → restart automatically.

## 7. Persistent uploads

User images must survive redeploys/re-clones. Keep them **outside** the checkout:

```bash
mkdir -p /var/www/vhosts/mypet.az/uploads
```

- Set `UPLOAD_DIR=/var/www/vhosts/mypet.az/uploads` on the **web** app.
- Serve them at `/uploads` via a static alias so Next doesn't have to. In Plesk →
  `mypet.az` → Apache & nginx Settings → **Additional nginx directives**:

  ```nginx
  location /uploads/ {
      alias /var/www/vhosts/mypet.az/uploads/;
      expires 30d;
      access_log off;
  }
  ```

  (Uploads are only written by the web app; vet.mypet.az doesn't need this.)

## 8. Verify

- `https://mypet.az` loads; `https://vet.mypet.az` shows the "Daxil ol" screen.
- Log in on mypet.az, open vet.mypet.az → you're **already logged in** (shared
  cookie). If not, recheck `AUTH_SECRET` + `AUTH_COOKIE_DOMAIN` match and both are
  HTTPS.
- Upload a pet photo → it appears (confirms `UPLOAD_DIR` + alias).

---

### Troubleshooting

- **Passenger 502 / app won't boot** — check the domain's Passenger log
  (`<repo>/apps/web/tmp` or Plesk → Logs). Usually a missing env var or a build
  that didn't finish.
- **Build OOM-killed** — the deploy script sets `--max-old-space-size=2048`; raise
  it, or build one app at a time (`pnpm --filter @mypet/web build`).
- **Prisma "engine not found"** — always run `pnpm db:generate` **on the server**
  (never ship a Windows-generated client); the deploy script does this.
- **Login loops / not shared** — both apps must use the same `AUTH_SECRET`,
  `AUTH_COOKIE_DOMAIN=.mypet.az`, and valid HTTPS certs.
