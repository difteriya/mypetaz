import { auth } from '@mypet/auth';
import { prisma } from '@mypet/db';
import { listNotifications, unreadNotificationCount } from '@/lib/notifications/data';

/** Recent notifications + unread count for the header bell dropdown. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ items: [], unread: 0 });

  const [items, unread] = await Promise.all([
    listNotifications(session.user.id),
    unreadNotificationCount(session.user.id),
  ]);

  return Response.json({
    unread,
    items: items.slice(0, 12).map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

/** Mark all of the user's notifications read (from the dropdown). */
export async function POST() {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });
  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  return Response.json({ ok: true });
}
