import type { MetadataRoute } from 'next';
import { prisma } from '@mypet/db';
import { APP_URL } from '@/components/json-ld';

// Regenerate hourly so newly-approved content appears (ISR).
export const revalidate = 3600;

// Only ACTIVE content is included — consistent with the moderation rule (§8.4).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, businesses, posts, categories, blogCategories] = await Promise.all([
    prisma.listing.findMany({ where: { status: 'ACTIVE' }, select: { slug: true, updatedAt: true } }),
    prisma.businessProfile.findMany({ where: { status: 'ACTIVE' }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { status: 'ACTIVE' }, select: { slug: true, updatedAt: true } }),
    prisma.petCategory.findMany({
      where: { active: true },
      select: { slug: true, breeds: { where: { active: true }, select: { slug: true } } },
    }),
    prisma.blogCategory.findMany({ where: { active: true }, select: { slug: true } }),
  ]);

  const staticUrls: MetadataRoute.Sitemap = [
    '',
    '/listings',
    '/businesses',
    '/blog',
    '/about',
    '/contact',
    '/terms',
    '/privacy-policy',
  ].map((p) => ({ url: `${APP_URL}${p}`, changeFrequency: 'daily', priority: p === '' ? 1 : 0.7 }));

  const categoryUrls: MetadataRoute.Sitemap = categories.flatMap((c) => [
    { url: `${APP_URL}/listings/${c.slug}`, changeFrequency: 'daily' as const, priority: 0.8 },
    ...c.breeds.map((b) => ({
      url: `${APP_URL}/listings/${c.slug}/${b.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ]);

  return [
    ...staticUrls,
    ...categoryUrls,
    ...blogCategories.map((c) => ({ url: `${APP_URL}/blog/${c.slug}`, changeFrequency: 'weekly' as const })),
    ...listings.map((l) => ({ url: `${APP_URL}/listings/${l.slug}`, lastModified: l.updatedAt })),
    ...businesses.map((b) => ({ url: `${APP_URL}/business/${b.slug}`, lastModified: b.updatedAt })),
    ...posts.map((p) => ({ url: `${APP_URL}/blog/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
