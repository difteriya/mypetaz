import { prisma } from '@mypet/db';

type TargetType = 'LISTING' | 'BUSINESS';

/** Approved reviews for a target, newest first (PLAN.md §2.4). */
export function listReviews(targetType: TargetType, targetId: string) {
  return prisma.review.findMany({
    where: { targetType, targetId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  });
}

export async function getReviewAggregate(targetType: TargetType, targetId: string) {
  const agg = await prisma.review.aggregate({
    where: { targetType, targetId, status: 'ACTIVE' },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return { avg: agg._avg.rating ?? null, count: agg._count._all };
}

export function getMyReview(userId: string, targetType: TargetType, targetId: string) {
  return prisma.review.findUnique({
    where: { userId_targetType_targetId: { userId, targetType, targetId } },
  });
}

/**
 * Recompute a business's cached avgRating/reviewCount from its ACTIVE reviews.
 * Called when a BUSINESS review is approved/removed (PLAN.md §2.4 cache).
 */
export async function recomputeBusinessRating(businessId: string) {
  const { avg, count } = await getReviewAggregate('BUSINESS', businessId);
  await prisma.businessProfile.update({
    where: { id: businessId },
    data: { avgRating: avg, reviewCount: count },
  });
  return { avg, count };
}
