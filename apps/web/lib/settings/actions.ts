'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@mypet/db';
import { auth, hashPassword, verifyPassword } from '@mypet/auth';

export type SettingsState = { error?: string; ok?: string } | undefined;

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Ad ən azı 2 simvol olmalıdır').max(60),
  phone: z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().max(20).optional()),
});

export async function updateProfileAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const parsed = profileSchema.safeParse({ name: formData.get('name'), phone: formData.get('phone') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
  });
  revalidatePath('/dashboard/settings');
  return { ok: 'Profil yeniləndi (ad dəyişikliyi növbəti girişdə tam əks olunur)' };
}

const passwordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Yeni şifrə ən azı 8 simvol olmalıdır'),
});

export async function changePasswordAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  // If the user already has a password, require the current one to match.
  if (user?.passwordHash) {
    const okCurrent = parsed.data.currentPassword
      ? await verifyPassword(parsed.data.currentPassword, user.passwordHash)
      : false;
    if (!okCurrent) return { error: 'Cari şifrə yanlışdır' };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  return { ok: 'Şifrə yeniləndi' };
}
