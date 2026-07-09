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
      {/* Hero */}
      <section className="relative flex flex-col items-center gap-5 overflow-hidden rounded-card py-16 text-center">
        {onImage && (
          <>
            <img src={imageVariant(heroImage, 'full')} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-black/40" />
          </>
        )}
        <span className="text-5xl">🐾</span>
        <h1 className={`text-4xl font-bold ${onImage ? 'text-white' : 'text-brand-700'}`}>
          {home.get('hero_title', 'mypet.az')}
        </h1>
        <p className={`max-w-md text-lg ${onImage ? 'text-white/90' : 'text-brand-900/70'}`}>
          {home.get('hero_subtitle', 'Azərbaycanda ev heyvanları üçün "hamısı bir yerdə" portal.')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/listings">
            <Button>Elanlara bax</Button>
          </Link>
          <Link href={session?.user ? '/post-listing' : '/login'}>
            <Button variant="secondary">Elan yerləşdir</Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-brand-700">Kateqoriyalar</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/listings?categoryId=${c.id}`}
              className="flex flex-col items-center gap-1 rounded-card border border-cream-200 bg-white p-3 text-center transition-colors hover:border-brand-300"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-xs">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-brand-700">Seçilmiş Elanlar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-700">Son Elanlar</h2>
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
