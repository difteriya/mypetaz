'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';

export type ToggleResult = { favorited: boolean; needsLogin?: boolean };

export async function toggleFavoriteAction(listingId: string): Promise<ToggleResult> {
  const session = await auth();
  if (!session?.user) return { favorited: false, needsLogin: true };

  const key = { userId_listingId: { userId: session.user.id, listingId } };
  const existing = await prisma.favorite.findUnique({ where: key, select: { userId: true } });

  if (existing) {
    await prisma.favorite.delete({ where: key });
  } else {
    await prisma.favorite.create({ data: { userId: session.user.id, listingId } });
  }

  revalidatePath('/dashboard/favorites');
  return { favorited: !existing };
}
