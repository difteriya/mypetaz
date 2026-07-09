'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';

export type TransferActionState = { error?: string; ok?: string } | undefined;

/**
 * Seller-triggered ownership transfer (PLAN.md §2.5). The seller confirms and
 * the transfer executes atomically: pet.ownerId moves (full history follows the
 * pet), active share links deactivate, an OwnershipTransfer record is written
 * (for admin rollback), and the listing is finished.
 */
export async function transferOwnershipAction(
  _prev: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const listingId = String(formData.get('listingId') ?? '');
  const buyerContact = String(formData.get('buyerContact') ?? '').trim();
  if (!buyerContact) return { error: 'Alıcının e-poçt və ya telefonunu daxil edin' };

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, userId: session.user.id },
    include: { pet: { select: { id: true, ownerId: true } } },
  });
  if (!listing) return { error: 'Elan tapılmadı' };
  if (listing.pet.ownerId !== session.user.id) {
    return { error: 'Bu petin sahibi artıq siz deyilsiniz' };
  }

  const buyer = await prisma.user.findFirst({
    where: {
      OR: [{ email: { equals: buyerContact, mode: 'insensitive' } }, { phone: buyerContact }],
    },
    select: { id: true, name: true, email: true },
  });
  if (!buyer) return { error: 'Bu e-poçt/telefonla istifadəçi tapılmadı' };
  if (buyer.id === session.user.id) return { error: 'Peti özünüzə köçürə bilməzsiniz' };

  await prisma.$transaction([
    prisma.pet.update({ where: { id: listing.pet.id }, data: { ownerId: buyer.id } }),
    // Old owner's shared links must not keep working without the new owner's consent.
    prisma.petShareLink.updateMany({ where: { petId: listing.pet.id, active: true }, data: { active: false } }),
    prisma.ownershipTransfer.create({
      data: {
        petId: listing.pet.id,
        oldOwnerId: session.user.id,
        newOwnerId: buyer.id,
        listingId: listing.id,
      },
    }),
    prisma.listing.update({ where: { id: listing.id }, data: { status: 'FINISHED' } }),
  ]);

  revalidatePath('/dashboard/listings');
  revalidatePath('/pets');
  return { ok: `Sahiblik ${buyer.name ?? buyer.email} istifadəçisinə köçürüldü` };
}

/** Admin-only rollback for disputes/errors (PLAN.md §2.5). UI arrives in §14. */
export async function revertTransferAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const transferId = String(formData.get('transferId') ?? '');
  const transfer = await prisma.ownershipTransfer.findFirst({
    where: { id: transferId, reverted: false },
  });
  if (!transfer) return;

  await prisma.$transaction([
    prisma.pet.update({ where: { id: transfer.petId }, data: { ownerId: transfer.oldOwnerId } }),
    prisma.ownershipTransfer.update({ where: { id: transfer.id }, data: { reverted: true } }),
  ]);

  revalidatePath('/admin/transfers');
}
