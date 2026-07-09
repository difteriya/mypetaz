import { prisma, Prisma } from '@mypet/db';
import type { ListingFilter } from './schema';

// Card-shaped include reused across browse/similar/featured/dashboard.
const cardInclude = {
  pet: {
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
      category: true,
      breed: true,
    },
  },
  city: true,
  user: {
    select: {
      name: true,
      accountType: true,
      businessProfile: { select: { name: true, slug: true } },
    },
  },
} satisfies Prisma.ListingInclude;

export type ListingCard = Prisma.ListingGetPayload<{ include: typeof cardInclude }>;

function yearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

function buildWhere(filter: ListingFilter): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: 'ACTIVE' };
  if (filter.type) where.type = filter.type;
  if (filter.cityId) where.cityId = filter.cityId;

  if (filter.priceMin != null || filter.priceMax != null) {
    where.price = {};
    if (filter.priceMin != null) where.price.gte = filter.priceMin;
    if (filter.priceMax != null) where.price.lte = filter.priceMax;
  }

  const pet: Prisma.PetWhereInput = {};
  if (filter.categoryId) pet.categoryId = filter.categoryId;
  if (filter.breedId) pet.breedId = filter.breedId;
  if (filter.ageMin != null || filter.ageMax != null) {
    pet.birthDate = {};
    // older bound: born before now-ageMin years; younger bound: born after now-ageMax years
    if (filter.ageMin != null) pet.birthDate.lte = yearsAgo(filter.ageMin);
    if (filter.ageMax != null) pet.birthDate.gte = yearsAgo(filter.ageMax);
  }
  if (Object.keys(pet).length > 0) where.pet = pet;

  if (filter.q) {
    where.OR = [
      { title: { contains: filter.q, mode: 'insensitive' } },
      { description: { contains: filter.q, mode: 'insensitive' } },
    ];
  }
  return where;
}

export function getActiveListings(filter: ListingFilter) {
  return prisma.listing.findMany({
    where: buildWhere(filter),
    include: cardInclude,
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: 60,
  });
}

export function getFeaturedListings(take = 8) {
  return prisma.listing.findMany({
    where: { status: 'ACTIVE', featured: true },
    include: cardInclude,
    orderBy: { createdAt: 'desc' },
    take,
  });
}

export function getListingBySlug(slug: string) {
  return prisma.listing.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      pet: {
        include: {
          images: { orderBy: { order: 'asc' } },
          category: { include: { fields: { where: { active: true }, orderBy: { order: 'asc' } } } },
          breed: true,
        },
      },
      city: true,
      user: {
        select: {
          name: true,
          accountType: true,
          businessProfile: {
            select: { name: true, slug: true, logo: true, logoAlt: true },
          },
        },
      },
    },
  });
}

export type ListingDetail = NonNullable<Awaited<ReturnType<typeof getListingBySlug>>>;

export function getSimilarListings(listing: {
  id: string;
  cityId: string | null;
  pet: { categoryId: string; breedId: string | null };
}) {
  const or: Prisma.ListingWhereInput[] = [{ pet: { categoryId: listing.pet.categoryId } }];
  if (listing.pet.breedId) or.push({ pet: { breedId: listing.pet.breedId } });
  if (listing.cityId) or.push({ cityId: listing.cityId });

  return prisma.listing.findMany({
    where: { status: 'ACTIVE', id: { not: listing.id }, OR: or },
    include: cardInclude,
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: 8,
  });
}

export function listMyListings(userId: string) {
  return prisma.listing.findMany({
    where: { userId },
    include: cardInclude,
    orderBy: { createdAt: 'desc' },
  });
}

/** The user's pets that a listing can point to. */
export function getMyPetsForListing(userId: string) {
  return prisma.pet.findMany({
    where: { ownerId: userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      category: { select: { name: true, emoji: true } },
      breed: { select: { name: true } },
    },
  });
}

export function getCitiesList() {
  return prisma.city.findMany({ orderBy: { order: 'asc' } });
}

/** Categories + breeds for filter dropdowns (no dynamic fields needed). */
export function getCategoriesWithBreeds() {
  return prisma.petCategory.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: {
      breeds: { where: { active: true }, orderBy: { order: 'asc' }, select: { id: true, name: true } },
    },
  });
}
