import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { listMyPets, getMyTransfersArchive } from '@/lib/pets/data';
import { imageVariant } from '@/lib/images';
import { PawIcon } from '@/components/icons';

export const metadata: Metadata = { title: 'Mənim petlərim' };

export default async function MyPetsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [pets, archive] = await Promise.all([
    listMyPets(session.user.id),
    getMyTransfersArchive(session.user.id),
  ]);

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
          <PawIcon className="mx-auto size-10 text-brand-200" />
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
                    <div className="flex size-full items-center justify-center">
                      <PawIcon className="size-10 text-brand-200" />
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

      {archive.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-brand-900/70">Köçürülmüş petlər</h2>
          <ul className="space-y-2">
            {archive.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-card border border-cream-200 bg-white/60 p-3 text-sm text-brand-900/60"
              >
                <span className="font-medium">{t.pet.name}</span>
                <span>·</span>
                <span>Köçürülüb: {t.newOwner.name ?? t.newOwner.email}</span>
                <span className="ml-auto text-xs">{t.createdAt.toISOString().slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
