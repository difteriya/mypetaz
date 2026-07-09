'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';

/** Start (or reopen) a conversation with a listing's seller (PLAN.md §2.6). */
export async function startConversationAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const listingId = String(formData.get('listingId') ?? '');
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: 'ACTIVE' },
    select: { id: true, userId: true },
  });
  if (!listing) redirect('/listings');
  if (listing.userId === session.user.id) redirect(`/listings`); // can't message yourself

  const existing = await prisma.conversation.findUnique({
    where: { listingId_buyerId: { listingId: listing.id, buyerId: session.user.id } },
    select: { id: true },
  });
  const conversation =
    existing ??
    (await prisma.conversation.create({
      data: { listingId: listing.id, buyerId: session.user.id, sellerId: listing.userId },
      select: { id: true },
    }));

  redirect(`/messages/${conversation.id}`);
}

export type SendState = { error?: string } | undefined;

export async function sendMessageAction(_prev: SendState, formData: FormData): Promise<SendState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const conversationId = String(formData.get('conversationId') ?? '');
  const content = String(formData.get('content') ?? '').trim();
  if (!content) return { error: 'Boş mesaj göndərilə bilməz' };
  if (content.length > 2000) return { error: 'Mesaj çox uzundur' };

  const convo = await prisma.conversation.findFirst({
    where: { id: conversationId, OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] },
    select: { id: true },
  });
  if (!convo) return { error: 'Söhbət tapılmadı' };

  await prisma.$transaction([
    prisma.message.create({ data: { conversationId: convo.id, senderId: session.user.id, content } }),
    prisma.conversation.update({ where: { id: convo.id }, data: { updatedAt: new Date() } }),
  ]);
  // NEW_MESSAGE notification is created by the notifications system (step 15).

  revalidatePath(`/messages/${convo.id}`);
  return undefined;
}
