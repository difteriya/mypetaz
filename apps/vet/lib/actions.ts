'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { getVerifiedVet } from './guard';
import { notify } from './notify';

export type VetPanelState = { error?: string } | undefined;

async function requireVet() {
  const ctx = await getVerifiedVet();
  if (!ctx) redirect('/status');
  return ctx;
}

/** Own appointment (with pet name for notification copy), or null. */
async function ownAppointment(vetId: string, id: string) {
  return prisma.vetAppointment.findFirst({
    where: { id, vetId },
    include: { pet: { select: { name: true } } },
  });
}

export async function confirmAppointmentAction(fd: FormData) {
  const { vet } = await requireVet();
  const appt = await ownAppointment(vet.id, String(fd.get('id') ?? ''));
  if (appt?.status === 'REQUEST') {
    await prisma.vetAppointment.update({ where: { id: appt.id }, data: { status: 'CONFIRMED' } });
    await notify(
      appt.requesterUserId,
      'APPOINTMENT_CONFIRMED',
      `Vet təyinatınız təsdiqləndi: ${appt.pet.name} — ${vet.clinicName}`,
      '/dashboard',
      vet.clinicName,
    );
  }
  revalidatePath('/');
  revalidatePath('/appointments');
}

export async function rejectAppointmentAction(fd: FormData) {
  const { vet } = await requireVet();
  const appt = await ownAppointment(vet.id, String(fd.get('id') ?? ''));
  if (appt?.status === 'REQUEST') {
    await prisma.vetAppointment.update({ where: { id: appt.id }, data: { status: 'REJECTED' } });
    await notify(
      appt.requesterUserId,
      'APPOINTMENT_REJECTED',
      `Vet təyinat sorğunuz rədd edildi: ${appt.pet.name} — ${vet.clinicName}`,
      '/dashboard',
      vet.clinicName,
    );
  }
  revalidatePath('/');
  revalidatePath('/appointments');
}

export async function completeAppointmentAction(fd: FormData) {
  const { vet } = await requireVet();
  const appt = await ownAppointment(vet.id, String(fd.get('id') ?? ''));
  if (appt?.status === 'CONFIRMED') {
    await prisma.vetAppointment.update({ where: { id: appt.id }, data: { status: 'COMPLETED' } });
  }
  revalidatePath('/');
  revalidatePath('/appointments');
  revalidatePath(`/appointments/${String(fd.get('id') ?? '')}`);
}

/**
 * Doctor-created appointment (§7.2), two modes:
 *  - walkin  → the customer is present; created directly CONFIRMED
 *  - propose → an offer sent to the customer; created REQUEST, the customer
 *              accepts/declines from their mypet.az dashboard
 */
export async function createWalkInAction(_prev: VetPanelState, fd: FormData): Promise<VetPanelState> {
  const { vet } = await requireVet();

  const petId = String(fd.get('petId') ?? '');
  const date = String(fd.get('date') ?? '');
  const time = String(fd.get('time') ?? '');
  const note = String(fd.get('note') ?? '').trim();
  const mode = String(fd.get('mode') ?? 'walkin');

  if (!petId) return { error: 'Pet seçin' };
  if (!date || !time) return { error: 'Tarix və saat tələb olunur' };
  const when = new Date(`${date}T${time}`);
  if (Number.isNaN(when.getTime())) return { error: 'Tarix/saat yanlışdır' };

  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    select: { id: true, ownerId: true, name: true },
  });
  if (!pet) return { error: 'Pet tapılmadı' };

  const proposing = mode === 'propose';
  const appt = await prisma.vetAppointment.create({
    data: {
      vetId: vet.id,
      petId: pet.id,
      requesterUserId: pet.ownerId,
      date: when,
      note: note || null,
      status: proposing ? 'REQUEST' : 'CONFIRMED',
      createdBy: 'DOCTOR',
    },
    select: { id: true },
  });

  const whenLabel = `${date.split('-').reverse().join('.')} ${time}`;
  await notify(
    pet.ownerId,
    proposing ? 'APPOINTMENT_PROPOSED' : 'APPOINTMENT_CONFIRMED',
    proposing
      ? `${vet.clinicName} sizə vet təyinatı təklif edir: ${pet.name}, ${whenLabel}. Qəbul etmək üçün panelə baxın.`
      : `Vet təyinatınız yaradıldı: ${pet.name} — ${vet.clinicName}, ${whenLabel}`,
    '/dashboard',
    vet.clinicName,
  );

  revalidatePath('/');
  revalidatePath('/appointments');
  redirect(`/appointments/${appt.id}`);
}

const RECORD_TYPES = ['VACCINE', 'EXAM', 'SURGERY'] as const;

/** Create the visit record for a completed appointment (draft, §7.3). */
export async function createVisitRecordAction(_prev: VetPanelState, fd: FormData): Promise<VetPanelState> {
  const { vet } = await requireVet();
  const appt = await ownAppointment(vet.id, String(fd.get('appointmentId') ?? ''));
  if (!appt || appt.status !== 'COMPLETED') return { error: 'Təyinat tamamlanmayıb' };

  const existing = await prisma.vetVisitRecord.findUnique({ where: { appointmentId: appt.id } });
  if (existing) return { error: 'Bu təyinat üçün qeyd artıq var' };

  const recordType = String(fd.get('recordType') ?? '');
  const examType = String(fd.get('examType') ?? '').trim();
  const description = String(fd.get('description') ?? '').trim();
  if (!RECORD_TYPES.includes(recordType as (typeof RECORD_TYPES)[number])) return { error: 'Növ seçin' };
  if (examType.length < 2) return { error: 'Prosedur adı tələb olunur' };

  await prisma.vetVisitRecord.create({
    data: {
      appointmentId: appt.id,
      petId: appt.petId,
      vetId: vet.id,
      recordType: recordType as (typeof RECORD_TYPES)[number],
      examType,
      description: description || null,
      date: appt.date,
    },
  });

  revalidatePath(`/appointments/${appt.id}`);
  return undefined;
}

/** Approve the record → copy into PetHealthRecord as a vet-sourced entry (§7.3). */
export async function approveVisitRecordAction(fd: FormData) {
  const { session, vet } = await requireVet();
  const record = await prisma.vetVisitRecord.findFirst({
    where: { id: String(fd.get('id') ?? ''), vetId: vet.id, approved: false },
  });
  if (!record) return;

  const health = await prisma.petHealthRecord.create({
    data: {
      petId: record.petId,
      type: record.recordType,
      name: record.examType,
      date: record.date,
      note: record.description,
      source: 'VET',
      addedById: session.user.id,
      vetAppointmentId: record.appointmentId,
    },
    select: { id: true },
  });
  await prisma.vetVisitRecord.update({
    where: { id: record.id },
    data: { approved: true, approvedAt: new Date(), healthRecordId: health.id },
  });

  revalidatePath(`/appointments/${record.appointmentId}`);
}
