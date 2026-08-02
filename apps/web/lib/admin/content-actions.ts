'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, slugify } from '@mypet/db';
import { auth } from '@mypet/auth';
import { recomputeBusinessRating } from '@/lib/reviews/data';

/**
 * Admin-wide edit/delete for user content (listings, businesses, blog posts,
 * vet profiles). The owner-facing actions stay ownership-scoped; these are the
 * moderation counterparts and are ADMIN-only.
 */
async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
  return session;
}

const id = (fd: FormData) => String(fd.get('id') ?? '');
const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim();
const opt = (fd: FormData, key: string) => str(fd, key) || null;

export type AdminEditState = { error?: string } | undefined;

const LISTING_TYPES = ['SALE', 'ADOPTION', 'LOST_FOUND', 'MATING'] as const;
const CONTENT_STATUSES = ['PENDING', 'ACTIVE', 'REJECTED', 'FINISHED'] as const;

// ---- Listings ----

export async function adminUpdateListingAction(
  _prev: AdminEditState,
  fd: FormData,
): Promise<AdminEditState> {
  await assertAdmin();
  const listingId = id(fd);
  const title = str(fd, 'title');
  if (title.length < 3) return { error: 'Başlıq ən azı 3 simvol olmalıdır' };

  const type = str(fd, 'type');
  const status = str(fd, 'status');
  if (!LISTING_TYPES.includes(type as (typeof LISTING_TYPES)[number])) return { error: 'Elan tipi yanlışdır' };
  if (!CONTENT_STATUSES.includes(status as (typeof CONTENT_STATUSES)[number])) return { error: 'Status yanlışdır' };

  const rawPrice = str(fd, 'price');
  const price = rawPrice ? Number(rawPrice) : null;
  if (price != null && (Number.isNaN(price) || price < 0)) return { error: 'Qiymət yanlışdır' };

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title,
      type: type as (typeof LISTING_TYPES)[number],
      status: status as (typeof CONTENT_STATUSES)[number],
      description: opt(fd, 'description'),
      price,
      cityId: opt(fd, 'cityId'),
      address: opt(fd, 'address'),
      phone: opt(fd, 'phone'),
      featured: fd.get('featured') === 'on',
      rejectionReason: opt(fd, 'rejectionReason'),
    },
  });

  revalidatePath('/admin/listings');
  revalidatePath('/');
  redirect('/admin/listings');
}

export async function adminDeleteListingAction(fd: FormData) {
  await assertAdmin();
  await prisma.listing.delete({ where: { id: id(fd) } });
  revalidatePath('/admin/listings');
  revalidatePath('/');
}

// ---- Businesses ----

export async function adminUpdateBusinessAction(
  _prev: AdminEditState,
  fd: FormData,
): Promise<AdminEditState> {
  await assertAdmin();
  const businessId = id(fd);
  const name = str(fd, 'name');
  if (name.length < 2) return { error: 'Ad ən azı 2 simvol olmalıdır' };

  const status = str(fd, 'status');
  if (!['PENDING', 'ACTIVE', 'REJECTED'].includes(status)) return { error: 'Status yanlışdır' };

  await prisma.businessProfile.update({
    where: { id: businessId },
    data: {
      name,
      status: status as 'PENDING' | 'ACTIVE' | 'REJECTED',
      description: opt(fd, 'description'),
      cityId: opt(fd, 'cityId'),
      address: opt(fd, 'address'),
      phone: opt(fd, 'phone'),
      rejectionReason: opt(fd, 'rejectionReason'),
    },
  });

  revalidatePath('/admin/businesses');
  redirect('/admin/businesses');
}

export async function adminDeleteBusinessAction(fd: FormData) {
  await assertAdmin();
  await prisma.businessProfile.delete({ where: { id: id(fd) } });
  revalidatePath('/admin/businesses');
}

// ---- Blog posts ----

export async function adminUpdateBlogPostAction(
  _prev: AdminEditState,
  fd: FormData,
): Promise<AdminEditState> {
  await assertAdmin();
  const postId = id(fd);
  const title = str(fd, 'title');
  const content = str(fd, 'content');
  if (title.length < 3) return { error: 'Başlıq ən azı 3 simvol olmalıdır' };
  if (content.length < 10) return { error: 'Məzmun çox qısadır' };

  const status = str(fd, 'status');
  if (!['PENDING', 'ACTIVE', 'REJECTED'].includes(status)) return { error: 'Status yanlışdır' };

  const current = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { status: true, publishedAt: true },
  });
  if (!current) return { error: 'Yazı tapılmadı' };

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      title,
      content,
      status: status as 'PENDING' | 'ACTIVE' | 'REJECTED',
      excerpt: opt(fd, 'excerpt'),
      categoryId: str(fd, 'categoryId') || undefined,
      metaTitle: opt(fd, 'metaTitle'),
      metaDescription: opt(fd, 'metaDescription'),
      rejectionReason: opt(fd, 'rejectionReason'),
      // Stamp the publish date the first time it goes live.
      publishedAt: status === 'ACTIVE' && !current.publishedAt ? new Date() : current.publishedAt,
    },
  });

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect('/admin/blog');
}

export async function adminDeleteBlogPostAction(fd: FormData) {
  await assertAdmin();
  await prisma.blogPost.delete({ where: { id: id(fd) } });
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}

// ---- Vet profiles ----

export async function adminUpdateVetAction(
  _prev: AdminEditState,
  fd: FormData,
): Promise<AdminEditState> {
  await assertAdmin();
  const vetId = id(fd);
  const clinicName = str(fd, 'clinicName');
  if (clinicName.length < 2) return { error: 'Klinika adı ən azı 2 simvol olmalıdır' };

  await prisma.vetProfile.update({
    where: { id: vetId },
    data: {
      clinicName,
      specialty: opt(fd, 'specialty'),
      about: opt(fd, 'about'),
      phone: opt(fd, 'phone'),
      address: opt(fd, 'address'),
      licenseNo: opt(fd, 'licenseNo'),
      verified: fd.get('verified') === 'on',
    },
  });

  revalidatePath('/admin/vets');
  revalidatePath('/vets');
  redirect('/admin/vets');
}

/** Remove a vet profile entirely. Appointments cascade with it. */
export async function adminDeleteVetAction(fd: FormData) {
  await assertAdmin();
  const vet = await prisma.vetProfile.delete({
    where: { id: id(fd) },
    select: { userId: true, user: { select: { role: true } } },
  });
  // Drop the now-meaningless VET label; ADMIN is never touched.
  if (vet.user.role === 'VET') {
    await prisma.user.update({ where: { id: vet.userId }, data: { role: 'USER' } });
  }
  revalidatePath('/admin/vets');
  revalidatePath('/vets');
}

// ---- Reviews (kept here so every content type is deletable) ----

export async function adminDeleteReviewAction(fd: FormData) {
  await assertAdmin();
  const review = await prisma.review.delete({
    where: { id: id(fd) },
    select: { targetType: true, targetId: true },
  });
  if (review.targetType === 'BUSINESS') await recomputeBusinessRating(review.targetId);
  revalidatePath('/admin/reviews');
}

// ---- Pets ----

export async function adminDeletePetAction(fd: FormData) {
  await assertAdmin();
  await prisma.pet.delete({ where: { id: id(fd) } });
  revalidatePath('/admin/users');
}

/** Re-slug helper used by the edit forms when a title changes materially. */
export async function adminReslugListingAction(fd: FormData) {
  await assertAdmin();
  const listingId = id(fd);
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { title: true },
  });
  if (!listing) return;
  const base = slugify(listing.title) || 'elan';
  await prisma.listing.update({
    where: { id: listingId },
    data: { slug: `${base}-${listingId.slice(-6)}` },
  });
  revalidatePath('/admin/listings');
}
