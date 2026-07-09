import Link from 'next/link';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { getFeaturedListings } from '@/lib/listings/data';
import { getBlockMap } from '@/lib/cms/data';
import { imageVariant } from '@/lib/images';
import { ListingCard } from '@/components/listings/listing-card';

export default async function HomePage() {
  const [session, featured, home] = await Promise.all([
    auth(),
    getFeaturedListings(),
    getBlockMap('HOME'),
  ]);
  const heroImage = home.get('hero_image');

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-12">
      <section className="relative flex flex-col items-center gap-6 overflow-hidden rounded-card py-16 text-center">
        {heroImage.startsWith('/uploads/') && (
          <>
            <img src={imageVariant(heroImage, 'full')} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-black/40" />
          </>
        )}
        <span className="text-5xl">🐾</span>
        <h1 className={`text-4xl font-bold ${heroImage.startsWith('/uploads/') ? 'text-white' : 'text-brand-700'}`}>
          {home.get('hero_title', 'mypet.az')}
        </h1>
        <p className={`max-w-md text-lg ${heroImage.startsWith('/uploads/') ? 'text-white/90' : 'text-brand-900/70'}`}>
          {home.get('hero_subtitle', 'Azərbaycanda ev heyvanları üçün "hamısı bir yerdə" portal.')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/listings">
            <Button>Elanlara bax</Button>
          </Link>
          <Link href="/businesses">
            <Button variant="secondary">Bizneslər</Button>
          </Link>
          <Link href="/blog">
            <Button variant="secondary">Bloq</Button>
          </Link>
          {session?.user ? (
            <Link href="/dashboard">
              <Button variant="secondary">İdarə paneli</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="secondary">Daxil ol</Button>
            </Link>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-4 text-xl font-bold text-brand-700">Seçilmiş Elanlar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
