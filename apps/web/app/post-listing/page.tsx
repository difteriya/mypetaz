import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getMyPetsForListing, getCitiesList } from '@/lib/listings/data';
import { PostListingForm } from './post-listing-form';

export const metadata: Metadata = { title: 'Elan yerləşdir' };

export default async function PostListingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [pets, cities] = await Promise.all([getMyPetsForListing(session.user.id), getCitiesList()]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Elan yerləşdir</h1>

      {pets.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-200 bg-white p-8 text-center text-brand-900/60">
          <p>Elan yerləşdirmək üçün əvvəlcə pet profili yaratmalısınız.</p>
          <Link href="/pets/new" className="mt-3 inline-block font-semibold text-brand-600 hover:underline">
            Pet əlavə et
          </Link>
        </div>
      ) : (
        <PostListingForm pets={pets} cities={cities} />
      )}
    </main>
  );
}
