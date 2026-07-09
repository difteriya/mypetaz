import { prisma } from '@mypet/db';

const authorSelect = {
  name: true,
  accountType: true,
  businessProfile: { select: { name: true, slug: true } },
} as const;

export function listBlogCategories() {
  return prisma.blogCategory.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
}

export function getBlogCategoryBySlug(slug: string) {
  return prisma.blogCategory.findFirst({ where: { slug, active: true } });
}

export function listPublishedPosts(categoryId?: string) {
  return prisma.blogPost.findMany({
    where: { status: 'ACTIVE', ...(categoryId ? { categoryId } : {}) },
    orderBy: { publishedAt: 'desc' },
    include: { category: true, user: { select: authorSelect } },
    take: 60,
  });
}

export type BlogListItem = Awaited<ReturnType<typeof listPublishedPosts>>[number];

export function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: { category: true, user: { select: authorSelect } },
  });
}

export function listMyPosts(userId: string) {
  return prisma.blogPost.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { category: true },
  });
}

export function getMyPost(id: string, userId: string) {
  return prisma.blogPost.findFirst({ where: { id, userId } });
}
