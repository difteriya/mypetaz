import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { listNotifications } from '@/lib/notifications/data';
import { markAllNotificationsReadAction } from '@/lib/notifications/actions';
import { notificationCategory, CATEGORY_TONE } from '@/lib/notifications/source-label';

export const metadata: Metadata = { title: 'Bildirişlər' };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const notifications = await listNotifications(session.user.id);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-700">Bildirişlər</h1>
        {hasUnread && (
          <form action={markAllNotificationsReadAction}>
            <Button variant="secondary" type="submit">
              Hamısını oxundu et
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-brand-900/50">Bildiriş yoxdur.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const cat = notificationCategory(n.type);
            const body = (
              <div
                className={`rounded-card p-4 text-sm transition-colors hover:bg-cream-50 ${
                  n.read ? 'bg-white' : 'border-l-4 border-brand-500 bg-brand-50'
                }`}
              >
                <span
                  className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_TONE[cat.tone]}`}
                >
                  {n.source ?? cat.label}
                </span>
                <p>{n.message}</p>
                <p className="mt-1 text-xs text-brand-900/40">
                  {n.createdAt.toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
            // Click-through marks the notification read, then follows the link.
            return (
              <li key={n.id}>
                {n.link ? <Link href={`/api/notifications/go/${n.id}`} prefetch={false}>{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
