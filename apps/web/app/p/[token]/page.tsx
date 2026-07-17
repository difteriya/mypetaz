import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSharedByToken, bumpShareView, type SharedFields } from '@/lib/passport/data';
import { imageVariant } from '@/lib/images';
import { healthSourceLabel } from '@/lib/pets/health-label';

const SEX_LABEL: Record<string, string> = { MALE: 'Erkək', FEMALE: 'Dişi', UNKNOWN: 'Bilinmir' };
const HEALTH_LABEL: Record<string, string> = { VACCINE: 'Peyvənd', EXAM: 'Müayinə', SURGERY: 'Əməliyyat' };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const shared = await getSharedByToken(token);
  if (!shared) return { title: 'Pasport tapılmadı' };
  const cover = shared.pet.images[0];
  return {
    title: `${shared.pet.name} — Pet Pasportu`,
    description: `${shared.pet.name}${shared.pet.breed ? `, ${shared.pet.breed.name}` : ''}`,
    openGraph: {
      title: `${shared.pet.name} — mypet.az`,
      images: cover ? [{ url: imageVariant(cover.url, 'detail') }] : undefined,
    },
  };
}

export default async function SharedPassportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shared = await getSharedByToken(token);
  if (!shared) notFound();

  await bumpShareView(token);
  const { pet } = shared;
  const fields = (shared.sharedFields ?? {}) as unknown as SharedFields;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-card bg-white p-6 shadow-sm">
        <p className="text-xs text-brand-900/40">mypet.az — Pet Pasportu</p>
        <h1 className="mt-1 text-3xl font-bold text-brand-700">{pet.name}</h1>

        {/* Pet photo always shown on the passport when available. */}
        {pet.images.length > 0 && (
          <img
            src={imageVariant(pet.images[0]!.url, 'detail')}
            alt={pet.images[0]!.alt}
            className="mt-4 aspect-video w-full rounded-card object-cover"
          />
        )}

        {fields.basicInfo && (
          <>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-brand-900/50">Kateqoriya</dt>
              <dd>{pet.category.name}</dd>
              <dt className="text-brand-900/50">Cins/növ</dt>
              <dd>{pet.breed?.name ?? pet.breedFreeText ?? '—'}</dd>
              <dt className="text-brand-900/50">Cinsiyyət</dt>
              <dd>{SEX_LABEL[pet.sex] ?? pet.sex}</dd>
              {pet.birthDate && (
                <>
                  <dt className="text-brand-900/50">Doğum tarixi</dt>
                  <dd>{pet.birthDate.toISOString().slice(0, 10)}</dd>
                </>
              )}
              {pet.color && (
                <>
                  <dt className="text-brand-900/50">Rəng</dt>
                  <dd>{pet.color}</dd>
                </>
              )}
            </dl>
          </>
        )}

        {fields.passport && pet.passport && (
          <section className="mt-6">
            <h2 className="font-semibold text-brand-700">Pasport</h2>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {pet.passport.documentNo && (
                <>
                  <dt className="text-brand-900/50">Sənəd №</dt>
                  <dd>{pet.passport.documentNo}</dd>
                </>
              )}
              {pet.passport.microchipId && (
                <>
                  <dt className="text-brand-900/50">Mikroçip</dt>
                  <dd>{pet.passport.microchipId}</dd>
                </>
              )}
              {pet.passport.birthPlace && (
                <>
                  <dt className="text-brand-900/50">Doğulduğu yer</dt>
                  <dd>{pet.passport.birthPlace}</dd>
                </>
              )}
            </dl>
          </section>
        )}

        {fields.medicalHistory && pet.healthRecords.length > 0 && (
          <section className="mt-6">
            <h2 className="font-semibold text-brand-700">Tibbi tarixçə</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {pet.healthRecords.map((r) => (
                <li key={r.id}>
                  <span className="text-brand-900/50">{r.date.toISOString().slice(0, 10)}</span> ·{' '}
                  {HEALTH_LABEL[r.type] ?? r.type} · {r.name}{' '}
                  <span className="text-brand-900/40">
                    (
                    {healthSourceLabel({
                      source: r.source,
                      ownerId: pet.ownerId,
                      addedById: r.addedById,
                      addedByName: r.addedBy?.name,
                      vetName: r.vetAppointment?.vet?.clinicName,
                    })}
                    )
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 flex flex-wrap gap-4 border-t border-cream-200 pt-4">
          <a href={`/p/${token}/pdf`} className="text-sm font-semibold text-brand-600 hover:underline">
            Böyük PDF yüklə
          </a>
          <a href={`/p/${token}/mini`} className="text-sm font-semibold text-brand-600 hover:underline">
            Mini pasport (kart)
          </a>
        </div>
      </div>
    </main>
  );
}
