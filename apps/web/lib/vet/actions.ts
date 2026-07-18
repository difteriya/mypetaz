'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, Prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { DAYS } from '@/lib/business/hours';
import { vetProfileSchema } from './schema';

export type VetActionState = { error?: string } | undefined;

function hoursFromForm(fd: FormData) {
  const hours: Record<string, { open: string; close: string } | null> = {};
  for (const { key } of DAYS) {
    const open = String(fd.get(`open_${key}`) ?? '').trim();
    const close = String(fd.get(`close_${key}`) ?? '').trim();
    hours[key] = open && close ? { open, close } : null;
  }
  return hours;
}

/** Vet self-registration (PLAN.md §7.1). Creates an unverified VetProfile that
 * an admin then approves. A user can apply once. */
export async function applyVetAction(_prev: VetActionState, fd: FormData): Promise<VetActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const existing = await prisma.vetProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existing) redirect('/become-vet');

  const parsed = vetProfileSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  const d = parsed.data;

  await prisma.vetProfile.create({
    data: {
      userId: session.user.id,
      clinicName: d.clinicName,
      specialty: d.specialty ?? null,
      about: d.about ?? null,
      phone: d.phone ?? null,
      licenseNo: d.licenseNo ?? null,
      address: d.address ?? null,
      businessHours: hoursFromForm(fd) as Prisma.InputJsonValue,
      verified: false,
    },
  });

  revalidatePath('/become-vet');
  redirect('/become-vet');
}
