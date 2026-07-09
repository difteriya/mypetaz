import { prisma, Prisma } from '@mypet/db';

const cardInclude = {
  pet: { include: { images: { orderBy: { order: 'asc' }, take: 1 }, category: true, breed: true } },
  city: true,
  user: { select: { name: true, accountType: true, businessProfile: { select: { name: true, slug: true } } } },
} satisfies Prisma.ListingInclude;

/** A user's favorited listings that are still ACTIVE (PLAN.md §2.8). */
export async function listFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId, listing: { status: 'ACTIVE' } },
    orderBy: { createdAt: 'desc' },
    include: { listing: { include: cardInclude } },
  });
  return favorites.map((f) => f.listing);
}

export async function isFavorited(userId: string, listingId: string): Promise<boolean> {
  const fav = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
    select: { userId: true },
  });
  return fav !== null;
}
