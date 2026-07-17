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

export type BreedActionState = { error?: string; ok?: string } | undefined;

/** A slug unique within the category, optionally excluding one breed id. */
async function uniqueBreedSlug(categoryId: string, name: string, exceptId?: string): Promise<string> {
  const base = slugify(name) || 'cins';
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (true) {
    const clash = await prisma.breed.findFirst({
      where: { categoryId, slug, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

export async function createBreedAction(
  _prev: BreedActionState,
  fd: FormData,
): Promise<BreedActionState> {
  await assertAdmin();
  const categoryId = String(fd.get('categoryId') ?? '');
  const name = String(fd.get('name') ?? '').trim();

  if (!categoryId) return { error: 'Kateqoriya seçin' };
  if (name.length < 2) return { error: 'Ad ən azı 2 simvol olmalıdır' };

  const category = await prisma.petCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, freeTextBreed: true, name: true },
  });
  if (!category) return { error: 'Kateqoriya tapılmadı' };
  if (category.freeTextBreed) return { error: 'Bu kateqoriyada cins siyahısı yoxdur (sərbəst mətn)' };

  const dupe = await prisma.breed.findFirst({
    where: { categoryId, name: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  });
  if (dupe) return { error: 'Bu cins artıq mövcuddur' };

  const slug = await uniqueBreedSlug(categoryId, name);
  const max = await prisma.breed.aggregate({ where: { categoryId }, _max: { order: true } });
  await prisma.breed.create({
    data: { categoryId, name, slug, order: (max._max.order ?? 0) + 1 },
  });

  revalidatePath('/admin/breeds');
  return { ok: `"${name}" (${category.name}) əlavə edildi` };
}

export async function renameBreedAction(_prev: BreedActionState, fd: FormData): Promise<BreedActionState> {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const name = String(fd.get('name') ?? '').trim();
  if (name.length < 2) return { error: 'Ad ən azı 2 simvol olmalıdır' };

  const breed = await prisma.breed.findUnique({ where: { id }, select: { categoryId: true, slug: true } });
  if (!breed) return { error: 'Cins tapılmadı' };

  const dupe = await prisma.breed.findFirst({
    where: { categoryId: breed.categoryId, name: { equals: name, mode: 'insensitive' }, id: { not: id } },
    select: { id: true },
  });
  if (dupe) return { error: 'Bu cins artıq mövcuddur' };

  const newSlug = await uniqueBreedSlug(breed.categoryId, name, id);
  await prisma.breed.update({ where: { id }, data: { name, slug: newSlug } });
  if (newSlug !== breed.slug) {
    await recordSlugChange(`breed:${breed.categoryId}`, breed.slug, newSlug);
  }

  revalidatePath('/admin/breeds');
  return { ok: 'Yeniləndi' };
}

export async function moveBreedAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const dir = String(fd.get('dir') ?? '');
  const b = await prisma.breed.findUnique({ where: { id }, select: { categoryId: true, order: true } });
  if (!b) return;
  const neighbor = await prisma.breed.findFirst({
    where: { categoryId: b.categoryId, order: dir === 'up' ? { lt: b.order } : { gt: b.order } },
    orderBy: { order: dir === 'up' ? 'desc' : 'asc' },
    select: { id: true, order: true },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.breed.update({ where: { id }, data: { order: neighbor.order } }),
    prisma.breed.update({ where: { id: neighbor.id }, data: { order: b.order } }),
  ]);
  revalidatePath('/admin/breeds');
}

export async function toggleBreedActiveAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const breed = await prisma.breed.findUnique({ where: { id }, select: { active: true } });
  if (breed) await prisma.breed.update({ where: { id }, data: { active: !breed.active } });
  revalidatePath('/admin/breeds');
}

export async function deleteBreedAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  // Only delete when no pet references it (otherwise deactivate instead).
  const used = await prisma.pet.count({ where: { breedId: id } });
  if (used === 0) await prisma.breed.delete({ where: { id } });
  revalidatePath('/admin/breeds');
}
