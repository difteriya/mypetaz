'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { processImage, removeImage } from '@/lib/uploads';
import { passportSchema, healthRecordSchema } from './health-schema';

export type HealthActionState = { error?: string; ok?: boolean } | undefined;

async function ownedPet(petId: string, userId: string) {
  return prisma.pet.findFirst({ where: { id: petId, ownerId: userId }, select: { id: true, name: true } });
}

export async function savePassportAction(
  _prev: HealthActionState,
  formData: FormData,
): Promise<HealthActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const parsed = passportSchema.safeParse({
    petId: formData.get('petId'),
    documentNo: formData.get('documentNo'),
    issueDate: formData.get('issueDate'),
    microchipId: formData.get('microchipId'),
    birthPlace: formData.get('birthPlace'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  const data = parsed.data;

  const pet = await ownedPet(data.petId, session.user.id);
  if (!pet) return { error: 'Pet tapılmadı' };

  const existing = await prisma.petPassport.findUnique({ where: { petId: pet.id } });
  let documentImage = existing?.documentImage ?? null;
  let documentImageAlt = existing?.documentImageAlt ?? null;

  const file = formData.get('documentImage');
  if (file instanceof File && file.size > 0) {
    try {
      const { stem } = await processImage(file, 'passports', `pasport-${pet.name}`);
      if (existing?.documentImage) await removeImage(existing.documentImage);
      documentImage = stem;
      documentImageAlt = `${pet.name} pasport sənədi`;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Şəkil yüklənmədi' };
    }
  }

  await prisma.petPassport.upsert({
    where: { petId: pet.id },
    create: {
      petId: pet.id,
      documentNo: data.documentNo ?? null,
      issueDate: data.issueDate ?? null,
      microchipId: data.microchipId ?? null,
      birthPlace: data.birthPlace ?? null,
      documentImage,
      documentImageAlt,
    },
    update: {
      documentNo: data.documentNo ?? null,
      issueDate: data.issueDate ?? null,
      microchipId: data.microchipId ?? null,
      birthPlace: data.birthPlace ?? null,
      documentImage,
      documentImageAlt,
    },
  });

  revalidatePath(`/pet/${pet.id}`);
  return { ok: true };
}

export async function addHealthRecordAction(
  _prev: HealthActionState,
  formData: FormData,
): Promise<HealthActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const parsed = healthRecordSchema.safeParse({
    petId: formData.get('petId'),
    type: formData.get('type'),
    name: formData.get('name'),
    date: formData.get('date'),
    nextDate: formData.get('nextDate'),
    note: formData.get('note'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  const data = parsed.data;

  const pet = await ownedPet(data.petId, session.user.id);
  if (!pet) return { error: 'Pet tapılmadı' };

  await prisma.petHealthRecord.create({
    data: {
      petId: pet.id,
      type: data.type,
      name: data.name,
      date: data.date,
      nextDate: data.nextDate ?? null,
      note: data.note ?? null,
      source: 'SELF', // owner-added; vet records arrive as source=VET (PLAN.md §2.3)
    },
  });

  revalidatePath(`/pet/${pet.id}`);
  return { ok: true };
}

export async function deleteHealthRecordAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const recordId = String(formData.get('recordId') ?? '');
  const record = await prisma.petHealthRecord.findFirst({
    where: { id: recordId, pet: { ownerId: session.user.id } },
    select: { id: true, petId: true, source: true },
  });
  // Only owner-added records can be deleted here; vet records are managed by the vet.
  if (record && record.source === 'SELF') {
    await prisma.petHealthRecord.delete({ where: { id: record.id } });
    revalidatePath(`/pet/${record.petId}`);
  }
}
