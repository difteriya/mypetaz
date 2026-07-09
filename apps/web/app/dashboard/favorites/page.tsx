import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { listFavorites } from '@/lib/favorites/data';
import { ListingCard } from '@/components/listings/listing-card';

export const metadata: Metadata = { title: 'Seçilmişlər' };

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const favorites = await listFavorites(session.user.id);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Seçilmişlər</h1>
      {favorites.length === 0 ? (
        <p className="text-brand-900/50">Hələ seçilmiş elan yoxdur.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favorites.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
