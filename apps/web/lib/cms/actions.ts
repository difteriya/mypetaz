'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, type ContentBlockPage, type ContentBlockType } from '@mypet/db';
import { auth } from '@mypet/auth';
import { processImage } from '@/lib/uploads';

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
}

const PAGES = ['HOME', 'ABOUT', 'CONTACT', 'FOOTER', 'GLOBAL'];
const TYPES = ['TEXT', 'RICHTEXT', 'IMAGE', 'URL'];

export async function upsertContentBlockAction(fd: FormData): Promise<void> {
  await assertAdmin();

  const key = String(fd.get('key') ?? '').trim();
  const page = String(fd.get('page') ?? '') as ContentBlockPage;
  const type = String(fd.get('type') ?? '') as ContentBlockType;
  if (!key || !PAGES.includes(page) || !TYPES.includes(type)) return;

  let value = String(fd.get('value') ?? '').trim();

  // For IMAGE blocks, a newly uploaded file overrides the text value.
  if (type === 'IMAGE') {
    const file = fd.get('image');
    if (file instanceof File && file.size > 0) {
      value = (await processImage(file, 'cms', key)).stem;
    }
  }

  await prisma.contentBlock.upsert({
    where: { key },
    create: { key, page, type, value, order: Number(fd.get('order') ?? 0) },
    update: { page, type, ...(value ? { value } : {}), order: Number(fd.get('order') ?? 0) },
  });

  revalidatePath('/admin/content');
  revalidatePath('/');
}

export async function deleteContentBlockAction(fd: FormData): Promise<void> {
  await assertAdmin();
  const key = String(fd.get('key') ?? '');
  await prisma.contentBlock.deleteMany({ where: { key } });
  revalidatePath('/admin/content');
}
