import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@mypet/db';
import { parseBusinessHours, isOpenNow } from '@/lib/business/hours';

export const metadata: Metadata = {
  title: 'Baytarlar',
  description: 'Azərbaycanda baytar həkimləri və klinikalar — onlayn təyinat alın.',
};

export default async function VetsPage() {
  const vets = await prisma.vetProfile.findMany({
    where: { verified: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      clinicName: true,
      specialty: true,
      address: true,
      businessHours: true,
      _count: { select: { appointments: { where: { status: 'COMPLETED' } } } },
    },
  });

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <h1 className="text-2xl font-extrabold text-ink">Baytarlar</h1>
      <p className="mt-1 text-sm text-ink/55">
        Təsdiqlənmiş baytar həkimləri. Petiniz üçün onlayn təyinat sorğusu göndərin.
      </p>

      {vets.length === 0 ? (
        <p className="mt-10 text-center text-ink/50">Hələ təsdiqlənmiş baytar yoxdur.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vets.map((v) => {
            const { open } = isOpenNow(parseBusinessHours(v.businessHours));
            return (
              <Link
                key={v.id}
                href={`/vets/${v.id}`}
                className="rounded-card border border-cream-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-ink">{v.clinicName}</h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      open ? 'bg-teal-600 text-white' : 'bg-ink/10 text-ink/70'
                    }`}
                  >
                    {open ? 'Açıqdır' : 'Bağlıdır'}
                  </span>
                </div>
                {v.specialty && <p className="mt-1 text-sm font-semibold text-teal-700">{v.specialty}</p>}
                {v.address && <p className="mt-1 text-sm text-ink/70">{v.address}</p>}
                <p className="mt-3 text-xs font-medium text-ink/55">{v._count.appointments} tamamlanmış qəbul</p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
