'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { notify } from '@/lib/notifications/service';

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
}
const id = (fd: FormData) => String(fd.get('id') ?? '');
const reason = (fd: FormData) => {
  const r = String(fd.get('reason') ?? '').trim();
  return r || null;
};

/** Approve a vet: verify the profile. Panel access at vet.mypet.az is gated on
 * `VetProfile.verified`, not on the role — the VET role is only a label, so it
 * is granted to plain users and never overwrites ADMIN (an admin who is also a
 * vet must stay an admin). */
export async function approveVetAction(fd: FormData) {
  await assertAdmin();
  const vet = await prisma.vetProfile.update({
    where: { id: id(fd) },
    data: { verified: true },
    select: { userId: true, clinicName: true, user: { select: { role: true } } },
  });
  if (vet.user.role === 'USER') {
    await prisma.user.update({ where: { id: vet.userId }, data: { role: 'VET' } });
  }
  await notify({
    userId: vet.userId,
    type: 'VET_APPROVED',
    message: `Baytar hesabınız təsdiqləndi: ${vet.clinicName}. Növbəti girişdə vet panelinə çıxışınız olacaq.`,
    link: '/dashboard',
    email: true,
  });
  revalidatePath('/admin/vets');
}

/** Reject a vet application: remove the profile (the applicant may re-apply). */
export async function rejectVetAction(fd: FormData) {
  await assertAdmin();
  const r = reason(fd);
  const vet = await prisma.vetProfile.delete({
    where: { id: id(fd) },
    select: { userId: true, clinicName: true, user: { select: { role: true } } },
  });
  // Drop the VET label again; ADMIN is left untouched.
  if (vet.user.role === 'VET') {
    await prisma.user.update({ where: { id: vet.userId }, data: { role: 'USER' } });
  }
  await notify({
    userId: vet.userId,
    type: 'VET_REJECTED',
    message: `Baytar müraciətiniz rədd edildi: ${vet.clinicName}${r ? ` — ${r}` : ''}`,
    link: '/become-vet',
    email: true,
  });
  revalidatePath('/admin/vets');
}
