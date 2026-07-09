'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  revalidatePath('/dashboard/notifications');
}
