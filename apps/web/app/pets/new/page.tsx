import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getCategoriesForForm } from '@/lib/pets/data';
import { PetCreateForm } from './pet-create-form';

export const metadata: Metadata = { title: 'Yeni pet' };

export default async function NewPetPage({
  searchParams,
}: {
  searchParams: Promise<{ ctx?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { ctx } = await searchParams;
  const asBusiness = ctx === 'biz';
  const categories = await getCategoriesForForm();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">
        Yeni pet əlavə et{asBusiness ? ' (biznes adından)' : ''}
      </h1>
      <PetCreateForm categories={categories} asBusiness={asBusiness} />
    </main>
  );
}
