'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { notify } from '@/lib/notifications/service';

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

  const petId = String(formData.get('petId') ?? '');
  const buyerContact = String(formData.get('buyerContact') ?? '').trim();
  if (!buyerContact) return { error: 'Alıcının e-poçt və ya telefonunu daxil edin' };

  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!pet) return { error: 'Pet tapılmadı və ya sahibi siz deyilsiniz' };

  const buyer = await prisma.user.findFirst({
    where: {
      OR: [{ email: { equals: buyerContact, mode: 'insensitive' } }, { phone: buyerContact }],
    },
    select: { id: true, name: true, email: true },
  });
  if (!buyer) return { error: 'Bu e-poçt/telefonla istifadəçi tapılmadı' };
  if (buyer.id === session.user.id) return { error: 'Peti özünüzə köçürə bilməzsiniz' };

  // Finish + link any of the owner's live listings for this pet.
  const listing = await prisma.listing.findFirst({
    where: { petId: pet.id, userId: session.user.id, status: { in: ['ACTIVE', 'PENDING'] } },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.pet.update({ where: { id: pet.id }, data: { ownerId: buyer.id } }),
    // Old owner's shared links must not keep working without the new owner's consent.
    prisma.petShareLink.updateMany({ where: { petId: pet.id, active: true }, data: { active: false } }),
    prisma.ownershipTransfer.create({
      data: {
        petId: pet.id,
        oldOwnerId: session.user.id,
        newOwnerId: buyer.id,
        listingId: listing?.id ?? null,
      },
    }),
    ...(listing ? [prisma.listing.update({ where: { id: listing.id }, data: { status: 'FINISHED' } })] : []),
  ]);

  await notify({
    userId: buyer.id,
    type: 'OWNERSHIP_TRANSFER',
    message: 'Bir pet sizin adınıza köçürüldü',
    link: '/pets',
    email: true,
  });

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
