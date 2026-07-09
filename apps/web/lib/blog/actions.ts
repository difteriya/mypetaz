'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, slugify } from '@mypet/db';
import { auth } from '@mypet/auth';
import { processImage, removeImage } from '@/lib/uploads';
import { blogPostSchema } from './schema';

export type BlogActionState = { error?: string } | undefined;

async function coverFrom(formData: FormData, title: string) {
  const file = formData.get('coverImage');
  if (file instanceof File && file.size > 0) {
    return (await processImage(file, 'blog', title)).stem;
  }
  return undefined;
}

export async function createBlogPostAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const parsed = blogPostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  const d = parsed.data;

  const isAdmin = session.user.role === 'ADMIN';
  let cover: string | undefined;
  try {
    cover = await coverFrom(formData, d.title);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Şəkil yüklənmədi' };
  }

  // Admin posts publish directly; everyone else goes through moderation (§2.12).
  await prisma.blogPost.create({
    data: {
      userId: session.user.id,
      categoryId: d.categoryId,
      title: d.title,
      slug: `${slugify(d.title) || 'yazi'}-${randomBytes(4).toString('hex')}`,
      excerpt: d.excerpt ?? null,
      content: d.content,
      coverImage: cover ?? null,
      coverAlt: cover ? d.title : null,
      status: isAdmin ? 'ACTIVE' : 'PENDING',
      publishedAt: isAdmin ? new Date() : null,
    },
  });

  revalidatePath('/dashboard/blog');
  redirect('/dashboard/blog');
}

export async function updateBlogPostAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const id = String(formData.get('postId') ?? '');
  const existing = await prisma.blogPost.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, coverImage: true },
  });
  if (!existing) return { error: 'Yazı tapılmadı' };

  const parsed = blogPostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  const d = parsed.data;

  const isAdmin = session.user.role === 'ADMIN';
  let cover: string | undefined;
  try {
    cover = await coverFrom(formData, d.title);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Şəkil yüklənmədi' };
  }
  if (cover && existing.coverImage) await removeImage(existing.coverImage);

  // A non-admin edit re-enters moderation (PLAN.md §2.12).
  await prisma.blogPost.update({
    where: { id: existing.id },
    data: {
      categoryId: d.categoryId,
      title: d.title,
      excerpt: d.excerpt ?? null,
      content: d.content,
      ...(cover ? { coverImage: cover, coverAlt: d.title } : {}),
      ...(isAdmin ? {} : { status: 'PENDING', publishedAt: null }),
    },
  });

  revalidatePath('/dashboard/blog');
  redirect('/dashboard/blog');
}

export async function deleteBlogPostAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const id = String(formData.get('postId') ?? '');
  const post = await prisma.blogPost.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, coverImage: true },
  });
  if (post) {
    if (post.coverImage) await removeImage(post.coverImage);
    await prisma.blogPost.delete({ where: { id: post.id } });
    revalidatePath('/dashboard/blog');
  }
}
