'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { recomputeBusinessRating } from '@/lib/reviews/data';

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
  return session;
}

const id = (fd: FormData) => String(fd.get('id') ?? '');
const reason = (fd: FormData) => {
  const r = String(fd.get('reason') ?? '').trim();
  return r || null;
};

// ---- Listings ----
export async function approveListingAction(fd: FormData) {
  await assertAdmin();
  await prisma.listing.update({ where: { id: id(fd) }, data: { status: 'ACTIVE', rejectionReason: null } });
  revalidatePath('/admin/listings');
}
export async function rejectListingAction(fd: FormData) {
  await assertAdmin();
  await prisma.listing.update({ where: { id: id(fd) }, data: { status: 'REJECTED', rejectionReason: reason(fd) } });
  revalidatePath('/admin/listings');
}
export async function toggleFeaturedAction(fd: FormData) {
  await assertAdmin();
  const listing = await prisma.listing.findUnique({ where: { id: id(fd) }, select: { featured: true } });
  if (listing) {
    await prisma.listing.update({ where: { id: id(fd) }, data: { featured: !listing.featured } });
    revalidatePath('/admin/listings');
  }
}

// ---- Businesses ----
export async function approveBusinessAction(fd: FormData) {
  await assertAdmin();
  await prisma.businessProfile.update({
    where: { id: id(fd) },
    data: { status: 'ACTIVE', approvedAt: new Date(), rejectionReason: null },
  });
  revalidatePath('/admin/businesses');
}
export async function rejectBusinessAction(fd: FormData) {
  await assertAdmin();
  await prisma.businessProfile.update({ where: { id: id(fd) }, data: { status: 'REJECTED', rejectionReason: reason(fd) } });
  revalidatePath('/admin/businesses');
}

// ---- Blog (SEO meta filled at approval, §2.12) ----
export async function approveBlogAction(fd: FormData) {
  await assertAdmin();
  await prisma.blogPost.update({
    where: { id: id(fd) },
    data: {
      status: 'ACTIVE',
      publishedAt: new Date(),
      rejectionReason: null,
      metaTitle: String(fd.get('metaTitle') ?? '').trim() || null,
      metaDescription: String(fd.get('metaDescription') ?? '').trim() || null,
    },
  });
  revalidatePath('/admin/blog');
}
export async function rejectBlogAction(fd: FormData) {
  await assertAdmin();
  await prisma.blogPost.update({ where: { id: id(fd) }, data: { status: 'REJECTED', rejectionReason: reason(fd) } });
  revalidatePath('/admin/blog');
}

// ---- Reviews (recompute business cache on approval) ----
export async function approveReviewAction(fd: FormData) {
  await assertAdmin();
  const review = await prisma.review.update({
    where: { id: id(fd) },
    data: { status: 'ACTIVE', rejectionReason: null },
  });
  if (review.targetType === 'BUSINESS') await recomputeBusinessRating(review.targetId);
  revalidatePath('/admin/reviews');
}
export async function rejectReviewAction(fd: FormData) {
  await assertAdmin();
  const review = await prisma.review.update({
    where: { id: id(fd) },
    data: { status: 'REJECTED', rejectionReason: reason(fd) },
  });
  if (review.targetType === 'BUSINESS') await recomputeBusinessRating(review.targetId);
  revalidatePath('/admin/reviews');
}

// ---- Ownership transfer rollback ----
export async function adminRevertTransferAction(fd: FormData) {
  await assertAdmin();
  const transfer = await prisma.ownershipTransfer.findFirst({ where: { id: id(fd), reverted: false } });
  if (transfer) {
    await prisma.$transaction([
      prisma.pet.update({ where: { id: transfer.petId }, data: { ownerId: transfer.oldOwnerId } }),
      prisma.ownershipTransfer.update({ where: { id: transfer.id }, data: { reverted: true } }),
    ]);
    revalidatePath('/admin/transfers');
  }
}

// ---- Users ----
export async function setUserBlockedAction(fd: FormData) {
  await assertAdmin();
  const userId = id(fd);
  const blocked = fd.get('blocked') === 'true';
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (target && target.role !== 'ADMIN') {
    await prisma.user.update({ where: { id: userId }, data: { blocked } });
    revalidatePath('/admin/users');
  }
}
