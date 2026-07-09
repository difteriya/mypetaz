'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, Prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { processImage, removeImage } from '@/lib/uploads';
import { petBaseSchema } from './schema';
import { buildStaticFieldsSchema, type PetFieldDef } from './fields';

const MAX_IMAGES = 8;

export type PetActionState = { error?: string } | undefined;

export async function createPetAction(
  _prev: PetActionState,
  formData: FormData,
): Promise<PetActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // 1) Common fields
  const base = petBaseSchema.safeParse({
    categoryId: formData.get('categoryId'),
    breedId: formData.get('breedId'),
    breedFreeText: formData.get('breedFreeText'),
    name: formData.get('name'),
    birthDate: formData.get('birthDate'),
    birthApprox: formData.get('birthApprox') === 'on',
    sex: formData.get('sex') ?? 'UNKNOWN',
    color: formData.get('color'),
    weight: formData.get('weight'),
    microchipNo: formData.get('microchipNo'),
    description: formData.get('description'),
  });
  if (!base.success) {
    return { error: base.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  }
  const data = base.data;

  // 2) Category + its field defs (source of truth for dynamic validation)
  const category = await prisma.petCategory.findUnique({
    where: { id: data.categoryId },
    include: { fields: { where: { active: true }, orderBy: { order: 'asc' } } },
  });
  if (!category) return { error: 'Kateqoriya tapılmadı' };

  // 3) Validate breed belongs to the category (when provided)
  let breedName: string | null = null;
  if (data.breedId) {
    const breed = await prisma.breed.findFirst({
      where: { id: data.breedId, categoryId: category.id },
      select: { name: true },
    });
    if (!breed) return { error: 'Seçilmiş cins bu kateqoriyaya aid deyil' };
    breedName = breed.name;
  }

  // 4) Dynamic fields via the engine (PLAN.md §4.1)
  const staticInput: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('sf_')) staticInput[key.slice(3)] = value;
  }
  const staticSchema = buildStaticFieldsSchema(category.fields as PetFieldDef[]);
  const staticParsed = staticSchema.safeParse(staticInput);
  if (!staticParsed.success) {
    return { error: staticParsed.error.issues[0]?.message ?? 'Əlavə sahələr yanlışdır' };
  }

  // 5) Create the pet
  const pet = await prisma.pet.create({
    data: {
      ownerId: session.user.id,
      categoryId: category.id,
      breedId: data.breedId ?? null,
      breedFreeText: category.freeTextBreed ? (data.breedFreeText ?? null) : null,
      name: data.name,
      birthDate: data.birthDate ?? null,
      birthApprox: data.birthApprox ?? false,
      sex: data.sex,
      color: data.color ?? null,
      weight: data.weight ?? null,
      microchipNo: data.microchipNo ?? null,
      description: data.description ?? null,
      staticFields: staticParsed.data as Prisma.InputJsonObject,
    },
    select: { id: true },
  });

  // 6) Images → WebP variants + rows with auto alt text (§3.1)
  const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
  const altBase = breedName ? `${data.name}, ${breedName}` : `${data.name}, ${category.name}`;
  let order = 0;
  for (const file of files.slice(0, MAX_IMAGES)) {
    try {
      const { stem } = await processImage(file, 'pets', altBase);
      await prisma.petImage.create({
        data: { petId: pet.id, url: stem, alt: `${altBase} — şəkil ${order + 1}`, order },
      });
      order += 1;
    } catch (err) {
      // Skip a bad image rather than failing the whole create.
      console.error('[createPet] image skipped:', (err as Error).message);
    }
  }

  revalidatePath('/pets');
  redirect(`/pet/${pet.id}`);
}

export async function deletePetAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const petId = String(formData.get('petId') ?? '');
  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId: session.user.id },
    include: { images: { select: { url: true } } },
  });
  if (!pet) redirect('/pets');

  await Promise.all(pet.images.map((img) => removeImage(img.url)));
  await prisma.pet.delete({ where: { id: pet.id } });

  revalidatePath('/pets');
  redirect('/pets');
}
