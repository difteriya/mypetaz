import Link from 'next/link';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { getFeaturedListings } from '@/lib/listings/data';
import { ListingCard } from '@/components/listings/listing-card';

export default async function HomePage() {
  const [session, featured] = await Promise.all([auth(), getFeaturedListings()]);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-12">
      <section className="flex flex-col items-center gap-6 py-10 text-center">
        <span className="text-5xl">🐾</span>
        <h1 className="text-4xl font-bold text-brand-700">mypet.az</h1>
        <p className="max-w-md text-lg text-brand-900/70">
          Azərbaycanda ev heyvanları üçün &quot;hamısı bir yerdə&quot; portal.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/listings">
            <Button>Elanlara bax</Button>
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
