import { prisma } from '@mypet/db';

export interface SharedFields {
  basicInfo: boolean;
  passport: boolean;
  medicalHistory: boolean;
}

export function getShareLinksForPet(petId: string, ownerId: string) {
  return prisma.petShareLink.findMany({
    where: { petId, pet: { ownerId } },
    orderBy: { createdAt: 'desc' },
  });
}

/** Public read — only an ACTIVE link resolves (PLAN.md §2.11). */
export function getSharedByToken(token: string) {
  return prisma.petShareLink.findFirst({
    where: { token, active: true },
    include: {
      pet: {
        include: {
          images: { orderBy: { order: 'asc' } },
          category: true,
          breed: true,
          passport: true,
          healthRecords: {
            orderBy: { date: 'desc' },
            include: {
              addedBy: { select: { id: true, name: true } },
              vetAppointment: { select: { vet: { select: { clinicName: true } } } },
            },
          },
        },
      },
    },
  });
}

export type SharedPet = NonNullable<Awaited<ReturnType<typeof getSharedByToken>>>;

export function bumpShareView(token: string) {
  return prisma.petShareLink.updateMany({ where: { token }, data: { viewCount: { increment: 1 } } });
}
