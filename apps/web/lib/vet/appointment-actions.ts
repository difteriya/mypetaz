'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { notify } from '@/lib/notifications/service';

export type ApptActionState = { error?: string; ok?: string } | undefined;

/** Customer books a vet: creates a REQUEST the doctor then confirms (§7.2). */
export async function requestAppointmentAction(
  _prev: ApptActionState,
  fd: FormData,
): Promise<ApptActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const vetId = String(fd.get('vetId') ?? '');
  const petId = String(fd.get('petId') ?? '');
  const date = String(fd.get('date') ?? '');
  const time = String(fd.get('time') ?? '');
  const note = String(fd.get('note') ?? '').trim();

  if (!petId) return { error: 'Pet seçin' };
  if (!date || !time) return { error: 'Tarix və saat seçin' };
  const when = new Date(`${date}T${time}`);
  if (Number.isNaN(when.getTime()) || when < new Date()) return { error: 'Keçmiş tarix seçilə bilməz' };

  const [vet, pet] = await Promise.all([
    prisma.vetProfile.findFirst({ where: { id: vetId, verified: true }, select: { id: true, userId: true, clinicName: true } }),
    prisma.pet.findFirst({ where: { id: petId, ownerId: session.user.id }, select: { id: true, name: true } }),
  ]);
  if (!vet) return { error: 'Baytar tapılmadı' };
  if (!pet) return { error: 'Pet tapılmadı' };

  await prisma.vetAppointment.create({
    data: {
      vetId: vet.id,
      petId: pet.id,
      requesterUserId: session.user.id,
      date: when,
      note: note || null,
      status: 'REQUEST',
      createdBy: 'CUSTOMER',
    },
  });

  await notify({
    userId: vet.userId,
    type: 'APPOINTMENT_REQUESTED',
    message: `Yeni təyinat sorğusu: ${pet.name}, ${date.split('-').reverse().join('.')} ${time}`,
    link: '/dashboard',
    source: session.user.name ?? undefined,
    email: true,
  });

  revalidatePath('/dashboard');
  return { ok: 'Sorğu göndərildi — həkim təsdiqləyəndə bildiriş alacaqsınız' };
}

/** Customer accepts a doctor-sent offer (REQUEST created by DOCTOR). */
export async function acceptProposalAction(fd: FormData) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const appt = await prisma.vetAppointment.findFirst({
    where: { id: String(fd.get('id') ?? ''), requesterUserId: session.user.id, status: 'REQUEST', createdBy: 'DOCTOR' },
    include: { pet: { select: { name: true } }, vet: { select: { userId: true, clinicName: true } } },
  });
  if (!appt) return;

  await prisma.vetAppointment.update({ where: { id: appt.id }, data: { status: 'CONFIRMED' } });
  await notify({
    userId: appt.vet.userId,
    type: 'APPOINTMENT_CONFIRMED',
    message: `Müştəri təklifi qəbul etdi: ${appt.pet.name}`,
    link: '/dashboard',
    source: session.user.name ?? undefined,
  });
  revalidatePath('/dashboard');
}

/** Customer declines a doctor-sent offer. */
export async function declineProposalAction(fd: FormData) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const appt = await prisma.vetAppointment.findFirst({
    where: { id: String(fd.get('id') ?? ''), requesterUserId: session.user.id, status: 'REQUEST', createdBy: 'DOCTOR' },
    include: { pet: { select: { name: true } }, vet: { select: { userId: true } } },
  });
  if (!appt) return;

  await prisma.vetAppointment.update({ where: { id: appt.id }, data: { status: 'REJECTED' } });
  await notify({
    userId: appt.vet.userId,
    type: 'APPOINTMENT_REJECTED',
    message: `Müştəri təklifi rədd etdi: ${appt.pet.name}`,
    link: '/dashboard',
    source: session.user.name ?? undefined,
  });
  revalidatePath('/dashboard');
}
