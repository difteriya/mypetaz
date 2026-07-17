'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, slugify } from '@mypet/db';
import { auth } from '@mypet/auth';
import { createPetFromForm } from '@/lib/pets/actions';
import { listingCreateSchema, NEW_PET } from './schema';

export type ListingActionState = { error?: string } | undefined;

export async function createListingAction(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const rawPetId = String(formData.get('petId') ?? '');
  const creatingPet = rawPetId === NEW_PET;

  // Validate the listing fields first so a bad listing never leaves an orphan
  // pet behind. In new-pet mode petId is a placeholder here; the real id is
  // swapped in after the pet is created below.
  const parsed = listingCreateSchema.safeParse({
    petId: creatingPet ? 'new' : rawPetId,
    type: formData.get('type'),
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    cityId: formData.get('cityId'),
    address: formData.get('address'),
    phone: formData.get('phone'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  }
  const data = parsed.data;

  // Resolve the pet: either create a new one inline, or use an existing one the
  // user owns. The pet's own `description` arrives under `petDescription` to
  // avoid clashing with the listing's `description`.
  let petId: string;
  if (creatingPet) {
    const created = await createPetFromForm(session.user.id, formData, {
      descriptionKey: 'petDescription',
    });
    if ('error' in created) return { error: created.error };
    petId = created.petId;
  } else {
    const pet = await prisma.pet.findFirst({
      where: { id: data.petId, ownerId: session.user.id },
      select: { id: true },
    });
    if (!pet) return { error: 'Pet tapılmadı' };
    petId = pet.id;
  }

  const slug = `${slugify(data.title) || 'elan'}-${randomBytes(4).toString('hex')}`;

  // Created PENDING — not publicly visible until admin approval (PLAN.md §2.4).
  const listing = await prisma.listing.create({
    data: {
      type: data.type,
      petId,
      userId: session.user.id,
      cityId: data.cityId ?? null,
      title: data.title,
      slug,
      description: data.description ?? null,
      price: data.price ?? null,
      address: data.address ?? null,
      phone: data.phone,
    },
    select: { id: true },
  });

  revalidatePath('/dashboard/listings');
  redirect(`/dashboard/listings?created=${listing.id}`);
}

export async function deleteListingAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const listingId = String(formData.get('listingId') ?? '');
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, userId: session.user.id },
    select: { id: true },
  });
  if (listing) {
    await prisma.listing.delete({ where: { id: listing.id } });
    revalidatePath('/dashboard/listings');
  }
  redirect('/dashboard/listings');
}
