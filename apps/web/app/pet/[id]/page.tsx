import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { getPetForOwner } from '@/lib/pets/data';
import { deletePetAction } from '@/lib/pets/actions';
import { PassportSection } from './passport-section';
import { HealthSection, type HealthRecordView } from './health-section';
import { PetImages } from './pet-images';
import { TransferForm } from './transfer-form';

const toDateStr = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '');

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

  const passportView = {
    documentNo: pet.passport?.documentNo ?? '',
    issueDate: toDateStr(pet.passport?.issueDate),
    microchipId: pet.passport?.microchipId ?? '',
    birthPlace: pet.passport?.birthPlace ?? '',
    documentImage: pet.passport?.documentImage ?? null,
    documentImageAlt: pet.passport?.documentImageAlt ?? null,
  };

  const healthRecords: HealthRecordView[] = pet.healthRecords.map((r) => ({
    id: r.id,
    type: r.type,
    name: r.name,
    dateStr: toDateStr(r.date),
    nextDateStr: r.nextDate ? toDateStr(r.nextDate) : null,
    note: r.note,
    source: r.source,
    vetLabel: r.vetAppointment?.vet?.clinicName ?? null,
  }));

  const staticFields = (pet.staticFields ?? {}) as Record<string, unknown>;
  const dynamicRows = pet.category.fields
    .map((f) => ({ label: f.label, value: staticFields[f.fieldName], type: f.type }))
    .filter((r) => r.value !== undefined && r.value !== '' && r.value !== null);

  const rows: Array<[string, string]> = [
    ['Kateqoriya', pet.category.name],
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

      <div className="mt-2 flex items-center justify-between gap-2">
        <h1 className="text-3xl font-bold text-brand-700">{pet.name}</h1>
        <Link href={`/pet/${pet.id}/passport`} className="text-sm font-semibold text-brand-600 hover:underline">
          Pasportu paylaş
        </Link>
      </div>

      <div className="mt-4">
        <PetImages
          petId={pet.id}
          images={pet.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))}
        />
      </div>

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

      <div className="mt-4 space-y-4">
        <PassportSection petId={pet.id} passport={passportView} />
        <HealthSection petId={pet.id} records={healthRecords} />
        <TransferForm petId={pet.id} />
      </div>

      <form action={deletePetAction} className="mt-8">
        <input type="hidden" name="petId" value={pet.id} />
        <Button type="submit" variant="secondary">
          Peti sil
        </Button>
      </form>
    </main>
  );
}
