import { auth } from '@mypet/auth';
import { getConversationMessages, markConversationRead } from '@/lib/messages/data';

// Polling endpoint (PLAN.md §2.6 — no WebSocket). Returns messages and marks
// the other party's messages read for the viewer.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  await markConversationRead(id, session.user.id);
  const messages = await getConversationMessages(id, session.user.id);
  return Response.json({ messages });
}
