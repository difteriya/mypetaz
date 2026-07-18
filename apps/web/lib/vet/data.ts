import { prisma } from '@mypet/db';

/** The current user's vet profile (application), if any. */
export function getMyVetProfile(userId: string) {
  return prisma.vetProfile.findUnique({ where: { userId } });
}
