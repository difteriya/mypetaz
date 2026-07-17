'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, slugify } from '@mypet/db';
import { auth } from '@mypet/auth';
import { recordSlugChange } from './slug-redirect';

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
}

export type TaxonomyState = { error?: string; ok?: string } | undefined;

// ─────────────────────────── Service categories ───────────────────────────

async function uniqueServiceSlug(name: string, exceptId?: string): Promise<string> {
  const base = slugify(name) || 'xidmet';
  let slug = base;
  let n = 2;
  while (await prisma.serviceCategory.findFirst({ where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) }, select: { id: true } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function createServiceCategoryAction(_prev: TaxonomyState, fd: FormData): Promise<TaxonomyState> {
  await assertAdmin();
  const name = String(fd.get('name') ?? '').trim();
  if (name.length < 2) return { error: 'Ad ən azı 2 simvol olmalıdır' };
  if (await prisma.serviceCategory.findFirst({ where: { name: { equals: name, mode: 'insensitive' } }, select: { id: true } }))
    return { error: 'Bu xidmət artıq mövcuddur' };
  const max = await prisma.serviceCategory.aggregate({ _max: { order: true } });
  await prisma.serviceCategory.create({ data: { name, slug: await uniqueServiceSlug(name), order: (max._max.order ?? 0) + 1 } });
  revalidatePath('/admin/service-categories');
  return { ok: `"${name}" əlavə edildi` };
}

export async function renameServiceCategoryAction(_prev: TaxonomyState, fd: FormData): Promise<TaxonomyState> {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const name = String(fd.get('name') ?? '').trim();
  if (name.length < 2) return { error: 'Ad ən azı 2 simvol olmalıdır' };
  await prisma.serviceCategory.update({ where: { id }, data: { name, slug: await uniqueServiceSlug(name, id) } });
  revalidatePath('/admin/service-categories');
  return { ok: 'Yeniləndi' };
}

export async function toggleServiceCategoryAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const c = await prisma.serviceCategory.findUnique({ where: { id }, select: { active: true } });
  if (c) await prisma.serviceCategory.update({ where: { id }, data: { active: !c.active } });
  revalidatePath('/admin/service-categories');
}

export async function deleteServiceCategoryAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  await prisma.serviceCategory.delete({ where: { id } });
  revalidatePath('/admin/service-categories');
}

export async function moveServiceCategoryAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const dir = String(fd.get('dir') ?? '');
  const c = await prisma.serviceCategory.findUnique({ where: { id }, select: { order: true } });
  if (!c) return;
  const neighbor = await prisma.serviceCategory.findFirst({
    where: { order: dir === 'up' ? { lt: c.order } : { gt: c.order } },
    orderBy: { order: dir === 'up' ? 'desc' : 'asc' },
    select: { id: true, order: true },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.serviceCategory.update({ where: { id }, data: { order: neighbor.order } }),
    prisma.serviceCategory.update({ where: { id: neighbor.id }, data: { order: c.order } }),
  ]);
  revalidatePath('/admin/service-categories');
}

// ───────────────────────────── Blog categories ─────────────────────────────

async function uniqueBlogSlug(name: string, exceptId?: string): Promise<string> {
  const base = slugify(name) || 'kateqoriya';
  let slug = base;
  let n = 2;
  while (await prisma.blogCategory.findFirst({ where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) }, select: { id: true } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function createBlogCategoryAction(_prev: TaxonomyState, fd: FormData): Promise<TaxonomyState> {
  await assertAdmin();
  const name = String(fd.get('name') ?? '').trim();
  if (name.length < 2) return { error: 'Ad ən azı 2 simvol olmalıdır' };
  if (await prisma.blogCategory.findFirst({ where: { name: { equals: name, mode: 'insensitive' } }, select: { id: true } }))
    return { error: 'Bu kateqoriya artıq mövcuddur' };
  const max = await prisma.blogCategory.aggregate({ _max: { order: true } });
  await prisma.blogCategory.create({ data: { name, slug: await uniqueBlogSlug(name), order: (max._max.order ?? 0) + 1 } });
  revalidatePath('/admin/blog-categories');
  return { ok: `"${name}" əlavə edildi` };
}

export async function renameBlogCategoryAction(_prev: TaxonomyState, fd: FormData): Promise<TaxonomyState> {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const name = String(fd.get('name') ?? '').trim();
  if (name.length < 2) return { error: 'Ad ən azı 2 simvol olmalıdır' };
  const current = await prisma.blogCategory.findUnique({ where: { id }, select: { slug: true } });
  if (!current) return { error: 'Kateqoriya tapılmadı' };
  const newSlug = await uniqueBlogSlug(name, id);
  await prisma.blogCategory.update({ where: { id }, data: { name, slug: newSlug } });
  if (newSlug !== current.slug) await recordSlugChange('blogCategory', current.slug, newSlug);
  revalidatePath('/admin/blog-categories');
  return { ok: 'Yeniləndi' };
}

export async function toggleBlogCategoryAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const c = await prisma.blogCategory.findUnique({ where: { id }, select: { active: true } });
  if (c) await prisma.blogCategory.update({ where: { id }, data: { active: !c.active } });
  revalidatePath('/admin/blog-categories');
}

export async function deleteBlogCategoryAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  await prisma.blogCategory.delete({ where: { id } });
  revalidatePath('/admin/blog-categories');
}

export async function moveBlogCategoryAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const dir = String(fd.get('dir') ?? '');
  const c = await prisma.blogCategory.findUnique({ where: { id }, select: { order: true } });
  if (!c) return;
  const neighbor = await prisma.blogCategory.findFirst({
    where: { order: dir === 'up' ? { lt: c.order } : { gt: c.order } },
    orderBy: { order: dir === 'up' ? 'desc' : 'asc' },
    select: { id: true, order: true },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.blogCategory.update({ where: { id }, data: { order: neighbor.order } }),
    prisma.blogCategory.update({ where: { id: neighbor.id }, data: { order: c.order } }),
  ]);
  revalidatePath('/admin/blog-categories');
}
