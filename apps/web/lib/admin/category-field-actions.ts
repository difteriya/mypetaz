'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, slugify, Prisma } from '@mypet/db';
import { auth } from '@mypet/auth';

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
}

export type FieldActionState = { error?: string; ok?: string } | undefined;

const TYPES = ['TEXT', 'NUMBER', 'SELECT', 'BOOL'] as const;

/** "Peyvənd statusu" → "peyvendStatusu"; unique within the category. */
async function uniqueFieldName(categoryId: string, label: string): Promise<string> {
  const parts = slugify(label).split('-').filter(Boolean);
  const camel =
    parts.length === 0
      ? 'sahe'
      : parts[0] + parts.slice(1).map((p) => p[0]!.toUpperCase() + p.slice(1)).join('');
  let name = camel;
  let n = 2;
  while (await prisma.petCategoryField.findFirst({ where: { categoryId, fieldName: name }, select: { id: true } })) {
    name = `${camel}${n}`;
    n += 1;
  }
  return name;
}

function parseOptions(raw: string): string[] {
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createFieldAction(_prev: FieldActionState, fd: FormData): Promise<FieldActionState> {
  await assertAdmin();
  const categoryId = String(fd.get('categoryId') ?? '');
  const label = String(fd.get('label') ?? '').trim();
  const type = String(fd.get('type') ?? '');
  const required = fd.get('required') === 'on';
  const options = parseOptions(String(fd.get('options') ?? ''));

  if (!categoryId) return { error: 'Kateqoriya seçin' };
  if (label.length < 2) return { error: 'Label ən azı 2 simvol olmalıdır' };
  if (!TYPES.includes(type as (typeof TYPES)[number])) return { error: 'Tip yanlışdır' };
  if (type === 'SELECT' && options.length < 2) return { error: 'SELECT üçün ən azı 2 seçim yazın' };

  const category = await prisma.petCategory.findUnique({ where: { id: categoryId }, select: { id: true, freeTextBreed: true } });
  if (!category) return { error: 'Kateqoriya tapılmadı' };

  const fieldName = await uniqueFieldName(categoryId, label);
  const max = await prisma.petCategoryField.aggregate({ where: { categoryId }, _max: { order: true } });
  await prisma.petCategoryField.create({
    data: {
      categoryId,
      fieldName,
      label,
      type: type as (typeof TYPES)[number],
      required,
      options: type === 'SELECT' ? (options as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      order: (max._max.order ?? 0) + 1,
    },
  });

  revalidatePath('/admin/category-fields');
  return { ok: `"${label}" əlavə edildi (açar: ${fieldName})` };
}

/** Edit label + options + required. The `fieldName` key and stored data stay put. */
export async function updateFieldAction(_prev: FieldActionState, fd: FormData): Promise<FieldActionState> {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const label = String(fd.get('label') ?? '').trim();
  const required = fd.get('required') === 'on';
  const options = parseOptions(String(fd.get('options') ?? ''));

  if (label.length < 2) return { error: 'Label ən azı 2 simvol olmalıdır' };

  const field = await prisma.petCategoryField.findUnique({ where: { id }, select: { type: true } });
  if (!field) return { error: 'Sahə tapılmadı' };
  if (field.type === 'SELECT' && options.length < 2) return { error: 'SELECT üçün ən azı 2 seçim yazın' };

  await prisma.petCategoryField.update({
    where: { id },
    data: {
      label,
      required,
      ...(field.type === 'SELECT' ? { options: options as unknown as Prisma.InputJsonValue } : {}),
    },
  });

  revalidatePath('/admin/category-fields');
  return { ok: 'Yeniləndi' };
}

export async function toggleFieldActiveAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const f = await prisma.petCategoryField.findUnique({ where: { id }, select: { active: true } });
  if (f) await prisma.petCategoryField.update({ where: { id }, data: { active: !f.active } });
  revalidatePath('/admin/category-fields');
}

export async function deleteFieldAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  await prisma.petCategoryField.delete({ where: { id } });
  revalidatePath('/admin/category-fields');
}

export async function moveFieldAction(fd: FormData) {
  await assertAdmin();
  const id = String(fd.get('id') ?? '');
  const dir = String(fd.get('dir') ?? '');
  const f = await prisma.petCategoryField.findUnique({ where: { id }, select: { categoryId: true, order: true } });
  if (!f) return;
  const neighbor = await prisma.petCategoryField.findFirst({
    where: { categoryId: f.categoryId, order: dir === 'up' ? { lt: f.order } : { gt: f.order } },
    orderBy: { order: dir === 'up' ? 'desc' : 'asc' },
    select: { id: true, order: true },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.petCategoryField.update({ where: { id }, data: { order: neighbor.order } }),
    prisma.petCategoryField.update({ where: { id: neighbor.id }, data: { order: f.order } }),
  ]);
  revalidatePath('/admin/category-fields');
}
