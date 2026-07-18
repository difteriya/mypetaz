import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { parseBusinessHours, isOpenNow, DAYS, type DayKey } from '@/lib/business/hours';
import { RequestForm } from './request-form';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vet = await prisma.vetProfile.findFirst({ where: { id, verified: true }, select: { clinicName: true } });
  return { title: vet ? `${vet.clinicName} — Baytar` : 'Baytar tapılmadı' };
}

const DAY_INDEX: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default async function VetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vet, session] = await Promise.all([
    prisma.vetProfile.findFirst({
      where: { id, verified: true },
      include: { _count: { select: { appointments: { where: { status: 'COMPLETED' } } } } },
    }),
    auth(),
  ]);
  if (!vet) notFound();

  const hours = parseBusinessHours(vet.businessHours);
  const { open } = isOpenNow(hours);
  const todayKey = DAY_INDEX[new Date().getDay()];
  const memberSince = vet.createdAt.getFullYear();

  const pets = session?.user
    ? await prisma.pet.findMany({
        where: { ownerId: session.user.id, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, breed: { select: { name: true } }, category: { select: { name: true } } },
      })
    : [];

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <nav className="mb-4 text-sm text-ink/60">
        <Link href="/vets" className="hover:underline">Baytarlar</Link> ›{' '}
        <span className="text-ink">{vet.clinicName}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* Hero */}
          <div className="overflow-hidden rounded-card bg-white ring-1 ring-cream-200">
            <div className="border-b-4 border-teal-500 bg-teal-50 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-extrabold text-ink">{vet.clinicName}</h1>
                  {vet.specialty && <p className="mt-1 text-base font-semibold text-teal-700">{vet.specialty}</p>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold ${
                    open ? 'bg-teal-600 text-white' : 'bg-ink/10 text-ink/70'
                  }`}
                >
                  {open ? 'İndi açıqdır' : 'Bağlıdır'}
                </span>
              </div>
            </div>

            <div className="grid gap-x-8 gap-y-2 px-6 py-5 text-[15px] sm:grid-cols-2">
              {vet.phone && (
                <p>
                  <span className="text-ink/60">Telefon: </span>
                  <a href={`tel:${vet.phone.replace(/\s/g, '')}`} className="font-bold text-teal-700 hover:underline">
                    {vet.phone}
                  </a>
                </p>
              )}
              {vet.address && (
                <p>
                  <span className="text-ink/60">Ünvan: </span>
                  <span className="font-semibold text-ink">{vet.address}</span>
                </p>
              )}
              {vet.licenseNo && (
                <p>
                  <span className="text-ink/60">Lisenziya: </span>
                  <span className="font-semibold text-ink">{vet.licenseNo}</span>
                </p>
              )}
              <p>
                <span className="text-ink/60">Platformada: </span>
                <span className="font-semibold text-ink">{memberSince}-dən</span>
                <span className="text-ink/60"> · </span>
                <span className="font-semibold text-ink">{vet._count.appointments}</span>
                <span className="text-ink/60"> tamamlanmış qəbul</span>
              </p>
            </div>
          </div>

          {/* About */}
          {vet.about && (
            <section className="rounded-card bg-white p-6 ring-1 ring-cream-200">
              <h2 className="mb-2 text-lg font-bold text-ink">Haqqında</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/80">{vet.about}</p>
            </section>
          )}

          {/* Hours — always visible, today highlighted */}
          <section className="rounded-card bg-white p-6 ring-1 ring-cream-200">
            <h2 className="mb-3 text-lg font-bold text-ink">İş saatları</h2>
            <ul className="divide-y divide-cream-100">
              {DAYS.map(({ key, label }) => {
                const d = hours[key];
                const isToday = key === todayKey;
                return (
                  <li
                    key={key}
                    className={`flex items-center justify-between py-2 text-[15px] ${
                      isToday ? '-mx-3 rounded-lg bg-teal-50 px-3 font-bold' : ''
                    }`}
                  >
                    <span className={isToday ? 'text-teal-700' : 'text-ink/80'}>
                      {label}
                      {isToday && <span className="ml-2 text-xs font-bold text-teal-600">bu gün</span>}
                    </span>
                    <span className={d?.open && d?.close ? 'font-semibold text-ink' : 'text-ink/45'}>
                      {d?.open && d?.close ? `${d.open} – ${d.close}` : 'Bağlı'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Booking */}
        <aside className="h-fit rounded-card bg-white p-5 ring-1 ring-cream-200 lg:sticky lg:top-20">
          <h2 className="mb-1 text-lg font-bold text-ink">Təyinat sorğusu</h2>
          <p className="mb-4 text-sm text-ink/60">Həkim təsdiqləyəndə bildiriş alacaqsınız.</p>
          {!session?.user ? (
            <p className="rounded-lg bg-cream-100 p-4 text-sm text-ink/70">
              Sorğu göndərmək üçün{' '}
              <Link href="/login" className="font-bold text-brand-600 hover:underline">daxil olun</Link>.
            </p>
          ) : pets.length === 0 ? (
            <p className="rounded-lg bg-cream-100 p-4 text-sm text-ink/70">
              Əvvəlcə{' '}
              <Link href="/pets/new" className="font-bold text-brand-600 hover:underline">pet profili yaradın</Link>
              {' '}— təyinat pet üçün alınır.
            </p>
          ) : (
            <RequestForm
              vetId={vet.id}
              pets={pets.map((p) => ({
                id: p.id,
                name: p.name,
                label: `${p.name} — ${p.breed?.name ?? p.category.name}`,
              }))}
            />
          )}
        </aside>
      </div>
    </main>
  );
}
