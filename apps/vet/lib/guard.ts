import { auth } from '@mypet/auth';
import { prisma } from '@mypet/db';

/** The signed-in user's verified vet profile, or null (panel access gate, §7.1). */
export async function getVerifiedVet() {
  const session = await auth();
  if (!session?.user) return null;
  const vet = await prisma.vetProfile.findUnique({ where: { userId: session.user.id } });
  if (!vet?.verified) return null;
  return { session, vet };
}
