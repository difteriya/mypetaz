import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { getVerifiedVet } from '@/lib/guard';
import {
  confirmAppointmentAction,
  rejectAppointmentAction,
  completeAppointmentAction,
  approveVisitRecordAction,
} from '@/lib/actions';
import { StatusPill, fmtTime, fmtDate } from '../../ui';
import { PetChart } from '../../pet-chart';
import { VisitRecordForm } from './visit-record-form';

export const metadata: Metadata = { title: 'Təyinat' };

const HEALTH_LABEL: Record<string, string> = { VACCINE: 'Peyvənd', EXAM: 'Müayinə', SURGERY: 'Əməliyyat' };

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getVerifiedVet();
  if (!ctx) redirect('/status');
  const { id } = await params;

  const appt = await prisma.vetAppointment.findFirst({
    where: { id, vetId: ctx.vet.id },
    include: {
      requester: { select: { name: true, email: true, phone: true } },
      visitRecord: true,
      pet: {
        include: {
          breed: { select: { name: true } },
          category: { select: { name: true } },
          passport: true,
          // Full medical history — essential context for diagnosis (§7.4).
          healthRecords: { orderBy: { date: 'desc' } },
        },
      },
    },
  });
  if (!appt) notFound();
  const { pet } = appt;

  return (
    <div className="space-y-8">
      <Link href="/appointments" className="text-sm font-semibold text-vink/45 hover:text-vteal-700">
        ← Təyinatlar
      </Link>

      {/* Appointment head */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-vink/50">
            {fmtDate(appt.date)} {fmtTime(appt.date)}
            {appt.createdBy === 'DOCTOR' ? ' · walk-in' : ''}
          </p>
          <Link href={`/pets/${pet.id}`} className="group inline-flex items-center gap-1.5">
            <h1 className="text-2xl font-extrabold group-hover:text-vteal-700">{pet.name}</h1>
            <span className="text-vteal-500 transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
          </Link>
          <p className="text-sm text-vink/55">
            {pet.breed?.name ?? pet.category.name} · Sahib: {appt.requester.name ?? appt.requester.email}
            {appt.requester.phone ? ` · ${appt.requester.phone}` : ''}
          </p>
          <Link href={`/pets/${pet.id}`} className="mt-0.5 inline-block text-xs font-semibold text-vteal-700 hover:underline">
            Tam pet profilinə bax
          </Link>
          {appt.note && <p className="mt-1 text-sm text-vink/70">Qeyd: {appt.note}</p>}
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={appt.status} />
          {appt.status === 'REQUEST' && appt.createdBy === 'DOCTOR' && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              Müştəri təsdiqi gözlənilir
            </span>
          )}
          {appt.status === 'REQUEST' && appt.createdBy === 'CUSTOMER' && (
            <>
              <form action={confirmAppointmentAction}>
                <input type="hidden" name="id" value={appt.id} />
                <button className="rounded-full bg-vteal-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-vteal-700">
                  Təsdiqlə
                </button>
              </form>
              <form action={rejectAppointmentAction}>
                <input type="hidden" name="id" value={appt.id} />
                <button className="rounded-full border border-vline px-4 py-1.5 text-sm font-semibold text-vink/60 hover:border-red-300 hover:text-red-600">
                  Rədd et
                </button>
              </form>
            </>
          )}
          {appt.status === 'CONFIRMED' && (
            <form action={completeAppointmentAction}>
              <input type="hidden" name="id" value={appt.id} />
              <button className="rounded-full bg-vteal-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-vteal-700">
                Qəbulu bitir
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Visit record (only after completion, §7.3) */}
      {appt.status === 'COMPLETED' && (
        <section className="border-y border-vline bg-white p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-vteal-700">Müayinə qeydi</h2>
          {!appt.visitRecord ? (
            <VisitRecordForm appointmentId={appt.id} />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {HEALTH_LABEL[appt.visitRecord.recordType]} — {appt.visitRecord.examType}
                </p>
                {appt.visitRecord.description && (
                  <p className="mt-0.5 text-sm text-vink/60">{appt.visitRecord.description}</p>
                )}
                <p className="mt-1 font-mono text-xs text-vink/40">{fmtDate(appt.visitRecord.date)}</p>
              </div>
              {appt.visitRecord.approved ? (
                <span className="rounded-full bg-vteal-50 px-3 py-1 text-xs font-bold text-vteal-700">
                  Tarixçəyə köçürülüb
                </span>
              ) : (
                <form action={approveVisitRecordAction}>
                  <input type="hidden" name="id" value={appt.visitRecord.id} />
                  <button className="rounded-full bg-vteal-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-vteal-700">
                    Təsdiqlə və tarixçəyə köçür
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      )}

      {/* Pet vitals + full medical history (§7.4) */}
      <PetChart pet={pet} />
    </div>
  );
}
