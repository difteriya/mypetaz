import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { prisma } from '@mypet/db';

/** Click-through: mark the notification read, then follow its link. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const n = await prisma.notification.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, link: true },
  });
  if (!n) redirect('/dashboard/notifications');

  await prisma.notification.update({ where: { id: n.id }, data: { read: true } });
  redirect(n.link ?? '/dashboard/notifications');
}
