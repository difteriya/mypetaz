import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { getVerifiedVet } from '@/lib/guard';
import { StatusPill, fmtTime, fmtDate, EmptyLine } from '../ui';

export const metadata: Metadata = { title: 'Təyinatlar' };

export default async function AppointmentsPage() {
  const ctx = await getVerifiedVet();
  if (!ctx) redirect('/status');

  const appointments = await prisma.vetAppointment.findMany({
    where: { vetId: ctx.vet.id },
    orderBy: { date: 'desc' },
    take: 100,
    include: {
      pet: { select: { name: true, breed: { select: { name: true } }, category: { select: { name: true } } } },
      requester: { select: { name: true, email: true } },
      visitRecord: { select: { approved: true } },
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Təyinatlar</h1>
        <Link href="/new" className="rounded-full bg-vteal-500 px-4 py-2 text-sm font-bold text-white hover:bg-vteal-700">
          + Walk-in
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="border-y border-vline bg-white">
          <EmptyLine>Hələ təyinat yoxdur. Walk-in yaradın və ya müştəri sorğusunu gözləyin.</EmptyLine>
        </div>
      ) : (
        <ul className="divide-y divide-vline border-y border-vline bg-white">
          {appointments.map((a) => (
            <li key={a.id}>
              <Link href={`/appointments/${a.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-vteal-50/50">
                <span className="w-32 shrink-0 font-mono text-sm text-vink/70">
                  {fmtDate(a.date)} {fmtTime(a.date)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{a.pet.name}</span>
                  <span className="block truncate text-sm text-vink/50">
                    {a.pet.breed?.name ?? a.pet.category.name} · {a.requester.name ?? a.requester.email}
                    {a.createdBy === 'DOCTOR' ? ' · walk-in' : ''}
                  </span>
                </span>
                {a.status === 'COMPLETED' && a.visitRecord && !a.visitRecord.approved && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    Qeyd təsdiqsiz
                  </span>
                )}
                <StatusPill status={a.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
