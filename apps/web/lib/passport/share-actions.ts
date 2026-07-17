'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, Prisma } from '@mypet/db';
import { auth } from '@mypet/auth';

export type ShareActionState = { error?: string; ok?: string } | undefined;

async function ownsPet(petId: string, userId: string) {
  return prisma.pet.findFirst({ where: { id: petId, ownerId: userId }, select: { id: true } });
}

export async function createShareLinkAction(
  _prev: ShareActionState,
  formData: FormData,
): Promise<ShareActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const petId = String(formData.get('petId') ?? '');
  if (!(await ownsPet(petId, session.user.id))) return { error: 'Pet tapılmadı' };

  const sharedFields = {
    basicInfo: formData.get('basicInfo') === 'on',
    passport: formData.get('passport') === 'on',
    medicalHistory: formData.get('medicalHistory') === 'on',
  };
  if (!sharedFields.basicInfo && !sharedFields.passport && !sharedFields.medicalHistory) {
    return { error: 'Ən azı bir bölmə seçin' };
  }

  await prisma.petShareLink.create({
    data: {
      petId,
      token: randomBytes(16).toString('hex'),
      sharedFields: sharedFields as Prisma.InputJsonObject,
      active: true,
    },
  });

  revalidatePath('/pet/[id]/passport', 'page');
  return { ok: 'Paylaşım linki yaradıldı' };
}

export async function toggleShareLinkAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const id = String(formData.get('linkId') ?? '');
  const link = await prisma.petShareLink.findFirst({
    where: { id, pet: { ownerId: session.user.id } },
    select: { id: true, active: true, petId: true },
  });
  if (link) {
    await prisma.petShareLink.update({ where: { id: link.id }, data: { active: !link.active } });
    revalidatePath('/pet/[id]/passport', 'page');
  }
}

export async function deleteShareLinkAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const id = String(formData.get('linkId') ?? '');
  const link = await prisma.petShareLink.findFirst({
    where: { id, pet: { ownerId: session.user.id } },
    select: { id: true, petId: true },
  });
  if (link) {
    await prisma.petShareLink.delete({ where: { id: link.id } });
    revalidatePath('/pet/[id]/passport', 'page');
  }
}
