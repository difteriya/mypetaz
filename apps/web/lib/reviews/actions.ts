'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { reviewSchema } from './schema';

export type ReviewActionState = { error?: string; ok?: string } | undefined;

/** Verify the reviewer isn't the owner of the target. */
async function isOwnTarget(targetType: 'LISTING' | 'BUSINESS', targetId: string, userId: string) {
  if (targetType === 'LISTING') {
    const l = await prisma.listing.findUnique({ where: { id: targetId }, select: { userId: true } });
    return l?.userId === userId;
  }
  const b = await prisma.businessProfile.findUnique({ where: { id: targetId }, select: { userId: true } });
  return b?.userId === userId;
}

export async function submitReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };
  const { targetType, targetId, rating, content } = parsed.data;

  if (await isOwnTarget(targetType, targetId, session.user.id)) {
    return { error: 'Öz elanınıza/biznesinizə rəy yaza bilməzsiniz' };
  }

  // One review per user per target; edits re-enter moderation (PLAN.md §2.4).
  await prisma.review.upsert({
    where: { userId_targetType_targetId: { userId: session.user.id, targetType, targetId } },
    create: { userId: session.user.id, targetType, targetId, rating, content: content ?? null, status: 'PENDING' },
    update: { rating, content: content ?? null, status: 'PENDING' },
  });

  if (targetType === 'LISTING') {
    const l = await prisma.listing.findUnique({ where: { id: targetId }, select: { slug: true } });
    if (l) revalidatePath(`/listings/${l.slug}`);
  }
  return { ok: 'Rəyiniz göndərildi və admin təsdiqindən sonra dərc olunacaq' };
}
