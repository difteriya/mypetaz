import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { getPetForOwner, getPetForTreatingVet } from '@/lib/pets/data';
import { deletePetAction } from '@/lib/pets/actions';
import { PassportSection } from './passport-section';
import { HealthSection, type HealthRecordView } from './health-section';
import { healthSourceLabel } from '@/lib/pets/health-label';
import { PetImages } from './pet-images';
import { TransferForm } from './transfer-form';
import { imageVariant } from '@/lib/images';
import { VET_APP_URL } from '@/lib/vet/urls';

const HEALTH_TYPE_LABEL: Record<string, string> = {
  VACCINE: 'Peyvənd',
  EXAM: 'Müayinə',
  SURGERY: 'Əməliyyat',
};

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
  // Owner sees the full editable profile; a treating vet sees it read-only (§7.4).
  let pet = await getPetForOwner(id, session.user.id);
  const readOnly = !pet;
  if (!pet) pet = await getPetForTreatingVet(id, session.user.id);
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
    byLabel: healthSourceLabel({
      source: r.source,
      ownerId: pet.ownerId,
      addedById: r.addedById,
      addedByName: r.addedBy?.name,
      vetName: r.vetAppointment?.vet?.clinicName,
    }),
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
      {readOnly ? (
        <a href={VET_APP_URL} className="text-sm text-brand-600 hover:underline">
          ← Vet panelə qayıt
        </a>
      ) : (
        <Link href="/pets" className="text-sm text-brand-600 hover:underline">
          ← Mənim petlərim
        </Link>
      )}

      {readOnly && (
        <p className="mt-3 rounded-card bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700">
          Baytar görünüşü — bu profil yalnız oxunmaq üçündür.
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <h1 className="text-3xl font-bold text-brand-700">{pet.name}</h1>
        {!readOnly && (
          <Link href={`/pet/${pet.slug ?? pet.id}/passport`} className="text-sm font-semibold text-brand-600 hover:underline">
            Pasportu paylaş
          </Link>
        )}
      </div>

      <div className="mt-4">
        {readOnly ? (
          pet.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pet.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={imageVariant(img.url, 'card')}
                  alt={img.alt}
                  className="aspect-square w-full rounded-card object-cover"
                />
              ))}
            </div>
          )
        ) : (
          <PetImages
            petId={pet.id}
            images={pet.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))}
          />
        )}
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

      {readOnly ? (
        <div className="mt-6 space-y-4">
          {/* Passport (read-only) */}
          {(passportView.documentNo ||
            passportView.microchipId ||
            passportView.issueDate ||
            passportView.birthPlace ||
            passportView.documentImage) && (
            <section className="rounded-card bg-white p-5">
              <h2 className="mb-3 text-lg font-bold text-brand-700">Pasport</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                {passportView.documentNo && (
                  <div className="contents">
                    <dt className="text-brand-900/50">Sənəd №</dt>
                    <dd>{passportView.documentNo}</dd>
                  </div>
                )}
                {passportView.issueDate && (
                  <div className="contents">
                    <dt className="text-brand-900/50">Verilmə tarixi</dt>
                    <dd>{passportView.issueDate}</dd>
                  </div>
                )}
                {passportView.microchipId && (
                  <div className="contents">
                    <dt className="text-brand-900/50">Mikroçip</dt>
                    <dd>{passportView.microchipId}</dd>
                  </div>
                )}
                {passportView.birthPlace && (
                  <div className="contents">
                    <dt className="text-brand-900/50">Doğulduğu yer</dt>
                    <dd>{passportView.birthPlace}</dd>
                  </div>
                )}
              </dl>
              {passportView.documentImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageVariant(passportView.documentImage, 'detail')}
                  alt={passportView.documentImageAlt ?? 'Pasport sənədi'}
                  className="mt-3 w-full max-w-sm rounded-card"
                />
              )}
            </section>
          )}

          {/* Health history (read-only) */}
          <section className="rounded-card bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-brand-700">Sağlamlıq tarixçəsi</h2>
            {healthRecords.length === 0 ? (
              <p className="text-sm text-brand-900/50">Qeyd yoxdur.</p>
            ) : (
              <ul className="divide-y divide-cream-100">
                {healthRecords.map((r) => (
                  <li key={r.id} className="flex items-start gap-4 py-2.5 text-sm">
                    <span className="w-24 shrink-0 text-brand-900/50">{r.dateStr}</span>
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold">{HEALTH_TYPE_LABEL[r.type] ?? r.type}</span> — {r.name}
                      {r.note && <span className="block text-brand-900/60">{r.note}</span>}
                      <span className="mt-0.5 block text-xs text-brand-900/40">{r.byLabel}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <>
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
        </>
      )}
    </main>
  );
}
