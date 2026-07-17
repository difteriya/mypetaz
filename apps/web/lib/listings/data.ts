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

export function getLatestListings(take = 8) {
  return prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    include: cardInclude,
    orderBy: { createdAt: 'desc' },
    take,
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

const detailInclude = {
  pet: {
    include: {
      images: { orderBy: { order: 'asc' } },
      category: { include: { fields: { where: { active: true }, orderBy: { order: 'asc' } } } },
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
  city: true,
  user: {
    select: {
      name: true,
      accountType: true,
      businessProfile: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          logoAlt: true,
          address: true,
          avgRating: true,
          reviewCount: true,
          city: { select: { name: true } },
        },
      },
    },
  },
} satisfies Prisma.ListingInclude;

export function getListingBySlug(slug: string) {
  return prisma.listing.findFirst({ where: { slug, status: 'ACTIVE' }, include: detailInclude });
}

/** Any-status lookup for admin preview (a PENDING/REJECTED listing isn't public). */
export function getListingBySlugForAdmin(slug: string) {
  return prisma.listing.findFirst({ where: { slug }, include: detailInclude });
}

export function countActiveListingsByUser(userId: string) {
  return prisma.listing.count({ where: { userId, status: 'ACTIVE' } });
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

/** A business's public listings (for the storefront, PLAN.md §2.7). */
export function getActiveListingsByUser(userId: string) {
  return prisma.listing.findMany({
    where: { userId, status: 'ACTIVE' },
    include: cardInclude,
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
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

// --- SEO landing helpers (PLAN.md §8.1) ---
export function getPetCategoryBySlug(slug: string) {
  return prisma.petCategory.findFirst({
    where: { slug, active: true },
    include: { breeds: { where: { active: true }, orderBy: { order: 'asc' }, select: { id: true, name: true, slug: true } } },
  });
}

export function getBreedBySlugInCategory(categoryId: string, breedSlug: string) {
  return prisma.breed.findFirst({ where: { categoryId, slug: breedSlug, active: true } });
}

/** Any-status lookup — lets a FINISHED/removed listing render a "gone" page (§8.4). */
export function getListingStatusBySlug(slug: string) {
  return prisma.listing.findUnique({ where: { slug }, select: { status: true } });
}

/** Active listing count per category id (for home category cards). */
export async function getCategoryListingCounts(): Promise<Record<string, number>> {
  const rows = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    select: { pet: { select: { categoryId: true } } },
  });
  const map: Record<string, number> = {};
  for (const r of rows) map[r.pet.categoryId] = (map[r.pet.categoryId] ?? 0) + 1;
  return map;
}

export async function getPublicCounts() {
  const [listings, businesses, posts] = await Promise.all([
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.businessProfile.count({ where: { status: 'ACTIVE' } }),
    prisma.blogPost.count({ where: { status: 'ACTIVE' } }),
  ]);
  return { listings, businesses, posts };
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
