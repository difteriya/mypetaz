import Link from 'next/link';
import { Button } from '@mypet/ui';
import {
  getFeaturedListings,
  getLatestListings,
  getCategoriesWithBreeds,
  getPublicCounts,
} from '@/lib/listings/data';
import { getBlockMap } from '@/lib/cms/data';
import { imageVariant } from '@/lib/images';
import { ListingCard } from '@/components/listings/listing-card';
import { JsonLd, APP_URL } from '@/components/json-ld';

const TILE_TONES = [
  'bg-brand-100 text-brand-800',
  'bg-teal-100 text-teal-600',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-lime-100 text-lime-700',
];

export default async function HomePage() {
  const [featured, latest, categories, counts, home] = await Promise.all([
    getFeaturedListings(),
    getLatestListings(8),
    getCategoriesWithBreeds(),
    getPublicCounts(),
    getBlockMap('HOME'),
  ]);
  const heroImage = home.get('hero_image');
  const onImage = heroImage.startsWith('/uploads/');

  return (
    <main className="px-4 py-8">
      <JsonLd
        data={{ '@context': 'https://schema.org', '@type': 'Organization', name: 'mypet.az', url: APP_URL }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-[2.5rem] px-6 py-16 sm:py-24">
        {onImage ? (
          <>
            <img src={imageVariant(heroImage, 'full')} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-black/65 via-black/35 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-100 via-cream-100 to-teal-50" />
            <div className="absolute -right-16 -top-16 -z-10 size-72 rounded-full bg-brand-200/50 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 -z-10 size-72 rounded-full bg-teal-100/60 blur-3xl" />
          </>
        )}

        <div className={`max-w-2xl ${onImage ? 'text-white' : 'text-ink'}`}>
          <span className={`text-sm font-bold uppercase tracking-wider ${onImage ? 'text-white/80' : 'text-brand-600'}`}>
            Azərbaycanın pet portalı
          </span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">
            {home.get('hero_title', 'Sənə yeni dost tapaq')}
          </h1>
          <p className={`mt-4 max-w-lg text-lg ${onImage ? 'text-white/90' : 'text-ink/70'}`}>
            {home.get('hero_subtitle', 'Elanlar, sahiblənmə, baytar və pet bizneslər — hamısı bir yerdə.')}
          </p>

          {/* Search pill */}
          <form
            action="/listings"
            method="get"
            className="mt-7 flex flex-col gap-2 rounded-3xl bg-white p-2 shadow-soft sm:flex-row sm:items-center sm:rounded-full"
          >
            <input
              name="q"
              placeholder="Nə axtarırsınız? (məs. Golden Retriever)"
              className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-ink outline-none"
            />
            <select name="categoryId" defaultValue="" className="rounded-full px-4 py-2.5 text-ink/80 outline-none">
              <option value="">Bütün kateqoriyalar</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button type="submit">Axtar</Button>
          </form>

          {/* Stat strip */}
          <dl className={`mt-6 flex gap-8 text-sm ${onImage ? 'text-white/90' : 'text-ink/70'}`}>
            <div>
              <dt className="text-2xl font-extrabold">{counts.listings}</dt>
              <dd>elan</dd>
            </div>
            <div>
              <dt className="text-2xl font-extrabold">{counts.businesses}</dt>
              <dd>biznes</dd>
            </div>
            <div>
              <dt className="text-2xl font-extrabold">{counts.posts}</dt>
              <dd>bloq yazısı</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-14">
        <h2 className="mb-5 text-2xl font-extrabold text-ink">Kateqoriyalar</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/listings?categoryId=${c.id}`}
              className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl p-4 text-center font-bold transition-all hover:-translate-y-1 hover:shadow-soft ${TILE_TONES[i % TILE_TONES.length]}`}
            >
              <span className="text-lg leading-tight">{c.name}</span>
              <span className="text-xs font-semibold opacity-70">{c.breeds.length} cins</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-extrabold text-ink">✨ Seçilmiş Elanlar</h2>
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
