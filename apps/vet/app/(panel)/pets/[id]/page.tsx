import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { getVerifiedVet } from '@/lib/guard';
import { StatusPill, fmtTime, fmtDate } from '../../ui';
import { PetChart } from '../../pet-chart';

export const metadata: Metadata = { title: 'Pet profili' };

export default async function VetPetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getVerifiedVet();
  if (!ctx) redirect('/status');
  const { id } = await params;

  // A vet may view a pet only if they have treated it — the appointment IS the
  // authorization. No treating relationship → not found (no browsing strangers' pets).
  const appointments = await prisma.vetAppointment.findMany({
    where: { petId: id, vetId: ctx.vet.id },
    orderBy: { date: 'desc' },
    include: { requester: { select: { name: true, email: true, phone: true } } },
  });
  const [latestVisit] = appointments;
  if (!latestVisit) notFound();

  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      breed: { select: { name: true } },
      category: { select: { name: true } },
      passport: true,
      healthRecords: { orderBy: { date: 'desc' } },
    },
  });
  if (!pet) notFound();

  const owner = latestVisit.requester;

  return (
    <div className="space-y-8">
      <Link href="/appointments" className="text-sm font-semibold text-vink/45 hover:text-vteal-700">
        ← Təyinatlar
      </Link>

      {/* Pet head */}
      <header>
        <h1 className="text-2xl font-extrabold">{pet.name}</h1>
        <p className="text-sm text-vink/55">
          {pet.breed?.name ?? pet.category.name} · Sahib: {owner.name ?? owner.email}
          {owner.phone ? ` · ${owner.phone}` : ''}
        </p>
      </header>

      {/* Visits with this clinic */}
      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-vink/45">
          Bu klinikadakı ziyarətlər ({appointments.length})
        </h2>
        <ul className="divide-y divide-vline border-y border-vline bg-white">
          {appointments.map((a) => (
            <li key={a.id}>
              <Link href={`/appointments/${a.id}`} className="flex items-center gap-4 px-4 py-2.5 hover:bg-vteal-50/50">
                <span className="w-32 shrink-0 font-mono text-sm text-vink/70">
                  {fmtDate(a.date)} {fmtTime(a.date)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-vink/55">
                  {a.note ?? (a.createdBy === 'DOCTOR' ? 'Walk-in' : 'Qəbul')}
                </span>
                <StatusPill status={a.status} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Pet vitals + full medical history */}
      <PetChart pet={pet} />
    </div>
  );
}
