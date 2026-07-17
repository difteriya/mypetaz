import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getMyPetsForListing, getCitiesList } from '@/lib/listings/data';
import { getCategoriesForForm } from '@/lib/pets/data';
import { PostListingForm } from './post-listing-form';

export const metadata: Metadata = { title: 'Elan yerləşdir' };

export default async function PostListingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [pets, cities, categories] = await Promise.all([
    getMyPetsForListing(session.user.id),
    getCitiesList(),
    getCategoriesForForm(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Elan yerləşdir</h1>
      <PostListingForm pets={pets} cities={cities} categories={categories} />
    </main>
  );
}
