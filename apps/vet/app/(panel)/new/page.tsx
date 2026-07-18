import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { getVerifiedVet } from '@/lib/guard';
import { WalkInForm } from './walk-in-form';

export const metadata: Metadata = { title: 'Walk-in təyinat' };

const inputClass =
  'w-full rounded-lg border border-vline bg-white px-3 py-2 text-sm outline-none focus:border-vteal-500';

/** Doctor books directly for a walk-in / phone customer (createdBy DOCTOR, §7.2).
 * Two steps on one page: find the owner by email, then pick the pet + time. */
export default async function WalkInPage({
  searchParams,
}: {
  searchParams: Promise<{ owner?: string }>;
}) {
  const ctx = await getVerifiedVet();
  if (!ctx) redirect('/status');

  const { owner } = await searchParams;
  const ownerEmail = (owner ?? '').trim().toLowerCase();

  const ownerUser = ownerEmail
    ? await prisma.user.findUnique({
        where: { email: ownerEmail },
        select: {
          name: true,
          email: true,
          pets: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              breed: { select: { name: true } },
              category: { select: { name: true } },
            },
          },
        },
      })
    : null;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-2xl font-extrabold">Walk-in təyinat</h1>
      <p className="mb-6 text-sm text-vink/55">
        Zənglə və ya birbaşa gələn müştəri üçün təyinatı özünüz yaradın. Sahibin mypet.az hesabı
        olmalıdır — petlər oradan seçilir.
      </p>

      {/* Step 1 — find the owner */}
      <form method="get" className="mb-6 space-y-1">
        <label htmlFor="owner" className="text-sm font-semibold">Sahibin e-poçtu</label>
        <div className="flex gap-2">
          <input
            id="owner"
            name="owner"
            type="email"
            required
            defaultValue={ownerEmail}
            placeholder="sahib@email.az"
            className={inputClass}
          />
          <button className="shrink-0 rounded-full border border-vteal-500 px-4 py-2 text-sm font-bold text-vteal-700 hover:bg-vteal-50">
            Axtar
          </button>
        </div>
      </form>

      {/* Step 2 — pick pet + time */}
      {ownerEmail &&
        (ownerUser ? (
          ownerUser.pets.length > 0 ? (
            <div className="border-y border-vline bg-white p-5">
              <p className="mb-3 text-sm text-vink/60">
                Sahib: <b className="text-vink">{ownerUser.name ?? ownerUser.email}</b>
              </p>
              <WalkInForm
                pets={ownerUser.pets.map((p) => ({
                  id: p.id,
                  name: p.name,
                  breedName: p.breed?.name ?? null,
                  categoryName: p.category.name,
                }))}
              />
            </div>
          ) : (
            <p className="border-y border-vline bg-white py-6 text-center text-sm text-vink/50">
              Bu hesabda aktiv pet yoxdur. Sahib əvvəlcə mypet.az-da pet profili yaratmalıdır.
            </p>
          )
        ) : (
          <p className="border-y border-vline bg-white py-6 text-center text-sm text-vink/50">
            Bu e-poçtla hesab tapılmadı.
          </p>
        ))}
    </div>
  );
}
