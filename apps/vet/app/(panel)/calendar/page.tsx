import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { getVerifiedVet } from '@/lib/guard';
import { fmtTime } from '../ui';

export const metadata: Metadata = { title: 'Təqvim' };

const AZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];
const AZ_DAYS_SHORT = ['B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən', 'Baz'];

const DOT: Record<string, string> = {
  REQUEST: 'bg-vsignal',
  CONFIRMED: 'bg-vteal-500',
  COMPLETED: 'bg-vink/30',
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const ctx = await getVerifiedVet();
  if (!ctx) redirect('/status');

  const { m } = await searchParams;
  const offset = Number.parseInt(m ?? '0', 10) || 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  // Grid starts on the Monday of the first week and always spans 6 rows (42 cells).
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 6) % 7));
  const todayKey = now.toDateString();

  const appointments = await prisma.vetAppointment.findMany({
    where: {
      vetId: ctx.vet.id,
      date: { gte: gridStart, lt: new Date(gridStart.getTime() + 42 * 24 * 3600_000) },
      status: { not: 'REJECTED' },
    },
    orderBy: { date: 'asc' },
    include: { pet: { select: { name: true } } },
  });

  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(gridStart.getTime() + i * 24 * 3600_000);
    return {
      day,
      inMonth: day >= monthStart && day < monthEnd,
      isToday: day.toDateString() === todayKey,
      items: appointments.filter((a) => a.date.toDateString() === day.toDateString()),
    };
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Təqvim</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?m=${offset - 1}`}
            className="grid size-8 place-items-center rounded-full border border-vline hover:bg-vteal-50"
            aria-label="Əvvəlki ay"
          >
            ‹
          </Link>
          <span className="min-w-36 text-center font-mono text-sm font-bold text-vink">
            {AZ_MONTHS[monthStart.getMonth()]} {monthStart.getFullYear()}
          </span>
          <Link
            href={`/calendar?m=${offset + 1}`}
            className="grid size-8 place-items-center rounded-full border border-vline hover:bg-vteal-50"
            aria-label="Növbəti ay"
          >
            ›
          </Link>
          {offset !== 0 && (
            <Link href="/calendar" className="text-xs font-semibold text-vteal-700 hover:underline">
              Bu ay
            </Link>
          )}
        </div>
      </div>

      {/* Weekday header (desktop) */}
      <div className="hidden grid-cols-7 gap-px sm:grid">
        {AZ_DAYS_SHORT.map((d) => (
          <div key={d} className="px-2 py-1.5 text-center font-mono text-xs font-bold text-vink/45">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-px border border-vline bg-vline sm:grid-cols-7">
        {cells.map(({ day, inMonth, isToday, items }) => (
          <div
            key={day.toISOString()}
            className={`min-h-24 p-1.5 ${inMonth ? 'bg-white' : 'hidden bg-vpaper sm:block'} ${isToday ? '!bg-vteal-50' : ''}`}
          >
            <p
              className={`mb-1 font-mono text-xs ${
                isToday
                  ? 'font-bold text-vteal-700'
                  : inMonth
                    ? 'text-vink/60'
                    : 'text-vink/25'
              }`}
            >
              <span className="sm:hidden">{AZ_DAYS_SHORT[(day.getDay() + 6) % 7]} </span>
              {String(day.getDate()).padStart(2, '0')}
            </p>
            <ul className="space-y-0.5">
              {items.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/appointments/${a.id}`}
                    className="flex items-center gap-1 rounded px-1 py-0.5 text-[11px] leading-4 hover:bg-vteal-50"
                    title={`${fmtTime(a.date)} ${a.pet.name}`}
                  >
                    <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${DOT[a.status] ?? 'bg-vink/30'}`} />
                    <span className="font-mono text-vink/60">{fmtTime(a.date)}</span>
                    <span className="truncate font-semibold">{a.pet.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-3 flex flex-wrap gap-4 font-mono text-[11px] text-vink/45">
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-vsignal" /> sorğu</span>
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-vteal-500" /> təsdiqli</span>
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-vink/30" /> bitib</span>
      </p>
    </div>
  );
}
