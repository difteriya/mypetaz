import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getConversation, markConversationRead } from '@/lib/messages/data';
import { MessageThread } from './message-thread';

export const metadata: Metadata = { title: 'Söhbət' };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const convo = await getConversation(id, session.user.id);
  if (!convo) notFound();

  await markConversationRead(id, session.user.id);

  const otherParty = convo.buyerId === session.user.id ? convo.seller : convo.buyer;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/messages" className="text-sm text-brand-600 hover:underline">
        ← Mesajlar
      </Link>
      <div className="mb-3 mt-2">
        <h1 className="text-xl font-bold text-brand-700">{otherParty.name ?? otherParty.email}</h1>
        <Link href={`/listings/${convo.listing.slug}`} className="text-sm text-brand-900/60 hover:underline">
          {convo.listing.title}
        </Link>
      </div>

      <MessageThread
        conversationId={convo.id}
        currentUserId={session.user.id}
        initialMessages={convo.messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
