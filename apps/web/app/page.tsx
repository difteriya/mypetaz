import Link from 'next/link';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import {
  getFeaturedListings,
  getLatestListings,
  getCategoriesWithBreeds,
} from '@/lib/listings/data';
import { getBlockMap } from '@/lib/cms/data';
import { imageVariant } from '@/lib/images';
import { ListingCard } from '@/components/listings/listing-card';
import { JsonLd, APP_URL } from '@/components/json-ld';

export default async function HomePage() {
  const [session, featured, latest, categories, home] = await Promise.all([
    auth(),
    getFeaturedListings(),
    getLatestListings(8),
    getCategoriesWithBreeds(),
    getBlockMap('HOME'),
  ]);
  const heroImage = home.get('hero_image');
  const onImage = heroImage.startsWith('/uploads/');

  return (
    <main className="px-4 py-8">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'mypet.az',
          url: APP_URL,
          description: 'Azərbaycanda ev heyvanları üçün portal.',
        }}
      />
      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-[2rem] px-6 py-20 text-center sm:py-24">
        {onImage ? (
          <>
            <img src={imageVariant(heroImage, 'full')} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 to-black/25" />
          </>
        ) : (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-100 via-cream-100 to-teal-50" />
        )}
        <h1 className={`mx-auto max-w-2xl text-4xl font-extrabold sm:text-5xl ${onImage ? 'text-white' : 'text-ink'}`}>
          {home.get('hero_title', 'Sənə yeni dost tapaq')}
        </h1>
        <p className={`mx-auto mt-4 max-w-lg text-lg ${onImage ? 'text-white/90' : 'text-ink/70'}`}>
          {home.get('hero_subtitle', 'Azərbaycanda ev heyvanları üçün hər şey bir yerdə.')}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/listings">
            <Button>Elanlara bax</Button>
          </Link>
          <Link href={session?.user ? '/post-listing' : '/login'}>
            <Button variant="secondary">Elan yerləşdir</Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-extrabold text-ink">Kateqoriyalar</h2>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/listings?categoryId=${c.id}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink/80 ring-1 ring-cream-200 transition-all hover:-translate-y-0.5 hover:text-brand-600 hover:ring-brand-200"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-extrabold text-ink">Seçilmiş Elanlar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-ink">Son Elanlar</h2>
            <Link href="/listings" className="text-sm text-brand-600 hover:underline">
              Hamısı →
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
