'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@mypet/ui';
import { sendMessageAction } from '@/lib/messages/actions';

export interface ThreadMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
}: {
  conversationId: string;
  initialMessages: ThreadMessage[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { messages: ThreadMessage[] };
        setMessages(data.messages);
      }
    } catch {
      /* transient — next tick retries */
    }
  }, [conversationId]);

  // Poll every 4s, but skip while the tab is hidden (PLAN.md §2.6).
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') refetch();
    }, 4000);
    return () => clearInterval(t);
  }, [refetch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    setContent('');
    const fd = new FormData();
    fd.set('conversationId', conversationId);
    fd.set('content', text);
    await sendMessageAction(undefined, fd);
    await refetch();
    setSending(false);
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-card bg-white">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-brand-900/40">Hələ mesaj yoxdur. İlk mesajı yazın.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? 'bg-brand-500 text-white' : 'bg-cream-100 text-brand-900'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{m.content}</p>
                  <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-brand-900/40'}`}>
                    {new Date(m.createdAt).toLocaleString('az-AZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-cream-200 p-3">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Mesaj yazın…"
          maxLength={2000}
          className="flex-1 rounded-full border border-cream-200 px-4 py-2 text-sm outline-none focus:border-brand-400"
        />
        <Button type="submit" disabled={sending}>
          Göndər
        </Button>
      </form>
    </div>
  );
}
