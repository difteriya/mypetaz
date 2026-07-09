import { prisma } from '@mypet/db';

export async function pendingCounts() {
  const [listings, businesses, blog, reviews] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.businessProfile.count({ where: { status: 'PENDING' } }),
    prisma.blogPost.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
  ]);
  return { listings, businesses, blog, reviews };
}

export function pendingListings() {
  return prisma.listing.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: { pet: { select: { category: { select: { name: true } } } }, user: { select: { name: true, email: true } } },
  });
}

export function recentActiveListings() {
  return prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { id: true, title: true, slug: true, featured: true },
  });
}

export function pendingBusinesses() {
  return prisma.businessProfile.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { name: true, email: true } }, city: { select: { name: true } } },
  });
}

export function pendingBlogPosts() {
  return prisma.blogPost.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: { category: { select: { name: true } }, user: { select: { name: true } } },
  });
}

/** Pending reviews with a resolved target label. */
export async function pendingReviews() {
  const reviews = await prisma.review.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { name: true } } },
  });

  const listingIds = reviews.filter((r) => r.targetType === 'LISTING').map((r) => r.targetId);
  const bizIds = reviews.filter((r) => r.targetType === 'BUSINESS').map((r) => r.targetId);
  const [listings, businesses] = await Promise.all([
    prisma.listing.findMany({ where: { id: { in: listingIds } }, select: { id: true, title: true } }),
    prisma.businessProfile.findMany({ where: { id: { in: bizIds } }, select: { id: true, name: true } }),
  ]);
  const labels = new Map<string, string>([
    ...listings.map((l) => [l.id, l.title] as const),
    ...businesses.map((b) => [b.id, b.name] as const),
  ]);

  return reviews.map((r) => ({ ...r, targetLabel: labels.get(r.targetId) ?? r.targetId }));
}

export function recentTransfers() {
  return prisma.ownershipTransfer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      pet: { select: { name: true } },
      oldOwner: { select: { name: true, email: true } },
      newOwner: { select: { name: true, email: true } },
    },
  });
}

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { id: true, name: true, email: true, role: true, accountType: true, blocked: true, createdAt: true },
  });
}
