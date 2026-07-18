import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { getVerifiedVet } from '@/lib/guard';
import { confirmAppointmentAction, rejectAppointmentAction } from '@/lib/actions';
import { StatusPill, fmtTime, fmtDate, EmptyLine } from './ui';

export const metadata: Metadata = { title: 'Günün vərəqi' };

const AZ_DAYS = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];

export default async function DaySheetPage() {
  const ctx = await getVerifiedVet();
  if (!ctx) redirect('/status');
  const { vet } = ctx;

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600_000);
  const weekEnd = new Date(dayStart.getTime() + 8 * 24 * 3600_000);

  const apptInclude = {
    pet: { select: { name: true, breed: { select: { name: true } }, category: { select: { name: true } } } },
    requester: { select: { name: true, email: true } },
  } as const;

  const [requests, proposals, today, upcoming] = await Promise.all([
    // Customer-initiated requests — the doctor decides these.
    prisma.vetAppointment.findMany({
      where: { vetId: vet.id, status: 'REQUEST', createdBy: 'CUSTOMER' },
      orderBy: { date: 'asc' },
      include: apptInclude,
    }),
    // Doctor-sent offers — awaiting the customer's decision.
    prisma.vetAppointment.findMany({
      where: { vetId: vet.id, status: 'REQUEST', createdBy: 'DOCTOR' },
      orderBy: { date: 'asc' },
      include: apptInclude,
    }),
    prisma.vetAppointment.findMany({
      where: { vetId: vet.id, date: { gte: dayStart, lt: dayEnd }, status: { in: ['CONFIRMED', 'COMPLETED'] } },
      orderBy: { date: 'asc' },
      include: apptInclude,
    }),
    prisma.vetAppointment.findMany({
      where: { vetId: vet.id, date: { gte: dayEnd, lt: weekEnd }, status: 'CONFIRMED' },
      orderBy: { date: 'asc' },
      take: 6,
      include: apptInclude,
    }),
  ]);

  return (
    <div className="space-y-10">
      {/* Sheet head: today's date in chart mono + one summary line */}
      <header>
        <p className="font-mono text-sm text-vink/45">{AZ_DAYS[now.getDay()]}</p>
        <h1 className="font-mono text-3xl font-bold tracking-tight text-vink">{fmtDate(now)}</h1>
        <p className="mt-1.5 font-mono text-xs text-vink/50">
          {requests.length} yeni sorğu · {proposals.length} təklif · {today.length} bugün · {upcoming.length} yaxın 7 gün
        </p>
      </header>

      {/* New requests — the only place the coral signal appears */}
      {requests.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-vsignal">Yeni sorğular</h2>
          <ul className="divide-y divide-vline border-y border-vline bg-white">
            {requests.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-l-2 border-vsignal px-4 py-3">
                <span className="font-mono text-sm text-vink/70">
                  {fmtDate(a.date)} {fmtTime(a.date)}
                </span>
                <span className="min-w-0 flex-1">
                  <Link href={`/appointments/${a.id}`} className="font-semibold hover:text-vteal-700">
                    {a.pet.name}
                  </Link>
                  <span className="ml-2 text-sm text-vink/50">
                    {a.pet.breed?.name ?? a.pet.category.name} · {a.requester.name ?? a.requester.email}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <form action={confirmAppointmentAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="rounded-full bg-vteal-500 px-3 py-1 text-xs font-bold text-white hover:bg-vteal-700">
                      Təsdiqlə
                    </button>
                  </form>
                  <form action={rejectAppointmentAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="rounded-full border border-vline px-3 py-1 text-xs font-semibold text-vink/60 hover:border-red-300 hover:text-red-600">
                      Rədd et
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Doctor-sent offers — quiet, awaiting the customer */}
      {proposals.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-vink/40">
            Göndərilmiş təkliflər
          </h2>
          <ul className="divide-y divide-vline border-y border-vline bg-white">
            {proposals.map((a) => (
              <li key={a.id}>
                <Link href={`/appointments/${a.id}`} className="flex items-center gap-4 px-4 py-2.5 hover:bg-vteal-50/50">
                  <span className="w-32 shrink-0 font-mono text-sm text-vink/60">
                    {fmtDate(a.date)} {fmtTime(a.date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="font-semibold">{a.pet.name}</span>
                    <span className="text-vink/50"> · {a.requester.name ?? a.requester.email}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    Müştəri təsdiqi gözlənilir
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Today's sheet — time rail */}
      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-vteal-700">Bugünkü qəbullar</h2>
        {today.length === 0 ? (
          <div className="border-y border-vline bg-white">
            <EmptyLine>
              Bu gün üçün qəbul yoxdur.{' '}
              <Link href="/new" className="font-semibold text-vteal-700 hover:underline">
                Walk-in əlavə et
              </Link>
            </EmptyLine>
          </div>
        ) : (
          <ul className="divide-y divide-vline border-y border-vline bg-white">
            {today.map((a) => (
              <li key={a.id}>
                <Link href={`/appointments/${a.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-vteal-50/50">
                  <span className="relative flex w-14 shrink-0 items-center font-mono text-sm font-bold text-vteal-700">
                    {fmtTime(a.date)}
                  </span>
                  <span aria-hidden className="h-8 w-px shrink-0 bg-vline" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{a.pet.name}</span>
                    <span className="block truncate text-sm text-vink/50">
                      {a.pet.breed?.name ?? a.pet.category.name} · {a.requester.name ?? a.requester.email}
                      {a.note ? ` — ${a.note}` : ''}
                    </span>
                  </span>
                  <StatusPill status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming week — quiet list */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-vink/40">Yaxın günlər</h2>
          <ul className="divide-y divide-vline border-y border-vline bg-white">
            {upcoming.map((a) => (
              <li key={a.id}>
                <Link href={`/appointments/${a.id}`} className="flex items-center gap-4 px-4 py-2.5 hover:bg-vteal-50/50">
                  <span className="w-32 shrink-0 font-mono text-sm text-vink/60">
                    {fmtDate(a.date)} {fmtTime(a.date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="font-semibold">{a.pet.name}</span>
                    <span className="text-vink/50"> · {a.requester.name ?? a.requester.email}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
