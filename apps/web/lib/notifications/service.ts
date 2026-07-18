import 'server-only';
import { prisma, type NotificationType } from '@mypet/db';
import { sendEmail } from '@/lib/email/send';

const APP_URL = process.env.APP_URL ?? 'https://mypet.az';

/**
 * Create an in-app notification and optionally email it (PLAN.md §2.13).
 * Email is reserved for important events (approval/rejection, transfer).
 */
export async function notify(params: {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
  /** Who it came from (clinic/business/user name); UI falls back to a type category. */
  source?: string;
  email?: boolean;
}): Promise<void> {
  const { userId, type, message, link, source, email } = params;

  await prisma.notification.create({
    data: { userId, type, message, link: link ?? null, source: source ?? null },
  });

  if (email) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
      const href = link ? `${APP_URL}${link}` : APP_URL;
      await sendEmail({
        to: user.email,
        subject: message,
        html: `<p>${message}</p><p><a href="${href}">Bax</a></p>`,
      });
    }
  }
}
