import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { getPetForOwner } from '@/lib/pets/data';
import { imageVariant } from '@/lib/images';
import { deletePetAction } from '@/lib/pets/actions';

const SEX_LABEL: Record<string, string> = {
  MALE: 'Erkək',
  FEMALE: 'Dişi',
  UNKNOWN: 'Bilinmir',
};

export const metadata: Metadata = { title: 'Pet profili' };

export default async function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const pet = await getPetForOwner(id, session.user.id);
  if (!pet) notFound();

  const staticFields = (pet.staticFields ?? {}) as Record<string, unknown>;
  const dynamicRows = pet.category.fields
    .map((f) => ({ label: f.label, value: staticFields[f.fieldName], type: f.type }))
    .filter((r) => r.value !== undefined && r.value !== '' && r.value !== null);

  const rows: Array<[string, string]> = [
    ['Kateqoriya', `${pet.category.emoji ?? ''} ${pet.category.name}`.trim()],
    ['Cins/növ', pet.breed?.name ?? pet.breedFreeText ?? '—'],
    ['Cinsiyyət', SEX_LABEL[pet.sex] ?? pet.sex],
    ...(pet.birthDate
      ? ([
          [
            'Doğum tarixi',
            `${pet.birthDate.toISOString().slice(0, 10)}${pet.birthApprox ? ' (təxmini)' : ''}`,
          ],
        ] as Array<[string, string]>)
      : []),
    ...(pet.color ? ([['Rəng', pet.color]] as Array<[string, string]>) : []),
    ...(pet.weight != null ? ([['Çəki', `${pet.weight} kq`]] as Array<[string, string]>) : []),
    ...(pet.microchipNo ? ([['Mikroçip', pet.microchipNo]] as Array<[string, string]>) : []),
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/pets" className="text-sm text-brand-600 hover:underline">
        ← Mənim petlərim
      </Link>

      <h1 className="mt-2 text-3xl font-bold text-brand-700">{pet.name}</h1>

      {pet.images.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {pet.images.map((img) => (
            <img
              key={img.id}
              src={imageVariant(img.url, 'detail')}
              alt={img.alt}
              className="aspect-square w-full rounded-card object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex aspect-video items-center justify-center rounded-card bg-cream-100 text-6xl">
          {pet.category.emoji}
        </div>
      )}

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-card bg-white p-5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-brand-900/50">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        {dynamicRows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-brand-900/50">{r.label}</dt>
            <dd>{r.type === 'BOOL' ? (r.value ? 'Bəli' : 'Xeyr') : String(r.value)}</dd>
          </div>
        ))}
      </dl>

      {pet.description && (
        <p className="mt-4 whitespace-pre-line rounded-card bg-white p-5 text-sm">{pet.description}</p>
      )}

      <form action={deletePetAction} className="mt-8">
        <input type="hidden" name="petId" value={pet.id} />
        <Button type="submit" variant="secondary">
          Peti sil
        </Button>
      </form>
    </main>
  );
}
