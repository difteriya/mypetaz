import { prisma } from '@mypet/db';

export async function pendingCounts() {
  const [listings, businesses, blog, reviews, reports, vets] = await Promise.all([
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.businessProfile.count({ where: { status: 'PENDING' } }),
    prisma.blogPost.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.vetProfile.count({ where: { verified: false } }),
  ]);
  return { listings, businesses, blog, reviews, reports, vets };
}

export function pendingVets() {
  return prisma.vetProfile.findMany({
    where: { verified: false },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
}

export function allVets() {
  return prisma.vetProfile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });
}

export function pendingReports() {
  return prisma.report.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: { reporter: { select: { name: true, email: true } } },
  });
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

// ── Full lists (every status) for the admin catalog views ──

export function allListings() {
  return prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { pet: { select: { category: { select: { name: true } } } }, user: { select: { name: true, email: true } } },
  });
}

export function allBusinesses() {
  return prisma.businessProfile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { name: true, email: true } }, city: { select: { name: true } } },
  });
}

export function allBlogPosts() {
  return prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { category: { select: { name: true } }, user: { select: { name: true } } },
  });
}

export function allReports() {
  return prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { reporter: { select: { name: true, email: true } } },
  });
}

export async function allReviews() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
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

/** Everything an admin needs about one user: profile + all content they own. */
export function getUserDetail(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      accountType: true,
      blocked: true,
      createdAt: true,
      businessProfile: {
        select: { id: true, name: true, slug: true, status: true, viewCount: true, reviewCount: true },
      },
      vetProfile: {
        select: { id: true, clinicName: true, specialty: true, verified: true },
      },
      pets: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          asBusiness: true,
          category: { select: { name: true } },
          breed: { select: { name: true } },
        },
      },
      listings: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          featured: true,
          asBusiness: true,
          price: true,
          createdAt: true,
        },
      },
      blogPosts: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, slug: true, status: true, createdAt: true },
      },
    },
  });
}

export interface ReportTarget {
  label: string;
  href: string | null;
  /** True when the reported content no longer exists (deleted since). */
  missing: boolean;
}

/**
 * Reports store only `targetType` + `targetId`, so resolve them in one batch to
 * a link + label the admin can click — including already-reviewed reports.
 */
export async function resolveReportTargets(
  reports: { targetType: string; targetId: string }[],
): Promise<Map<string, ReportTarget>> {
  const idsOf = (type: string) =>
    reports.filter((r) => r.targetType === type).map((r) => r.targetId);

  const [listings, posts, businesses, reviews] = await Promise.all([
    prisma.listing.findMany({
      where: { id: { in: idsOf('LISTING') } },
      select: { id: true, title: true, slug: true },
    }),
    prisma.blogPost.findMany({
      where: { id: { in: idsOf('BLOG_POST') } },
      select: { id: true, title: true, slug: true },
    }),
    prisma.businessProfile.findMany({
      where: { id: { in: idsOf('BUSINESS') } },
      select: { id: true, name: true, slug: true },
    }),
    prisma.review.findMany({
      where: { id: { in: idsOf('REVIEW') } },
      select: { id: true, content: true, rating: true, user: { select: { name: true, email: true } } },
    }),
  ]);

  const map = new Map<string, ReportTarget>();
  for (const l of listings) {
    map.set(`LISTING:${l.id}`, { label: l.title, href: `/listings/${l.slug}`, missing: false });
  }
  for (const p of posts) {
    map.set(`BLOG_POST:${p.id}`, { label: p.title, href: `/blog/${p.slug}`, missing: false });
  }
  for (const b of businesses) {
    map.set(`BUSINESS:${b.id}`, { label: b.name, href: `/business/${b.slug}`, missing: false });
  }
  for (const r of reviews) {
    const who = r.user.name ?? r.user.email;
    const text = r.content ? `: ${r.content.slice(0, 60)}` : '';
    // Reviews have no page of their own — send the admin to the review queue.
    map.set(`REVIEW:${r.id}`, { label: `${who} (${r.rating}★)${text}`, href: '/admin/reviews', missing: false });
  }

  // Anything not found was deleted after the report was filed.
  for (const r of reports) {
    const key = `${r.targetType}:${r.targetId}`;
    if (!map.has(key)) map.set(key, { label: 'Silinib', href: null, missing: true });
  }
  return map;
}
