import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getPetForOwner } from '@/lib/pets/data';
import { getShareLinksForPet } from '@/lib/passport/data';
import { ShareManager } from './share-manager';

export const metadata: Metadata = { title: 'Pasportu paylaş' };

export default async function PassportSharePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const pet = await getPetForOwner(id, session.user.id);
  if (!pet) notFound();

  const links = await getShareLinksForPet(pet.id, session.user.id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/pet/${pet.id}`} className="text-sm text-brand-600 hover:underline">
        ← {pet.name}
      </Link>
      <h1 className="mb-2 mt-2 text-2xl font-bold text-brand-700">Pasportu paylaş</h1>
      <p className="mb-6 text-sm text-brand-900/60">
        Petinizin məlumatlarını xarici link və ya PDF olaraq paylaşın. Linki istənilən vaxt
        deaktiv edə bilərsiniz.
      </p>
      <ShareManager
        petId={pet.id}
        links={links.map((l) => ({
          id: l.id,
          token: l.token,
          active: l.active,
          sharedFields: (l.sharedFields ?? {}) as {
            basicInfo?: boolean;
            passport?: boolean;
            medicalHistory?: boolean;
          },
        }))}
      />
    </main>
  );
}
