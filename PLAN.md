# mypet.az — Project Plan

> An "all-in-one" portal for pets in Azerbaijan: pet profiles + listings + business accounts (shop + service providers merged) + blog (Phase 1), and a full e-commerce shop (Phase 2).
> Related project: a separate-domain appointment platform for veterinarians — runs in sync with mypet.az over a shared backend/DB.

**Last updated:** 2026-07-09

> **Product language convention:** This document is written in English, but the product itself is Azerbaijani (Phase 1 is AZ-only). Accordingly:
> - **UI strings** (labels, buttons, badges shown to users) are kept in Azerbaijani, quoted — e.g. "Nömrəni göstər", "Rəy yaz".
> - **Category display names, breed seed lists, service-category names, and city names** are kept in Azerbaijani (product data on an AZ site).
> - **URL slug values** (category `it`/`pisik`, breed slugs, generated title slugs) stay Azerbaijani for local SEO; **structural route segments** are English (`/listings`, `/businesses`, `/dashboard`).
> - **Code identifiers** — data-model field names, enum/status values, `ContentBlock` keys — are English (never user-visible; the UI renders localized labels separately).

---

## 1. Overview

| | |
|---|---|
| **Project** | mypet.az — pet portal + vet platform (separate domain, shared backend) |
| **Language** | Azerbaijani (Phase 1 is AZ-only) |
| **Technology** | Next.js (App Router) + PostgreSQL |
| **Hosting** | VPS (Nginx + PM2/Docker, PostgreSQL and images on the same server) |
| **Design** | Warm and friendly — soft colors, pet-themed illustrations |
| **Monetization** | None in Phase 1, with one exception: business accounts are free in Phase 1 with admin approval, but **move to paid self-registration in Phase 2** (later becoming module-based: posting listings / offering services may be separately paid — see section 6) |

---

## 2. Phase 1 — Scope

### 2.1 Pet Profile (core object — everything hangs off it)
- Every pet is **tied to the user's profile** (`ownerId`) and exists independently of any listing
- **Pet creation flow (step by step):**
  1. **Choose a category** — İt / Pişik / Dovşan / Gəmiricilər (Xomyak və bənzərləri) / Balıq / Quş / Digər (see 2.2)
  2. **Choose a breed (type)** — from the admin-managed breed list bound to the chosen category (e.g. category = İt → breed = Golden Retriever), or "Qarışıq/Bilinmir"
  3. **Fill in the category-specific dynamic fields** (see 2.2 — each category has its own field set)
- **Ownership transfer:** when a sale/adoption via a listing completes, the pet profile transfers from the old owner to the new owner **together with its full history** (passport, vaccination records, vet history) — the pet's ID stays fixed, only `ownerId` changes (trigger rule: see 2.5)
- In the personal dashboard: a "Mənim petlərim" list, with a profile page for each

### 2.2 Categories and dynamic fields

**Top 6 categories + Other:**

| Category |
|---|
| 🐕 İt |
| 🐈 Pişik |
| 🐇 Dovşan |
| 🐹 Gəmiricilər (Xomyak və bənzərləri) |
| 🐠 Balıq |
| 🐦 Quş |
| 🔹 Digər |

### 2.2.1 Breeds (types) — admin-managed

Each category has its own **breed list** (e.g. category = İt → breed = Golden Retriever). This list is managed from the admin panel **without code changes** (add / edit / reorder / deactivate) — the following are added as initial seed data:

**İt:**
Alman Çoban İti, Qafqaz Çoban İti (Alabaş), Orta Asiya Çoban İti (Alabai), Golden Retriever, Labrador Retriever, Pudel, Yorkshire Terrier, Chihuahua, Pomeranian (Şpiц), Sibir Haskisi, Rottweiler, Fransız Buldoqu, Şi-Tzu, Dratxar, Qarışıq/Bilinmir

**Pişik:**
Fars, Britan Qısa Tüklü, Şotland Qıvrıq Qulaqlı, Siam, Sfinks, Meyn Kun, Qızıl Şinşilla, Van Pişiyi, Benqal, Reqdoll, Yerli/Adi Pişik, Qarışıq/Bilinmir

**Dovşan:**
Holland Lop, Angora Dovşanı, Flamand Nəhəngi, Reks, Karlik Dovşan (Netherland Dwarf), Himalay Dovşanı, Yerli Dovşan, Qarışıq/Bilinmir

**Gəmiricilər:**
Suriya Xomyakı, Cungar Xomyakı, Roborovski Xomyakı, Dəniz Donuzu (Guinea Pig), Çinçilla, Cerbil, Dequ, Qarışıq/Bilinmir

**Balıq:**
Qızıl Balıq, Betta (Döyüşçü Balıq), Guppi, Neon Tetra, Skalyariya, Karp Koi, Som Balığı, Oskar, Papağan Balığı (Flowerhorn), Qarışıq/Digər

**Quş:**
Dalğalı Tutuquşu (Budgie), Kakadu, Ara Papağan (Macaw), Afrika Boz Tutuquşusu, Lovbird, Konur, Kanareya, Bülbül, Dekorativ Toyuq, Göyərçin, Qarışıq/Bilinmir

**Digər:** no breed list — the user types the type freely as free text.

> Every list must keep a "Qarışıq/Bilinmir" option at the end so a user can still post even when they don't know the exact breed.

**Common fields (across all categories):**
`name`, `breed`, `birthDate` (or approximate age), `sex`, `color`, `weight`, `microchipNo (optional)`, `images`, `short description/temperament`

**Category-specific extra fields:**

| Category | Extra fields |
|---|---|
| İt / Pişik | coat length, spayed/neutered or not, size (small/medium/large), temperament tags (calm, energetic, kid-friendly, etc.) |
| Dovşan | coat type, size category |
| Gəmiricilər | sub-type (hamster/guinea pig/chinchilla/gerbil, etc.), coat type, cage type |
| Balıq | water type (fresh/salt), aquarium size, temperature/pH requirement |
| Quş | sub-type, wing-clipped or not, talking/singing ability |
| Digər | free-form extra fields (key-value pairs) |

> Technical note: these field sets must **not** be a fixed DB schema — store them as a **category-based JSON schema** so that adding a new category/field requires no code change (see section 4, `PetCategoryField`).

### 2.3 Passport and Vaccination (optional, tied to the pet profile)
- **Passport:** document number, issue date, microchip ID, place of birth, document image (upload)
- **Vaccination/medical history:** each record = type (vaccine/exam/surgery), name, date, next date (for reminders), note, added-by (the user themselves **or** a veterinarian — see section 7)
- These records **transfer in full** with the pet during ownership transfer
- The user can also add records manually (without vet approval, as a personal note only) — records added by a vet must be distinguished from these (source: "Özüm" vs "Baytar: Dr. X")

### 2.4 Listings
- **Listing types (with badge colors):** `SALE`, `ADOPTION`, `LOST_FOUND`, `MATING` (the "Alış" type from mypet.az is dropped in Phase 1 — rarely used, can be added later)
- **A listing is a pointer to an existing pet profile** — the user creates a pet first, then opens a listing for it (data isn't duplicated; the listing is just a "storefront" for the pet profile)
- Posting a listing: choose pet → choose listing type → fill price (for sale) / city / address (with map pin) / contact info
- Filters: listing type, category, breed, city, price range, age
- Search (by title/description)
- **A listing is never posted directly:** a new listing is created with status `PENDING` by default and is **not publicly visible** on the site (listing list, search, category pages, home page) — it only switches to `ACTIVE` and becomes visible after admin approval. This rule **applies to all listing owners** — no exception between individual users and business accounts
- Listing statuses: `PENDING` (moderation, default) → `ACTIVE` (admin approval) → `FINISHED` / `REJECTED`
- **Badge over the image:** a colored ribbon in the top-left corner — a different color per listing type (e.g. Sale = turquoise, Adoption = pink, Lost/Found = red, Mating = purple); below it, an optional second status ribbon ("Yeni", "Təcili")
- **Price display:** the manat symbol (₼) is used (e.g. "450 ₼"); if the symbol isn't supported (old device/font), it automatically falls back to the **"AZN" text fallback** (via font/glyph detection on the front end)
- **"Nömrəni göstər" (tap.az reference):** on the listing detail (and on the card itself for business listings) the phone number is first shown masked (e.g. "+994 •• ••• •• ••") and reveals the full number on click; a WhatsApp button is shown separately

#### Featured Listings (home page, for future monetization)
- A **"Seçilmiş Elanlar"** section on the home page (carousel/grid) — similar to the "Seçilmiş Elanlar" section on mypet.az, shown at the very top of the site
- Controlled by the `Listing.featured` (bool) field — **in Phase 1, admin manually** can mark any listing as featured (free, for curation purposes)
- **In Phase 2 this becomes a paid VIP/premium placement** — a user/business can pay to promote their own listing to "Featured" (see section 6, VIP/premium listings)
- A featured listing card has an extra visual difference: a "Featured" mark with a golden border frame/star icon (not mixed with the type badge — a separate visual layer)

#### Listing detail page — layout
- Main content: image gallery, all pet/listing fields, "Nömrəni göstər" + WhatsApp buttons, a **"Xəritədə göstər"** button (if an address exists; on click an embedded map opens/expands)
- **If the listing was posted by a business account** — a business card is shown on the **right** side of the page (like the seller panel on tap.az's product page): business logo, name, "Təsdiqlənmiş" badge, listing count, "Profilə bax" link, "Nömrəni göstər" button
- **Below, if it is a business listing:** a "[Business name]-nın digər elanları" horizontal grid
- **Always, below:** a "Bənzər elanlar" grid (listings matched by the same category/breed/city) — this appears for individual-seller listings too
- **Reviews and ratings** — a formalized version of the "Rəy və şərhlər" section already present on mypet.az: 1–5 star rating + review text; the average rating and review count are shown next to the listing title (see "Review system" below)

#### Review system (for Listings + Business profiles, shared `Review` model)
- **Who can write a review:** only **logged-in** users (unlike the old "guest + name/email" form on mypet.az, this is more spam-resistant) — each user can write **only one review** per target (listing or business profile)
- **Moderation:** a new review goes through the same flow as listings/blog — default `PENDING`, becomes `ACTIVE` and publicly visible after admin approval (for spam/abusive-content filtering)
- **Where it appears:**
  - On the listing detail page — rating + review list + "Rəy yaz" form
  - On the business profile page — the **average rating** is added to the stats row (★ 4.6, 32 rəy) (see 2.7), with the review list + "Rəy yaz" form below — a **single** review stream covering both the listing and service sides of the business (there is no separate "shop review" / "service review" split; in the real world a business is rated once)
- **Target types (Phase 1):** `Review.targetType` — `LISTING` / `BUSINESS`. The structure is designed so that **`VET` can be added easily in Phase 2** (see section 6, Phase 2 backlog) — minimal code change

### 2.5 Ownership Transfer flow
- Only the **listing owner (seller)** triggers it: they move the listing to a "Sahiblik dəyişdi" status and **select the buyer's account** from the system (search by email/phone, or select from the conversation with the buyer)
- As soon as the seller confirms, the transfer executes **automatically**: the pet's `ownerId` is updated and the full history (passport, vaccinations, vet records) begins showing in the new owner's dashboard
- The pet stays in the old owner's dashboard under a "Köçürülmüş" archive (read-only, for history)
- **During transfer, all active `PetShareLink`s are automatically deactivated** — a link the old owner shared must not keep working without the new owner's consent; the new owner can recreate their own link if they want
- Risk note: because this flow is simplified, admin-side **rollback** capability must be added to the admin panel for error/dispute cases

### 2.6 Contact (both)
- Phone number + WhatsApp link on the listing
- **Internal messaging** — conversation over a listing, polling-based (no real-time WebSocket required)
- **Unread state:** `Message.read` (bool) drives a per-conversation unread count and a total unread badge in the header (next to `/messages`), refreshed by the same lightweight poll as the message list
- **Message notifications:** a new incoming message creates a `Notification` (type `NEW_MESSAGE`, deep-link to the conversation) — see 2.13. In-app always; email is **throttled/opt-in** (not one email per message — e.g. at most one "you have unread messages" email per conversation per idle period) so active chats don't spam the inbox. The notification is auto-marked read when the recipient opens the conversation

### 2.7 Business Accounts — Shop + Service providers (merged)
> Previously "Shop" (a pet-selling business) and "Service provider" (groomer, pet hotel, dog trainer) were planned as separate account types. These are merged into **one "Business" account** — a single business can both **post listings** (pet sale/adoption) and **offer its services** (e.g. a pet shop that also offers grooming). Both capabilities are **jointly and freely active in Phase 1**; in the future they may be offered as separate paid modules (see section 6, Phase 2).

- **Account type:** `User.accountType` — `INDIVIDUAL` / `BUSINESS` (pet shop, breeder, shelter, groomer, pet hotel, dog trainer/animal trainer, walking service, etc. — all one account type)
- **Business vs Vet are independent:** `accountType` (INDIVIDUAL/BUSINESS) and `role` (USER/VET/ADMIN) are orthogonal — **a business account can also be a vet** (`accountType=BUSINESS` + `role=VET`), unlocking both the business storefront on mypet.az and the vet panel on vet.mypet.az from the same login (see the `User` model note in section 4 and 7.1)
- **Self-registration:** any business **registers and creates its profile from its own account** → stays in a pending state **until an admin approves it** (`PENDING` → `ACTIVE`) — the **same moderation language** as listings/blog/reviews, free in Phase 1
- **Change deferred to Phase 2 (noted now):** business account creation will move to **paid** self-registration, and the admin-approval requirement will be removed (see section 6)
- **Business profile:** name, banner, logo, description, address + show on map (lat/lng), city, business hours (open/closed live status), phone ("Nömrəni göstər", tap.az-style), social links, "Təsdiqlənmiş Biznes" badge
- **Service category tags (optional, can be multi-select):** qromer, pet otel, kinoloq/heyvan təlimçisi, gəzdirmə xidməti, digər (`ServiceCategory` — a simple admin-managed lookup; adding a new category requires no code change); a pure pet-selling business may select no category

**Two independent capabilities (both active in Phase 1):**
1. **Posting listings** — a business can post several listings, each still **tied to its own pet profile** (the 2.1 model isn't broken; passport/medical history/ownership transfer work on these listings too). A small "Biznes" badge/link is shown on the listing cards (to distinguish from an individual seller). Even if the business account is approved, **each listing still goes through separate admin moderation** (see 2.4) — business status does not auto-`ACTIVE` a listing
2. **List of offered services (`ServiceOffering`)** — the business adds the specific services it offers as a structured list (e.g. for a pet hotel: "Gündəlik baxım", "Gecələmə", "Hovuz"; for a groomer: "Tam yuyulma", "Tük kəsimi", "Caynaq kəsimi") — each service has an optional price/description, freely added/edited by the owner, no admin approval needed (the business profile itself is already approved)

- **Reviews and ratings** — the shared `Review` system (see 2.4) works here too: users can give the business a star rating + comment (one review per user), it goes through moderation, and the average rating is shown on the profile page
- A **catalog/directory page** (`/businesses`) filterable by city/category — lists all businesses (a "only listing sellers" / "only service providers" filter can be added if desired)
- **Vet clinics/doctors are outside this model** — they have a fully functional panel on their own separate domain (including appointments) (see section 7). For other service types, appointments/reservations are **Phase 2**; in Phase 1 contact is only via "Nömrəni göstər"

#### Business profile page (`/business/[slug]`) — with turbo.az/tap.az references
Combining the most successful elements of tap.az's shop page (banner + stats) and turbo.az's dealer page (banner + business hours + "Nömrəni göstər"):

- **Banner (cover):** full-width, the business's own uploaded image (a default pet-themed banner if none) — may have a logo/name overlay
- **Logo:** square, positioned overlapping below the banner
- **Title block:** business name (large) + "Təsdiqlənmiş Biznes" badge (blue tick, like tap.az)
- **Stats row:** listing count • view count • **★ average rating (with review count)**
- **Description:** short text, expands with "Davamını oxu" when long
- **Address + status:** address text + a **"Xəritədə göstər"** button (opens an embedded map on click, based on lat/lng), "Açıqdır/Bağlıdır" live status + business hours (dropdown)
- **Top-right action button:** **"Nömrəni göstər"** (business phone, masked like tap.az → reveals on click) / WhatsApp
- **If it has listings — "[Business name] elanları (N)":** internal search, filter by pet category, sorting, listing grid (regular listing cards, badges kept)
- **If it has offered services — "Göstərdiyi xidmətlər":** list view (name + price/description if present)
- **Reviews section** — review list (star + text + reviewer name) + "Rəy yaz" form (for logged-in users)

### 2.8 User system
- Registration / login: email + password, social login (Google, Facebook) — Auth.js / NextAuth
- Personal dashboard:
  - **Mənim petlərim** (profiles + history)
  - Mənim elanlarım (by status)
  - **Bloq yazılarım** (create/edit + status: Gözləmədə/Aktiv/Rədd, see 2.12)
  - **Biznesim** (for a business account: profile + offered-services list management, status view, see 2.7)
  - Mesajlarım
  - Seçilmişlər (listings)
  - Profile settings

### 2.9 Admin panel
- **Listing moderation** (approve / reject + reason) — new listings land in the default `PENDING` list and are not visible on the site until an admin reviews and sets them `ACTIVE` (individual and business listings follow the same rule)
- Ownership transfer rollback
- **Business profile moderation** (approve/reject + reason) — newly registered business accounts are created as `PENDING` and appear in the catalog after admin approval (see 2.7); `ServiceCategory` CRUD (the list of qromer, otel, kinoloq, etc.)
- Approval of veterinarian registrations (see 7.1)
- User list (blocking)
- Category management: `PetBreed` CRUD (add breed, edit, reorder, deactivate) and `PetCategoryField` CRUD (dynamic fields) — neither requires code changes
- Mark/unmark a listing as "Featured" (`Listing.featured` toggle) — to manage the "Seçilmiş Elanlar" section on the home page (see 2.4)
- **Blog moderation** (approve/reject + reason) — `metaTitle`/`metaDescription` (SEO) are filled in at approval time, the category is assigned/changed; posts the admin writes themselves are created directly as `ACTIVE` (see 2.12)
- `BlogCategory` CRUD
- **Review moderation** (approve/reject + reason) — for listing and business reviews, spam/abusive-content filtering (see "Review system", 2.4)
- **Reviewing reports** (`Report`) — a list of already-active listings/blog/reviews/businesses flagged by the community; the admin can review and deactivate the content (see 2.13)
- Content management (see 2.10)
- Simple statistics

### 2.10 Content Management (CMS) — the images/text of all pages editable from the admin panel

The **static content** on the site (marketing copy, banner images, static page text) is not hardcoded — it's managed by a `ContentBlock` system that can be edited from the admin panel **without a code change/deploy**:

- **Home page:** hero background image, hero title/subtext, promo banners (blocks like "Sənə Yeni Dost Tapaq" / "Paylaşımını Bizimlə Et" on mypet.az — each an image + title + button text + link; the admin controls the count too)
- **Static pages:** Haqqımızda, Əlaqə — free rich-text + image content
- **Footer:** address, contact phone/email, social media links
- **Category/breed images:** a representative image for each `PetBreed` (and the main categories) is uploaded/changed by the admin (`PetBreed.image`) — used on the category-selection screens and as listing-card placeholders
- **Admin UI:** a block list grouped per page; each block shows an input matching its type (upload widget + preview for images, a simple input for text, a rich-text editor for long text)
- Changes appear on the live site immediately (no deploy wait)

> Note: this does not apply to **dynamic content** like listings/businesses (those are managed from their own CRUD, see 2.9) — the CMS covers only the **marketing/static** part of the site.

### 2.11 Pet Passport Export (shared link / PDF)
- A **"Passport-u paylaş"** feature on the pet profile — the owner can share their pet's data externally
- **Export formats:** a public shared link (read-only page) and a PDF document (for download/print)
- **The owner chooses what is shown** — selected with checkboxes when creating the share:
  - Basic info (name, category, breed, age, sex, color, image)
  - Passport data (document number, microchip, place of birth)
  - Vaccination/medical history (all `PetHealthRecord` records, including vet records)
- The shared link must be **manageable**: the owner can disable/re-enable the link at any time (token-based, cannot be opened without knowing the full URL)
- The PDF is generated server-side based on the same selection (a tidy document resembling a passport format — pet image, main-info table, history list)

### 2.12 Blog (moved from Phase 2 to Phase 1)
- **Who can write:** every pet owner — individual user **and** business account — can create a blog post from their dashboard. The admin can also create official posts via the CMS (on behalf of the mypet.az team)
- **Moderation flow (same logic as the listing flow):** when a user/business post is created it defaults to `PENDING` and isn't publicly visible → after admin approval it becomes `ACTIVE` and is published **under the author's name**. Posts the admin writes themselves are created directly as `ACTIVE` without needing moderation
- If an approved post is later edited, it drops back to `PENDING` (a change requires approval too)
- **SEO metadata:** during moderation (at approval time) the admin fills/edits the `metaTitle`/`metaDescription` fields — this determines how the post appears in search results (see section 8)
- **Categories:** each post is assigned one `BlogCategory` (an admin-managed list — e.g. Qulluq, Qidalanma, Sağlamlıq, Tərbiyə, Hekayələr)
- If the author is a business account, the post links to the business profile; for individual users the author name appears as plain text (no public profile link)
- **A "Bloq yazılarım" section in the personal dashboard** — post create/edit form + status view (Gözləmədə / Aktiv / Rədd + reason)

### 2.13 Trust and Safety — Notifications + Reports

Because **everything across the site goes through moderation** (listing, blog, review, business), it's important to notify the user of the outcome; the community must also be able to report already-published content.

#### Notifications (`Notification`)
- **When sent:** listing/blog/business approved/rejected (with reason), review approved, new message received, pet ownership transferred to you
- **Channel:** in-app (a notification bell in the header + a `/dashboard/notifications` list) + **email** (for the most important events: rejection/approval, ownership transfer)
- The unread count is shown in the header

#### Report mechanism (`Report`)
- A **"Şikayət et"** button on an already-**ACTIVE** listing, blog post, review, or business profile — the user selects a reason (spam, fake, abusive, fraud, etc.) + an optional note
- Lands in the admin panel (`PENDING` → `REVIEWED`); the admin can review and deactivate the content — complementing pre-publish moderation with **post-publish community oversight**
- This differs from the initial moderation of new submissions — it's for content that was already approved but later turns out to be problematic

### 2.14 Pages
| Route | Page |
|---|---|
| `/` | Home page — hero (with background image), categories, **featured listings**, latest listings, businesses |
| `/pets` | Personal dashboard — pet profiles |
| `/pets/new` | Pet creation (category → breed → dynamic fields) |
| `/pet/[id]` | Pet profile (full for the owner, limited view for others if a listing exists) |
| `/pet/[id]/passport` | Passport share/export management (for the owner) |
| `/p/[token]` | Public shared passport view (via link, no login required) |
| `/listings` | Listing list + filters |
| `/listings/[category]` | Category landing (SEO, see 8.1) |
| `/listings/[category]/[breed]` | Breed landing (SEO, see 8.1) |
| `/listings/[slug]` | Listing detail |
| `/post-listing` | New listing form (select from existing pet) |
| `/businesses` | Business catalog/directory (all shops + service providers, city/category filter) |
| `/business/[slug]` | Business profile — its listings + offered services + reviews (see 2.7) |
| `/become-business` | Business-account upgrade/registration request form |
| `/blog` | Blog list |
| `/blog/[category]` | Blog category landing (SEO) |
| `/blog/[slug]` | Blog post detail |
| `/write-post` | New blog post form (for logged-in user/business) |
| `/dashboard/*` | Personal dashboard (listings, messages, favorites, **my blog posts**, **my business panel**) |
| `/dashboard/notifications` | Notifications list (see 2.13) |
| `/messages` | Internal messaging |
| `/about`, `/contact` | Static pages |
| `/terms` | Terms of use |
| `/privacy-policy` | Privacy policy |
| `/admin/*` | Admin panel |

---

## 3. Tech stack

| Layer | Choice (pinned to latest stable as of 2026-07) |
|---|---|
| Runtime | Node.js 22 LTS ("Jod") — pinned via `.nvmrc` + `engines` field |
| Package manager | **pnpm 9** (workspaces) — required for an efficient monorepo (content-addressed store, strict deps) |
| Monorepo build | **Turborepo 2** — task pipeline + caching across `apps/*` and `packages/*` |
| Framework | Next.js 15 (App Router, Server Components, Turbopack dev) |
| Language | TypeScript 5.x (strict mode) |
| DB | PostgreSQL 17 (local on the VPS, **shared between mypet.az and the vet platform**) |
| ORM | Prisma 6 |
| Auth | Auth.js (NextAuth v5) — email/password + social login (Google, Facebook — easy to add more providers thanks to Auth.js's provider system), **shared auth** (one account for both systems, different panel by role) |
| Image storage | VPS disk (`/uploads`) + resize/webp with sharp (see image pipeline, section 3.1) |
| Email service | Resend / SMTP — password reset, approval/rejection notifications, ownership-transfer alerts |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form + Zod (Zod also powers the dynamic pet-field validator, see section 4.1) |
| Deploy | VPS: Nginx (reverse proxy + SSL) + PM2 or Docker Compose |

> Version policy: pin exact major versions above; within a major, track the latest **stable** patch/minor (no betas/RCs in production). Renovate/Dependabot may be added later for controlled upgrades.

### Monorepo/service structure
- **Shared backend/DB** decision: two Next.js apps (`mypet.az` + `vet.mypet.az`) connect to the same Prisma schema and the same PostgreSQL instance
- Proposed structure: **pnpm workspace + Turborepo** monorepo (`apps/web` → mypet.az, `apps/vet` → vet.mypet.az, `packages/db` — shared Prisma client and types; `packages/ui` — shared components; `packages/config` — shared tsconfig/eslint/tailwind presets)
- In Nginx, a separate server block per subdomain, both proxying to Next.js instances running on different ports on the same VPS
- Thanks to the subdomain choice, **one wildcard SSL certificate** (`*.mypet.az`) and a **shared cookie/session domain** suffice — no cross-domain auth complexity

### VPS setup (at deploy time)
- **Nginx** — reverse proxy, direct static serving for `/uploads`, gzip, a separate block per subdomain
- **SSL** — Let's Encrypt (certbot, wildcard `*.mypet.az` certificate, auto-renewal)
- **Process manager** — PM2 (a separate process per app) or Docker Compose (2 apps + 1 postgres)
- **Backup** — nightly cron: `pg_dump` + an archive of the uploads folder
- **Deploy flow** — git pull → `pnpm install` → `pnpm build` (Turborepo) → PM2 restart

### 3.1 Image pipeline (upload → optimize → serve) — SEO-friendly

All user-uploaded images (pet photos, listing images, business banner/logo, blog covers) go through one shared pipeline on upload:

- **SEO-friendly file naming:** files are **not** stored under random UUIDs alone. The stored name is a **slug derived from context** + a short unique suffix, e.g. `golden-retriever-satisi-baki-a1b2.webp` (from the listing title/pet/breed + short hash for uniqueness). Azerbaijani letters are transliterated the same way as URL slugs (ə→e, ş→sh, ç→ch, … see 8.1). Descriptive filenames are a genuine image-SEO signal (Google Images).
- **Alt text (required):** every image stores an `alt` field. It is auto-generated from context (e.g. "Golden Retriever, 2 yaşında, Bakı" / "[Business name] loqosu") and, where the user provides one, editable. Never ship empty `alt`. (`PetImage.alt`, `ListingImage.alt`, `BusinessProfile.logoAlt/bannerAlt`, `BlogPost.coverAlt`.)
- **Format & compression:** convert every upload to **WebP** (with sharp), quality ~80; strip EXIF metadata (privacy + size). Keep the original only if needed for re-processing.
- **Responsive variants:** on upload, generate a fixed set of widths so cards/detail/thumbnails don't each download a full-res image:
  - `thumb` 160w (dashboard lists, avatars)
  - `card` 400w (listing/business cards, grids)
  - `detail` 1024w (listing detail gallery, blog cover)
  - `full` ≤1920w (lightbox / passport PDF source)
  Each variant is a separate WebP file; the DB stores the base name and the pipeline derives variant URLs.
- **Delivery:** served through the Next.js **Image component** (see 8.5) for automatic `srcset`, lazy-loading, and correct sizing — pointed at the `/uploads` variants (Nginx serves `/uploads` directly). Explicit `width`/`height` set on every image to reserve space and protect CLS (Core Web Vitals).
- **Limits & validation:** accept jpg/png/webp/heic input; max ~10 MB/file; enforce a per-entity image count (e.g. listings ≤ 12). Reject non-images server-side (magic-byte check, not just extension).
- **Cleanup:** deleting an entity (or removing an image) deletes all its variant files; a periodic sweep removes orphaned files from `/uploads`.

## 4. Data model (sketch)

> Field names below are English code identifiers. Enum/status values (`PENDING`, `ACTIVE`, `SALE`, etc.) are English; the UI renders localized Azerbaijani labels for them separately.

```
User            — id, name, email, phone, role (USER/VET/ADMIN),
                  accountType (INDIVIDUAL/BUSINESS), createdAt
                  — `role` and `accountType` are ORTHOGONAL (independent),
                  not one enum. `accountType` = how the user behaves as an
                  end user of mypet.az (individual person vs a business that
                  posts listings/offers services → owns a `BusinessProfile`).
                  `role` = platform-level permission (USER = normal, VET =
                  also has a `VetProfile` + access to the vet.mypet.az panel,
                  ADMIN = moderation panel). So a single account CAN be a
                  BUSINESS accountType AND VET role at once (e.g. a vet clinic
                  that is also a business on mypet.az) — the vet panel is
                  unlocked by `role=VET`, the business storefront by
                  `accountType=BUSINESS`; they don't conflict (see 2.7 / 7.1)

BusinessProfile — id, userId, name, slug, banner, bannerAlt, logo, logoAlt,
                  description, city, address,
                  lat, lng, phone, businessHours, viewCount,
                  avgRating (nullable, cache), reviewCount (default 0, cache),
                  status (default: PENDING — self-registration, ACTIVE after
                  admin approval), approvedAt,
                  paymentStatus (nullable, for Phase 2), createdAt
                  — avgRating/reviewCount are recomputed whenever a `Review`
                  is approved (cached for performance, see "Review system");
                  merged Shop+Service model (see 2.7) — listing posting
                  (`Listing.userId`) and the `ServiceOffering` list both
                  attach to this profile
BusinessServiceCategory — businessId + serviceCategoryId (multi-select,
                  optional — a pet-selling business may select none)

Pet             — id, ownerId, category, breedId (nullable — empty for
                  "Qarışıq/Bilinmir"), name, birthDate, sex, color,
                  weight, microchipNo, description, static_fields (above),
                  status (ACTIVE/TRANSFERRED), createdAt
PetImage        — id, petId, url (base name; variants derived, see 3.1),
                  alt (required, auto-generated + editable), order
PetBreed        — id, category, name (e.g. "Golden Retriever"), slug, order,
                  image (nullable — representative image, uploaded by admin), active (bool),
                  description (nullable — text for the SEO landing page),
                  metaTitle, metaDescription (nullable, for SEO)
                  — admin-managed, each category has its own breed (type)
                  list (see 2.2.1) and SEO landing content (see 8.1)

ContentBlock    — id, page (HOME/ABOUT/CONTACT/FOOTER/GLOBAL),
                  key (unique, e.g. "hero_image", "banner_1_title"),
                  type (TEXT/RICHTEXT/IMAGE/URL), value, order, updatedAt
                  — admin-managed, all static page images/text without a
                  code change (see 2.10)
PetCategoryField— id, category, fieldName, type (text/number/select/bool),
                  options (JSON), required (bool), order
                  — admin-managed, add fields without a code change

PetPassport     — id, petId, documentNo, issueDate, microchipId,
                  birthPlace, documentImage

PetHealthRecord — id, petId, type (VACCINE/EXAM/SURGERY), name, date,
                  nextDate, note, source (SELF/VET),
                  vetAppointmentId (nullable — linked if a vet added it),
                  createdAt

PetShareLink    — id, petId, token, active (bool), sharedFields (JSON —
                  basicInfo/passport/medicalHistory selections), viewCount,
                  createdAt

Listing         — id, type, petId, title, slug, description, price, city,
                  address, lat, lng, phone, featured (bool),
                  status (default: PENDING — no listing is created ACTIVE
                  automatically), userId, createdAt
ListingImage    — id, listingId, url (base name; variants derived, see 3.1),
                  alt (required, auto-generated + editable), order
OwnershipTransfer— id, petId, oldOwnerId, newOwnerId, listingId,
                  date, reverted (bool)

BlogCategory    — id, name (e.g. "Qulluq", "Qidalanma", "Sağlamlıq"), slug,
                  order, active (bool) — admin-managed
BlogPost        — id, userId (author — individual/business/admin), categoryId,
                  title, slug, coverImage, coverAlt, excerpt, content (rich-text),
                  status (default: PENDING; ACTIVE when the admin writes it),
                  metaTitle, metaDescription (filled by admin at approval time),
                  publishedAt (date it became ACTIVE), createdAt, updatedAt
                  — moderation flow is the same as Listing (see 2.12)

Review          — id, targetType (LISTING/BUSINESS — Phase 2: +VET),
                  targetId, userId (reviewer), rating (1-5), content,
                  status (default: PENDING), createdAt
                  — unique: (userId, targetType, targetId) — one review per target;
                  moderation flow is the same as Listing/BlogPost (see 2.4)

Favorite        — userId + listingId
Conversation    — id, listingId, buyerId, sellerId
Message         — id, conversationId, senderId, content, read, createdAt

Notification    — id, userId, type (LISTING_APPROVED/LISTING_REJECTED/
                  BLOG_APPROVED/BLOG_REJECTED/REVIEW_APPROVED/NEW_MESSAGE/
                  BUSINESS_APPROVED/BUSINESS_REJECTED/OWNERSHIP_TRANSFER),
                  message, link, read (bool), createdAt
                  — in-app + email (for important events), see 2.13
Report          — id, targetType (LISTING/BLOG_POST/REVIEW/BUSINESS), targetId,
                  reporterId, reason, note (nullable),
                  status (default: PENDING; REVIEWED after admin review),
                  createdAt — post-publish community oversight, see 2.13

ServiceCategory — id, name (qromer/pet otel/kinoloq/gəzdirmə/digər), slug,
                  order, active (bool) — admin-managed
                  (attached to `BusinessProfile` via `BusinessServiceCategory`)
ServiceOffering — id, businessId, name (e.g. "Tük kəsimi", "Gecələmə"),
                  price (nullable), description (nullable), order
                  — the structured list of specific services a business offers,
                  freely managed by the owner (see 2.7)

City            — id, name (Bakı, Gəncə, Sumqayıt, ...)

--- Vet platform (extra tables in the shared DB) ---
VetProfile      — id, userId, clinicName, specialty, businessHours, address,
                  licenseNo, verified (bool), createdAt
VetAppointment  — id, vetId, petId, requesterUserId, date, time,
                  status (REQUEST/CONFIRMED/REJECTED/COMPLETED), note,
                  createdBy (CUSTOMER/DOCTOR)
VetVisitRecord  — id, appointmentId, petId, vetId, examType,
                  description, date, approved (bool), approvedAt
                  — when approved=true it's copied to PetHealthRecord
```

### 4.1 Dynamic pet fields — the schema-from-data engine

`Pet.static_fields` is a JSON blob whose **shape is defined by data, not code** — the `PetCategoryField` rows for the pet's category (see 2.2). Because admins can add/edit fields with no deploy, there is no fixed Zod schema to write. The single most delicate piece of Phase 1 is the engine that turns those field definitions into both a form and a validator:

- **One source of truth:** load `PetCategoryField` rows for the chosen `category` (ordered). Each row = `{ fieldName, type (text/number/select/bool), options (JSON, for select), required, order }`.
- **Runtime Zod builder:** map each row to a Zod rule and compose them into one `z.object({...})` at request time — e.g. required `text` → `z.string().min(1)`, optional `number` → `z.coerce.number().optional()`, `select` → `z.enum(options)` (or `.optional()`), `bool` → `z.boolean()`. Validate the submitted `static_fields` against this generated schema on the server (source of truth) and reuse it on the client for instant feedback.
- **Dynamic form rendering:** the same field list renders the form (input type per `type`, dropdown from `options`, required markers, order) — so adding a field in admin makes it appear in the form and be validated, with zero code change.
- **Stability rules:** `fieldName` is the immutable key stored inside `static_fields` (a human label can change without breaking existing data); deactivating a field hides it from new forms but keeps historical values readable; validation must **ignore unknown/removed keys** gracefully rather than reject old pets.
- **SEO/landing reuse:** the same field values feed the listing detail spec table and can enrich category/breed landing pages (see 8.1).

> This engine is also the template for anything else "admin-defined": it's the pattern behind `PetCategoryField`. Build it once, cleanly.

## 5. Design direction

- **Tone:** warm, friendly, emotional — the love of animals should be felt
- Soft, warm color palette (cream background, warm accent color)
- Rounded corners, soft shadows, pet-themed illustrations/icons
- **Hero section:** a full-bleed background photo (a warm, lively pet photo — sourced from the internet, watermark-free) + a light dark overlay for readability, with a title/CTA on top
- Images front and center (large-image listing cards, sample photos sourced from the internet for each category/breed)
- Badge ribbon on the listing card: type (colored) + optional status ribbon stacked, top-left corner
- Mobile-first — most users will access from a phone
- The vet platform can have a more "clinical/professional" tone (same color family, but calmer) — refined in section 7
- The business profile page carries a slightly more "professional/brand" tone (banner + logo + stats, turbo.az/tap.az reference — see 2.7), but the listing cards keep the same warmth as the rest of the site

### 5.1 Layout — Boxed design + ad zones

- **Boxed layout:** all page content in a fixed max-width container (e.g. `max-width: 1280px`), horizontally centered — not a full-bleed fluid layout (only the hero background image may be full-bleed; the content itself stays boxed)
- **Ad zones (visual space reserved, static/managed in Phase 1):**
  - **Above the header** — before the boxed container, a full-width horizontal banner zone at the very top of the page (leaderboard-type, e.g. 970×250)
  - **Left/right background zone** — based on the real example we checked on tap.az: this is not two separate sidebars, but the left and right visible portions of **a single whole "background" ad**. Technically `position: fixed`, pinned to the left/right edges of the viewport (`left:0` / `right:0`), starting from the header height and extending downward; in **z-index terms it stays below the boxed content** — because the boxed container's own (cream/white) background covers it, only the strips outside the container are visible (on a wide viewport the visual effect: the site is "inside a frame", with one whole ad image around it)
  - When the screen approaches the boxed width there's no visible room for these zones → they **auto-hide**; on mobile only the above-header banner (in a shrunken form) may remain
  - **Bonus (note for Phase 2):** tap.az also has a "catfish"-type sticky bottom-bar ad, visible at the very bottom of the page above everything else (high z-index); not required in Phase 1, but easy to add as the ad system grows
- **Management:** until a dedicated ad-sales system is built, these zones are managed via the existing **`ContentBlock`** (CMS, see 2.10) — in the admin panel `page=GLOBAL`, keys: `ad_header`, `ad_background` (one image + link, split to the left/right edges via CSS) — a simple solution until a real ad-order system (see Phase 2)

## 6. Phases

### Phase 1 (this plan)
1. Monorepo skeleton: Next.js (apps/web) + Prisma + Auth + Tailwind setup
2. DB schema + seed (cities, categories, `PetCategoryField`)
3. Auth (registration/login)
4. **Pet profile:** CRUD + category→breed→dynamic-field flow + image upload
5. Passport + vaccination/medical history (manual records)
6. Listings: pet-linked CRUD + badge + filters + detail page (show number, show on map, business sidebar, similar listings) + Featured Listings (admin-managed)
7. Ownership transfer flow (seller approval)
8. **Business accounts:** `BusinessProfile`/`ServiceCategory`/`ServiceOffering` + self-registration flow + admin approval + profile (storefront) page + directory (`/businesses`)
9. Pet Passport Export: shared link (token-based) + PDF generation
10. Internal messaging
11. Personal dashboard (including the business panel)
12. **Blog:** `BlogPost`/`BlogCategory` + post-create form (dashboard) + moderation flow + category/detail pages
13. **Review system:** `Review` model (listing + business) + "Rəy yaz" form + moderation + rating caches
14. Admin panel + moderation (listing + blog + review + business) + rollback
15. **Notifications + Reports:** `Notification` (in-app + email) and `Report` system + admin review panel (see 2.13)
16. Content Management (CMS): `ContentBlock` system + admin UI (image upload + rich-text)
17. Boxed layout + ad zones (above header, left/right rail) — static banners managed via `ContentBlock`
18. Home page + static pages (Haqqımızda, Əlaqə, Qaydalar, Məxfilik Siyasəti) — rendered from CMS blocks, design polish
19. **SEO foundation:** category/breed/blog landing pages + metadata/OG + JSON-LD + sitemap/robots (see section 8)
20. Deploy (VPS: Nginx + SSL + PM2 + backup cron) + testing + Search Console/GA4 setup

### Phase 1.5 — Vet platform (see section 7, to be planned separately)
1. `apps/vet` skeleton (connecting to the shared DB/Prisma)
2. Vet self-registration + admin approval
3. Appointment: customer request + doctor manual creation
4. Visit record → approval → copy to `PetHealthRecord`
5. Vet domain deploy (an extra server block in Nginx)

### Phase 2 (future — out of scope)
- 💳 Paid business-account self-registration (admin-approval requirement removed, payment integration)
- 🧩 **Module-based business pricing** — "posting listings" and "offering services" offered as separate paid options (in Phase 1 both are free and active together, see 2.7) — e.g. a business that only wants to sell listings pays one tariff, one that wants both listings and services pays another
- 🛒 Full e-commerce for business accounts (catalog, cart, payment via Payriff/Epoint, delivery) — physical product sales on top of pet listings
- 💎 VIP/premium listings + payment — the admin-managed `Listing.featured` flag in Phase 1 becomes paid self-service (a user/business can pay to promote their listing to "Featured", see 2.4)
- 📢 Full ad-order system (for the above-header + left/right rail zones) — advertiser management, active date range, impression/click stats; in Phase 1 these zones are simply filled statically via `ContentBlock` (see 5.1)
- 📅 Online reservation/appointments for business profiles (groomer, pet hotel, dog trainer, etc. — self-registration moved to Phase 1, see 2.7; only the reservation system remains here; a similar flow for vets already exists in Phase 1.5, see section 7)
- 🔔 Vaccination next-date reminders (email/SMS)
- 💬 Comments on blog posts + newsletter subscription (the core blog functionality moved to Phase 1, see 2.12)
- 🌐 Russian/English languages
- ⭐ Reviews/ratings for vet profiles (adding `Review.targetType = VET` — the `Review` system for Listing/Business already exists in Phase 1, see 2.4)

---

## 7. Veterinary (Vet) Platform — vet.mypet.az

### 7.1 Doctor registration and profile
- The veterinarian self-registers (`VetProfile`), activated after admin approval
- Profile: clinic/personal name, specialty area, business hours, address, license number

### 7.2 Appointment flow (both are supported)
- **Customer side:** the user picks a vet for their pet and sends a date/time request → the doctor confirms/rejects
- **Doctor side:** for a customer who arrives by call/walk-in, the doctor creates the appointment manually and directly (`createdBy = DOCTOR`)
- Appointment statuses: `REQUEST → CONFIRMED/REJECTED → COMPLETED`

### 7.3 Visit record and copying into the pet's history
- After the appointment is completed the doctor creates a `VetVisitRecord` (exam, vaccine, surgery, etc.)
- **Once the doctor approves the record** (`approved = true`) it is automatically copied into `PetHealthRecord` and appears with its date in the history list on the pet profile
- The source is marked as "Baytar: [Clinic/Doctor name]", distinguished from records the user added themselves

### 7.4 Decisions
- **Domain:** `vet.mypet.az` (subdomain) — under the same brand, shared SSL (wildcard) and shared auth/session are easy
- **Monetization:** none in Phase 1, vets use it for free. May be added in Phase 2 (see section 6)
- **History access:** during a visit the doctor sees the pet's **full medical history** — including past records from other clinics (full context is essential for correct diagnosis/treatment; no privacy restriction)

---

## 8. SEO and Marketing

mypet.az is a **listings/marketplace site** — for this kind of site the main source of organic traffic is long-tail searches ("golden retriever satışı bakı", "pişik balası pulsuz sahiblənmə", etc.). SEO must be built into the architecture **before coding**; adding it later is far harder.

### 8.1 URL structure — category/breed landing pages
In addition to the current flat `/listings/[slug]` structure, the following **indexable landing pages** are added (not just a filtered results view — each is a real crawlable page with a unique H1/text/meta):

| Route | Purpose |
|---|---|
| `/listings/[category]` | Category landing (e.g. `/listings/it`) — for searches like "İt elanları Bakıda" |
| `/listings/[category]/[breed]` | Breed landing (e.g. `/listings/it/golden-retriever`) — the strongest long-tail page ("golden retriever satışı") |
| `/listings/[slug]` | Individual listing detail (existing) |

- City landing (`/listings/it/baki`) may be added in Phase 1.5/2 — in Phase 1 the city filter stays as a query param (canonical pointing to the main category/breed page, avoiding thin-content/duplicate)
- Slugs correctly transliterate Azerbaijani letters (ə, ı, ö, ü, ş, ç, ğ) (ə→e, ş→sh, ç→ch, etc.) — clean ASCII, readable URLs
- Extra fields on the **`PetBreed`** model for SEO: `description` (unique descriptive text for the breed landing page), `metaTitle`, `metaDescription` — filled from the admin panel (see 2.10 CMS)

### 8.2 Metadata & Open Graph
- Dynamic `<title>`/`<meta description>` per page type via the Next.js **Metadata API**: listing (title + city + price), category/breed landing (static SEO text), business/vet profile (name + city)
- **Open Graph + Twitter Card** — with the listing image, title, and price; critical in the AZ market for correct previews when shared on WhatsApp/Instagram
- The Pet Passport shared link (`/p/[token]`) also has its own OG preview (pet image + name) — the link looks attractive when shared

### 8.3 Structured data (JSON-LD)
- **Listing page:** `Product` + `Offer` schema (price, currency, availability status)
- **Business / Vet profile:** `LocalBusiness` schema (name, address, phone, business hours, lat/lng) — for a rich appearance in Google's local search results
- **All pages:** `BreadcrumbList` schema (Home › Listings › İt › Golden Retriever › [listing])
- **Home page:** `Organization` schema (the mypet.az brand)
- **`AggregateRating` added to the Listing (`Product`) and Business (`LocalBusiness`) schemas** — ready for both in Phase 1 together with the `Review` system (see 2.4); added to vet profiles in Phase 2 when the review system extends there

### 8.4 Sitemap, robots, and canonical
- Dynamic **XML sitemap** — `sitemap.xml` (index) → `sitemap-listings.xml`, `sitemap-categories.xml`, `sitemap-businesses.xml` — only `ACTIVE`-status listings/profiles are included; those that haven't passed admin approval don't appear in the sitemap (consistent with the moderation rule in section 2.4)
- `robots.txt` — `/dashboard/*`, `/messages/*`, `/admin/*`, `/api/*` are blocked; public pages are open
- Filtered/sorted listing URLs (`?city=&price=`) point to the main category page via a **canonical tag** — preventing duplicate content
- When a listing is `FINISHED`/deleted it is **not a soft-404** — a "Bu elan artıq mövcud deyil" page with similar listings (link equity isn't lost, the user doesn't leave)

### 8.5 Performance / Core Web Vitals
- The Next.js **Image component** for all pet images (automatic responsive, lazy-load, WebP) — overlaps with the already-planned `sharp` pipeline (see section 3)
- Category/breed landing pages are rendered **static/ISR** (they don't change often, can be cached); listing details are revalidated frequently via ISR
- Mobile-first performance — decisive for Google's mobile-first indexing (most users also access from mobile, see section 5)

### 8.6 Internal linking
- Breadcrumb on every page (both visual and `BreadcrumbList` JSON-LD)
- The "Biznesin digər elanları" + "Bənzər elanlar" grids (already planned, see 2.4) — also create a strong internal link mesh for SEO
- Links to all active breeds on the category landing page (a new breed appears automatically when added, from the `PetBreed` list)

### 8.7 Content marketing — Blog (Phase 1, see 2.12)
- **User/business-sourced blog** — captures informational searches ("pişik necə qidalandırılır", "it peyvənd cədvəli") → organic traffic + brand trust; community-oriented content (users sharing their experience) also brings original, unique content to the site — useful for Google's E-E-A-T (experience/trust) signals
- Each post has `metaTitle`/`metaDescription` fields **filled by the admin at moderation time** (see 2.12) — the technical SEO work is integrated into the content flow, requiring no separate step
- Each blog article can link to related breed/category landing pages (related listings/services) — a content-to-commerce bridge
- Based on `BlogCategory`, own landing pages (`/blog/[category]`) also create additional indexable pages (same logic as in 8.1)

### 8.8 Analytics and tracking
- Domain verification + sitemap submit to Google Search Console (at the deploy stage)
- Google Analytics 4 / GTM integration — conversion tracking for events like listing view, "Nömrəni göstər" click, listing-post completion
- Regular index/coverage checks in Search Console (to track indexing of new listings that pass admin moderation)

### 8.9 Preparing for future languages (Phase 2)
- Even though Phase 1 is AZ-only, the URL structure is built to accommodate a Russian/English addition (e.g. `/ru/listings/...`, `/en/listings/...` prefixes) so that adding **hreflang** in Phase 2 is easy
- Slugs are kept language-neutral (where possible); translation is only in visible text, not in the URL — so past links don't break when the language changes
