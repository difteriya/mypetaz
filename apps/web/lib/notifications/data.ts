import { prisma } from '@mypet/db';

export function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export function unreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
