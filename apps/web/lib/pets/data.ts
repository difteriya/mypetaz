import { prisma } from '@mypet/db';

// Reads used by server components. (Mutations live in ./actions with 'use server'.)

/** Categories with their active breeds + dynamic field defs — drives the create form. */
export function getCategoriesForForm() {
  return prisma.petCategory.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: {
      breeds: {
        where: { active: true },
        orderBy: { order: 'asc' },
        select: { id: true, name: true, slug: true },
      },
      fields: {
        where: { active: true },
        orderBy: { order: 'asc' },
      },
    },
  });
}

export type CategoryForForm = Awaited<ReturnType<typeof getCategoriesForForm>>[number];

/** A user's own pets ("Mənim petlərim", PLAN.md §2.8). */
export function listMyPets(ownerId: string) {
  return prisma.pet.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      breed: true,
      images: { orderBy: { order: 'asc' } },
    },
  });
}

/** "Köçürülmüş" archive — pets this user transferred away (read-only, PLAN.md §2.5). */
export function getMyTransfersArchive(oldOwnerId: string) {
  return prisma.ownershipTransfer.findMany({
    where: { oldOwnerId, reverted: false },
    orderBy: { createdAt: 'desc' },
    include: {
      pet: { select: { name: true, category: { select: { name: true, emoji: true } } } },
      newOwner: { select: { name: true, email: true } },
    },
  });
}

const petFullInclude = {
  category: {
    include: { fields: { where: { active: true }, orderBy: { order: 'asc' } } },
  },
  breed: true,
  images: { orderBy: { order: 'asc' } },
  passport: true,
  healthRecords: {
    orderBy: { date: 'desc' },
    include: {
      addedBy: { select: { id: true, name: true } },
      vetAppointment: { select: { vet: { select: { clinicName: true } } } },
    },
  },
} as const;

/** A single pet, scoped to its owner (full view). Accepts a slug or an id. */
export function getPetForOwner(handle: string, ownerId: string) {
  return prisma.pet.findFirst({
    where: { ownerId, OR: [{ id: handle }, { slug: handle }] },
    include: petFullInclude,
  });
}

/**
 * A single pet visible to a treating vet — read-only (§7.4). The viewer must
 * have a verified VetProfile AND at least one appointment for this pet; the
 * appointment is the authorization. Same shape as getPetForOwner.
 */
export async function getPetForTreatingVet(handle: string, viewerUserId: string) {
  const vet = await prisma.vetProfile.findFirst({
    where: { userId: viewerUserId, verified: true },
    select: { id: true },
  });
  if (!vet) return null;

  const pet = await prisma.pet.findFirst({
    where: {
      OR: [{ id: handle }, { slug: handle }],
      vetAppointments: { some: { vetId: vet.id } },
    },
    include: petFullInclude,
  });
  return pet;
}
