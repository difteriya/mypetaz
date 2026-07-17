import Link from 'next/link';
import { Button } from '@mypet/ui';
import {
  getFeaturedListings,
  getLatestListings,
  getCategoriesWithBreeds,
  getCategoryListingCounts,
} from '@/lib/listings/data';
import { getBlockMap } from '@/lib/cms/data';
import { imageVariant } from '@/lib/images';
import { ListingCard } from '@/components/listings/listing-card';
import { JsonLd, APP_URL } from '@/components/json-ld';
import { HeroSearch } from '@/components/home/hero-search';

export default async function HomePage() {
  const [featured, latest, categories, catCounts, home] = await Promise.all([
    getFeaturedListings(),
    getLatestListings(8),
    getCategoriesWithBreeds(),
    getCategoryListingCounts(),
    getBlockMap('HOME'),
  ]);
  const heroImg = home.get('hero_image');

  return (
    <main className="px-4 py-8">
      <JsonLd
        data={{ '@context': 'https://schema.org', '@type': 'Organization', name: 'mypet.az', url: APP_URL }}
      />

      {/* Hero — full-bleed band with an editable background image (CMS: hero_image) */}
      <section className="relative left-1/2 -mt-8 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-b from-cream-200 to-cream-50">
        {heroImg && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageVariant(heroImg, 'full')}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 size-full object-cover"
            />
            {/* Light overlay keeps the dark title + white search card readable over any photo */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream-50/85 via-cream-50/70 to-cream-50/90" />
          </>
        )}
        <div className="pointer-events-none absolute -right-24 top-0 size-[26rem] rounded-full bg-white/40" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <span className="text-sm font-bold uppercase tracking-wider text-teal-500">
            Ev Heyvanları Üçün Yeni Nəsil Platforma.
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-ink drop-shadow-sm sm:text-6xl">
            {home.get('hero_title', 'Bir Pati Min Xoşbəxtlik')}
          </h1>

          <HeroSearch categories={categories} />
        </div>
      </section>

      {/* Categories — Avito-style image cards (name left, animal right) */}
      <section className="mt-14">
        <h2 className="mb-5 text-2xl font-extrabold text-ink">Kateqoriyalar</h2>
        {/* Desktop: 7-column grid · Tablet/phone: swipeable carousel */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0 lg:pb-0">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/listings?categoryId=${c.id}`}
              className="group relative aspect-[468/270] min-w-[76%] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#eff0f1] ring-1 ring-cream-200 transition-all hover:-translate-y-1 hover:shadow-soft sm:min-w-[43%] lg:min-w-0 lg:shrink"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/categories/${c.slug}.webp`}
                alt={c.name}
                className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute left-4 top-3.5 lg:left-3 lg:top-3">
                <span className="text-base font-extrabold text-ink lg:text-sm">{c.name}</span>
                <span className="mt-0.5 block text-xs font-semibold text-ink/45">{catCounts[c.id] ?? 0} elan</span>
              </div>
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
