'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, slugify } from '@mypet/db';
import { auth } from '@mypet/auth';
import { listingCreateSchema } from './schema';

export type ListingActionState = { error?: string } | undefined;

export async function createListingAction(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const parsed = listingCreateSchema.safeParse({
    petId: formData.get('petId'),
    type: formData.get('type'),
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    cityId: formData.get('cityId'),
    address: formData.get('address'),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
    phone: formData.get('phone'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  }
  const data = parsed.data;

  const pet = await prisma.pet.findFirst({
    where: { id: data.petId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!pet) return { error: 'Pet tapılmadı' };

  const slug = `${slugify(data.title) || 'elan'}-${randomBytes(4).toString('hex')}`;

  // Created PENDING — not publicly visible until admin approval (PLAN.md §2.4).
  const listing = await prisma.listing.create({
    data: {
      type: data.type,
      petId: pet.id,
      userId: session.user.id,
      cityId: data.cityId ?? null,
      title: data.title,
      slug,
      description: data.description ?? null,
      price: data.price ?? null,
      address: data.address ?? null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
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
