import { prisma, type NotificationType } from '@mypet/db';

/** Minimal in-app notification (the bell lives on mypet.az; no email here). */
export function notify(
  userId: string,
  type: NotificationType,
  message: string,
  link?: string,
  source?: string,
) {
  return prisma.notification.create({
    data: { userId, type, message, link: link ?? null, source: source ?? null },
  });
}
