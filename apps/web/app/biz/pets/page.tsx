import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { imageVariant } from '@/lib/images';
import { PawIcon } from '@/components/icons';

export const metadata: Metadata = { title: 'Biznes petləri' };

export default async function BizPetsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const pets = await prisma.pet.findMany({
    where: { ownerId: session.user.id, asBusiness: true },
    orderBy: { createdAt: 'desc' },
    include: {
      breed: { select: { name: true } },
      category: { select: { name: true } },
      images: { orderBy: { order: 'asc' }, take: 1 },
    },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-700">Biznes petləri</h1>
        <Link
          href="/pets/new?ctx=biz"
          className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600"
        >
          + Yeni pet
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-200 bg-white p-10 text-center text-brand-900/60">
          <PawIcon className="mx-auto mb-2 size-10 text-brand-200" />
          <p>Biznes adından hələ pet yoxdur.</p>
          <Link href="/pets/new?ctx=biz" className="mt-2 inline-block font-semibold text-teal-600 hover:underline">
            İlk peti əlavə et →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {pets.map((pet) => {
            const cover = pet.images[0];
            return (
              <Link
                key={pet.id}
                href={`/pet/${pet.slug ?? pet.id}`}
                className="overflow-hidden rounded-card border border-cream-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="aspect-square bg-cream-100">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageVariant(cover.url, 'card')} alt={cover.alt} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <PawIcon className="size-10 text-brand-200" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-semibold text-ink">{pet.name}</p>
                  <p className="truncate text-xs text-ink/50">{pet.breed?.name ?? pet.category.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
