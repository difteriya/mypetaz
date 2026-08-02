'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { recomputeBusinessRating } from '@/lib/reviews/data';
import { notify } from '@/lib/notifications/service';
import { hashPassword } from '@mypet/auth/password';

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
  const l = await prisma.listing.update({
    where: { id: id(fd) },
    data: { status: 'ACTIVE', rejectionReason: null },
    select: { userId: true, slug: true, title: true },
  });
  await notify({
    userId: l.userId,
    type: 'LISTING_APPROVED',
    message: `Elanınız təsdiqləndi: ${l.title}`,
    link: `/listings/${l.slug}`,
    email: true,
  });
  revalidatePath('/admin/listings');
}
export async function rejectListingAction(fd: FormData) {
  await assertAdmin();
  const r = reason(fd);
  const l = await prisma.listing.update({
    where: { id: id(fd) },
    data: { status: 'REJECTED', rejectionReason: r },
    select: { userId: true, title: true },
  });
  await notify({
    userId: l.userId,
    type: 'LISTING_REJECTED',
    message: `Elanınız rədd edildi: ${l.title}${r ? ` — ${r}` : ''}`,
    link: '/dashboard/listings',
    email: true,
  });
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
  const b = await prisma.businessProfile.update({
    where: { id: id(fd) },
    data: { status: 'ACTIVE', approvedAt: new Date(), rejectionReason: null },
    select: { userId: true, slug: true, name: true },
  });
  await notify({
    userId: b.userId,
    type: 'BUSINESS_APPROVED',
    message: `Biznes profiliniz təsdiqləndi: ${b.name}`,
    link: `/business/${b.slug}`,
    email: true,
  });
  revalidatePath('/admin/businesses');
}
export async function rejectBusinessAction(fd: FormData) {
  await assertAdmin();
  const r = reason(fd);
  const b = await prisma.businessProfile.update({
    where: { id: id(fd) },
    data: { status: 'REJECTED', rejectionReason: r },
    select: { userId: true, name: true },
  });
  await notify({
    userId: b.userId,
    type: 'BUSINESS_REJECTED',
    message: `Biznes profiliniz rədd edildi: ${b.name}${r ? ` — ${r}` : ''}`,
    link: '/dashboard/business',
    email: true,
  });
  revalidatePath('/admin/businesses');
}

// ---- Blog (SEO meta filled at approval, §2.12) ----
export async function approveBlogAction(fd: FormData) {
  await assertAdmin();
  const p = await prisma.blogPost.update({
    where: { id: id(fd) },
    data: {
      status: 'ACTIVE',
      publishedAt: new Date(),
      rejectionReason: null,
      metaTitle: String(fd.get('metaTitle') ?? '').trim() || null,
      metaDescription: String(fd.get('metaDescription') ?? '').trim() || null,
    },
    select: { userId: true, slug: true, title: true },
  });
  await notify({
    userId: p.userId,
    type: 'BLOG_APPROVED',
    message: `Yazınız dərc edildi: ${p.title}`,
    link: `/blog/${p.slug}`,
    email: true,
  });
  revalidatePath('/admin/blog');
}
export async function rejectBlogAction(fd: FormData) {
  await assertAdmin();
  const r = reason(fd);
  const p = await prisma.blogPost.update({
    where: { id: id(fd) },
    data: { status: 'REJECTED', rejectionReason: r },
    select: { userId: true, title: true },
  });
  await notify({
    userId: p.userId,
    type: 'BLOG_REJECTED',
    message: `Yazınız rədd edildi: ${p.title}${r ? ` — ${r}` : ''}`,
    link: '/dashboard/blog',
    email: true,
  });
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
  await notify({ userId: review.userId, type: 'REVIEW_APPROVED', message: 'Rəyiniz təsdiqləndi' });
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

// ---- Reports (post-publish community oversight, §2.13) ----
export async function markReportReviewedAction(fd: FormData) {
  await assertAdmin();
  await prisma.report.update({ where: { id: id(fd) }, data: { status: 'REVIEWED' } });
  revalidatePath('/admin/reports');
}

export async function deactivateReportedContentAction(fd: FormData) {
  await assertAdmin();
  const report = await prisma.report.findUnique({ where: { id: id(fd) } });
  if (!report) return;

  switch (report.targetType) {
    case 'LISTING':
      await prisma.listing.updateMany({ where: { id: report.targetId }, data: { status: 'REJECTED' } });
      break;
    case 'BLOG_POST':
      await prisma.blogPost.updateMany({ where: { id: report.targetId }, data: { status: 'REJECTED' } });
      break;
    case 'BUSINESS':
      await prisma.businessProfile.updateMany({ where: { id: report.targetId }, data: { status: 'REJECTED' } });
      break;
    case 'REVIEW': {
      const r = await prisma.review.findUnique({ where: { id: report.targetId } });
      if (r) {
        await prisma.review.update({ where: { id: r.id }, data: { status: 'REJECTED' } });
        if (r.targetType === 'BUSINESS') await recomputeBusinessRating(r.targetId);
      }
      break;
    }
  }
  await prisma.report.update({ where: { id: report.id }, data: { status: 'REVIEWED' } });
  revalidatePath('/admin/reports');
}

// ---- Users ----
const ROLES = ['USER', 'VET', 'ADMIN'];

export async function createUserAction(fd: FormData) {
  await assertAdmin();
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const name = String(fd.get('name') ?? '').trim() || null;
  const password = String(fd.get('password') ?? '');
  const role = String(fd.get('role') ?? 'USER');
  if (!email || password.length < 8 || !ROLES.includes(role)) return;

  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return;

  await prisma.user.create({
    data: { email, name, role: role as 'USER' | 'VET' | 'ADMIN', passwordHash: await hashPassword(password) },
  });
  revalidatePath('/admin/users');
}

/**
 * Change an existing user's role — this is how admins are appointed.
 * You cannot change your own role, so the last admin can never lock themselves
 * out by accident. The new role takes effect on the user's next login (the role
 * is carried in the session token).
 */
export async function setUserRoleAction(fd: FormData) {
  const session = await assertAdmin();
  const userId = id(fd);
  const role = String(fd.get('role') ?? '');
  if (!ROLES.includes(role) || userId === session!.user.id) return;

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as 'USER' | 'VET' | 'ADMIN' },
  });
  revalidatePath('/admin/users');
}

export async function deleteUserAction(fd: FormData) {
  const session = await assertAdmin();
  const userId = id(fd);
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  // Never delete admins or yourself.
  if (target && target.role !== 'ADMIN' && userId !== session!.user.id) {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/admin/users');
  }
}

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
