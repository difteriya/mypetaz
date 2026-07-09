import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { listMyPets } from '@/lib/pets/data';
import { imageVariant } from '@/lib/images';

export const metadata: Metadata = { title: 'Mənim petlərim' };

export default async function MyPetsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const pets = await listMyPets(session.user.id);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-700">Mənim petlərim</h1>
        <Link href="/pets/new">
          <Button>+ Yeni pet</Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-200 bg-white p-10 text-center text-brand-900/60">
          <p className="text-3xl">🐾</p>
          <p className="mt-2">Hələ heç bir petiniz yoxdur.</p>
          <Link href="/pets/new" className="mt-3 inline-block font-semibold text-brand-600 hover:underline">
            İlk petinizi əlavə edin
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {pets.map((pet) => {
            const cover = pet.images[0];
            return (
              <Link
                key={pet.id}
                href={`/pet/${pet.id}`}
                className="overflow-hidden rounded-card border border-cream-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="aspect-square bg-cream-100">
                  {cover ? (
                    <img
                      src={imageVariant(cover.url, 'card')}
                      alt={cover.alt}
                      width={400}
                      height={400}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-4xl">
                      {pet.category.emoji}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-semibold">{pet.name}</p>
                  <p className="truncate text-sm text-brand-900/60">
                    {pet.breed?.name ?? pet.breedFreeText ?? pet.category.name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
