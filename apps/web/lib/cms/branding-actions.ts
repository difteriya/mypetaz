'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { saveBrandAsset, removeBrandAsset } from '@/lib/uploads';
import { BRAND_LOGO_KEY, BRAND_FAVICON_KEY } from './branding';

export type BrandingState = { error?: string; ok?: string } | undefined;

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
}

/** Upload a new logo and/or favicon; leaving a field empty keeps the current one. */
export async function saveBrandingAction(
  _prev: BrandingState,
  fd: FormData,
): Promise<BrandingState> {
  await assertAdmin();

  const jobs: { key: string; file: File; base: string }[] = [];
  const logo = fd.get('logo');
  const favicon = fd.get('favicon');
  if (logo instanceof File && logo.size > 0) jobs.push({ key: BRAND_LOGO_KEY, file: logo, base: 'logo' });
  if (favicon instanceof File && favicon.size > 0) {
    jobs.push({ key: BRAND_FAVICON_KEY, file: favicon, base: 'favicon' });
  }
  if (jobs.length === 0) return { error: 'Fayl seçilmədi' };

  for (const job of jobs) {
    let value: string;
    try {
      value = await saveBrandAsset(job.file, job.base);
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Yükləmə alınmadı' };
    }

    // Drop the previous file so old assets don't pile up on disk.
    const existing = await prisma.contentBlock.findUnique({ where: { key: job.key } });
    if (existing?.value) await removeBrandAsset(existing.value);

    await prisma.contentBlock.upsert({
      where: { key: job.key },
      create: { key: job.key, page: 'GLOBAL', type: 'IMAGE', value, order: 0 },
      update: { value, page: 'GLOBAL', type: 'IMAGE' },
    });
  }

  revalidateTag('cms');
  revalidatePath('/', 'layout');
  revalidatePath('/admin/branding');
  return { ok: 'Yadda saxlanıldı' };
}

/** Remove a custom asset and fall back to the built-in mark. */
export async function resetBrandingAction(fd: FormData): Promise<void> {
  await assertAdmin();
  const key = String(fd.get('key') ?? '');
  if (key !== BRAND_LOGO_KEY && key !== BRAND_FAVICON_KEY) return;

  const existing = await prisma.contentBlock.findUnique({ where: { key } });
  if (existing?.value) await removeBrandAsset(existing.value);
  await prisma.contentBlock.deleteMany({ where: { key } });

  revalidateTag('cms');
  revalidatePath('/', 'layout');
  revalidatePath('/admin/branding');
}
