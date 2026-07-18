'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, Prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { processImage, removeImage } from '@/lib/uploads';
import { petBaseSchema } from './schema';
import { buildStaticFieldsSchema, type PetFieldDef } from './fields';
import { petSlug } from './slug';

const MAX_IMAGES = 8;

export type PetActionState = { error?: string } | undefined;

/**
 * Create a pet from a FormData payload and return its id (no redirect).
 * Shared by the standalone pet page and the inline new-pet flow in the listing
 * form (PLAN.md §2.4). `descriptionKey` lets a caller whose own form already has
 * a `description` field (the listing form) pass the pet's under another key.
 */
export async function createPetFromForm(
  ownerId: string,
  formData: FormData,
  opts: { descriptionKey?: string } = {},
): Promise<{ petId: string; slug: string } | { error: string }> {
  const descriptionKey = opts.descriptionKey ?? 'description';

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
    description: formData.get(descriptionKey),
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

  // Business context: honored only when the owner actually has a BusinessProfile.
  const wantsBusiness = formData.get('asBusiness') === '1';
  const asBusiness = wantsBusiness
    ? Boolean(await prisma.businessProfile.findUnique({ where: { userId: ownerId }, select: { id: true } }))
    : false;

  // 5) Create the pet. The slug carries a random suffix so it's always unique;
  // on the astronomically rare hex collision P2002 fires — regenerate & retry.
  const petData = {
    asBusiness,
    ownerId,
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
  };

  let pet: { id: string; slug: string | null } | undefined;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const slug = petSlug(data.name, breedName);
      pet = await prisma.pet.create({ data: { ...petData, slug }, select: { id: true, slug: true } });
      break;
    } catch (err) {
      const isSlugClash =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        (err.meta?.target as string[] | undefined)?.some((t) => t.includes('slug'));
      if (!isSlugClash) throw err;
    }
  }
  if (!pet) return { error: 'Pet yaradıla bilmədi, yenidən cəhd edin' };

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

  return { petId: pet.id, slug: pet.slug ?? pet.id };
}

export async function createPetAction(
  _prev: PetActionState,
  formData: FormData,
): Promise<PetActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const result = await createPetFromForm(session.user.id, formData);
  if ('error' in result) return { error: result.error };

  revalidatePath('/pets');
  redirect(`/pet/${result.slug}`);
}

export async function addPetImagesAction(
  _prev: PetActionState,
  formData: FormData,
): Promise<PetActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const petId = String(formData.get('petId') ?? '');
  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      category: { select: { name: true } },
      breed: { select: { name: true } },
      _count: { select: { images: true } },
    },
  });
  if (!pet) return { error: 'Pet tapılmadı' };

  const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: 'Şəkil seçin' };

  const altBase = pet.breed?.name ? `${pet.name}, ${pet.breed.name}` : `${pet.name}, ${pet.category.name}`;
  let order = pet._count.images;
  for (const file of files.slice(0, MAX_IMAGES)) {
    try {
      const { stem } = await processImage(file, 'pets', altBase);
      await prisma.petImage.create({
        data: { petId: pet.id, url: stem, alt: `${altBase} — şəkil ${order + 1}`, order },
      });
      order += 1;
    } catch (err) {
      console.error('[addPetImages] skipped:', (err as Error).message);
    }
  }
  revalidatePath('/pet/[id]', 'page');
  return undefined;
}

export async function deletePetImageAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const imageId = String(formData.get('imageId') ?? '');
  const img = await prisma.petImage.findFirst({
    where: { id: imageId, pet: { ownerId: session.user.id } },
    select: { id: true, url: true, petId: true },
  });
  if (img) {
    await removeImage(img.url);
    await prisma.petImage.delete({ where: { id: img.id } });
    revalidatePath('/pet/[id]', 'page');
  }
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
