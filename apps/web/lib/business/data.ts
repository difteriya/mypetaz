import { prisma, Prisma } from '@mypet/db';

export function getServiceCategories() {
  return prisma.serviceCategory.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
}

export function getMyBusiness(userId: string) {
  return prisma.businessProfile.findUnique({
    where: { userId },
    include: {
      city: true,
      serviceCategories: { include: { serviceCategory: true } },
      serviceOfferings: { orderBy: { order: 'asc' } },
    },
  });
}

export type MyBusiness = NonNullable<Awaited<ReturnType<typeof getMyBusiness>>>;

export function getBusinessBySlug(slug: string) {
  return prisma.businessProfile.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      city: true,
      user: { select: { id: true } },
      serviceCategories: { include: { serviceCategory: true } },
      serviceOfferings: { orderBy: { order: 'asc' } },
    },
  });
}

export type BusinessDetail = NonNullable<Awaited<ReturnType<typeof getBusinessBySlug>>>;

export function listBusinesses(filter: { cityId?: string; serviceCategoryId?: string; q?: string }) {
  const where: Prisma.BusinessProfileWhereInput = { status: 'ACTIVE' };
  if (filter.cityId) where.cityId = filter.cityId;
  if (filter.serviceCategoryId) {
    where.serviceCategories = { some: { serviceCategoryId: filter.serviceCategoryId } };
  }
  if (filter.q) where.name = { contains: filter.q, mode: 'insensitive' };

  return prisma.businessProfile.findMany({
    where,
    include: {
      city: true,
      serviceCategories: { include: { serviceCategory: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
  });
}

export type BusinessListItem = Awaited<ReturnType<typeof listBusinesses>>[number];

/** Async view-count bump (fire-and-forget from the storefront). */
export function bumpBusinessView(id: string) {
  return prisma.businessProfile.update({ where: { id }, data: { viewCount: { increment: 1 } } });
}
