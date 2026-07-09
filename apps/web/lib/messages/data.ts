import { prisma } from '@mypet/db';

/** Conversations the user is part of, with last message + unread count. */
export async function listConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { updatedAt: 'desc' },
    include: {
      listing: { select: { title: true, slug: true, pet: { select: { images: { take: 1, orderBy: { order: 'asc' } } } } } },
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (conversations.length === 0) return [];

  const unread = await prisma.message.groupBy({
    by: ['conversationId'],
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderId: { not: userId },
      read: false,
    },
    _count: { _all: true },
  });
  const unreadMap = new Map(unread.map((u) => [u.conversationId, u._count._all]));

  return conversations.map((c) => ({ ...c, unread: unreadMap.get(c.id) ?? 0 }));
}

export function getConversation(id: string, userId: string) {
  return prisma.conversation.findFirst({
    where: { id, OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      listing: { select: { title: true, slug: true } },
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export function getConversationMessages(id: string, userId: string) {
  return prisma.message.findMany({
    where: { conversationId: id, conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, senderId: true, content: true, createdAt: true },
  });
}

/** Mark the other party's messages as read (PLAN.md §2.6). */
export function markConversationRead(id: string, userId: string) {
  return prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: userId }, read: false },
    data: { read: true },
  });
}

export function getUnreadTotal(userId: string) {
  return prisma.message.count({
    where: {
      read: false,
      senderId: { not: userId },
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });
}

export type ConversationListItem = Awaited<ReturnType<typeof listConversations>>[number];
