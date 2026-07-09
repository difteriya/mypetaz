import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { listConversations } from '@/lib/messages/data';

export const metadata: Metadata = { title: 'Mesajlar' };

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const conversations = await listConversations(session.user.id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Mesajlar</h1>

      {conversations.length === 0 ? (
        <p className="text-brand-900/50">Hələ söhbətiniz yoxdur.</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((c) => {
            const other = c.buyerId === session.user!.id ? c.seller : c.buyer;
            const last = c.messages[0];
            return (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-card bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{other.name ?? other.email}</p>
                    <p className="truncate text-xs text-brand-900/50">{c.listing.title}</p>
                    {last && <p className="truncate text-sm text-brand-900/70">{last.content}</p>}
                  </div>
                  {c.unread > 0 && (
                    <span className="shrink-0 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {c.unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
