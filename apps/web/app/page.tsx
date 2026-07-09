import Link from 'next/link';
import { Button } from '@mypet/ui';
import {
  getFeaturedListings,
  getLatestListings,
  getCategoriesWithBreeds,
  getCategoryListingCounts,
} from '@/lib/listings/data';
import { CategoryIcon } from '@/components/category-icons';
import { getBlockMap } from '@/lib/cms/data';
import { imageVariant } from '@/lib/images';
import { ListingCard } from '@/components/listings/listing-card';
import { JsonLd, APP_URL } from '@/components/json-ld';
import { LISTING_TYPES } from '@/lib/listings/schema';
import { listingTypeLabel } from '@/components/listings/listing-badge';

export default async function HomePage() {
  const [featured, latest, categories, catCounts, home] = await Promise.all([
    getFeaturedListings(),
    getLatestListings(8),
    getCategoriesWithBreeds(),
    getCategoryListingCounts(),
    getBlockMap('HOME'),
  ]);
  const leftImg = home.get('hero_left_image');
  const rightImg = home.get('hero_right_image');
  const fieldLabel = 'mb-1 block text-xs font-bold text-ink/60';
  const fieldBox = 'w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-ink outline-none focus:border-brand-400';

  return (
    <main className="px-4 py-8">
      <JsonLd
        data={{ '@context': 'https://schema.org', '@type': 'Organization', name: 'mypet.az', url: APP_URL }}
      />

      {/* Hero — full-bleed band with lifestyle images left & right */}
      <section className="relative left-1/2 -mt-8 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-b from-cream-200 to-cream-50">
        <div className="pointer-events-none absolute -right-24 top-0 size-[26rem] rounded-full bg-white/50" />
        {leftImg && (
          <img
            src={imageVariant(leftImg, 'detail')}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 hidden h-[92%] w-auto object-contain lg:block"
          />
        )}
        {rightImg && (
          <img
            src={imageVariant(rightImg, 'detail')}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 hidden h-[92%] w-auto object-contain lg:block"
          />
        )}

        <div className="relative z-10 mx-auto max-w-3xl px-4 py-14 text-center sm:py-20">
          <span className="text-sm font-bold uppercase tracking-wider text-teal-500">
            Ev Heyvanları Üçün Yeni Nəsil Platforma.
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-6xl">
            {home.get('hero_title', 'Bir Pati Min Xoşbəxtlik')}
          </h1>

          {/* Search card */}
          <form
            action="/listings"
            method="get"
            className="mx-auto mt-8 grid max-w-2xl gap-3 rounded-2xl bg-white p-4 text-left shadow-soft sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
          >
            <div>
              <label htmlFor="h-cat" className={fieldLabel}>
                Kateqoriya
              </label>
              <select id="h-cat" name="categoryId" defaultValue="" className={fieldBox}>
                <option value="">Kateqoriya seçin</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="h-type" className={fieldLabel}>
                Tip
              </label>
              <select id="h-type" name="type" defaultValue="" className={fieldBox}>
                <option value="">Tipi seçin</option>
                {LISTING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {listingTypeLabel(t)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="h-q" className={fieldLabel}>
                Açar söz
              </label>
              <input id="h-q" name="q" placeholder="Açar sözlərinizi daxil edin…" className={fieldBox} />
            </div>
            <Button type="submit" className="h-[42px]">
              Axtar
            </Button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-14">
        <h2 className="mb-5 text-2xl font-extrabold text-ink">Kateqoriyalar</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/listings?categoryId=${c.id}`}
              className="flex flex-col items-center gap-3 rounded-3xl bg-white p-5 text-center ring-1 ring-cream-200 transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <CategoryIcon slug={c.slug} className="size-14" />
              <span className="font-bold text-ink">
                {c.name} <span className="font-semibold text-ink/40">({catCounts[c.id] ?? 0})</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-extrabold text-ink">Seçilmiş Elanlar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <section className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-ink">Son Elanlar</h2>
            <Link href="/listings" className="text-sm font-semibold text-brand-600 hover:underline">
              Hamısına bax →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
