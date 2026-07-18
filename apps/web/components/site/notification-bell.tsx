'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { notificationCategory, CATEGORY_TONE } from '@/lib/notifications/source-label';

interface Notif {
  id: string;
  type: string;
  message: string;
  link: string | null;
  source: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'indicə';
  if (diff < 3600) return `${Math.floor(diff / 60)} dəq əvvəl`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün əvvəl`;
  return new Date(iso).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/notifications');
      if (!r.ok) return;
      const d = await r.json();
      setItems(d.items ?? []);
      setUnread(d.unread ?? 0);
      setLoaded(true);
    } catch {
      /* ignore */
    }
  }, []);

  // Initial count + poll every 60s so the badge stays fresh.
  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const markAll = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
    } catch {
      /* ignore */
    }
    setUnread(0);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  };

  /** Clicking a notification marks it read (fire-and-forget; survives navigation). */
  const markOne = (n: Notif) => {
    if (n.read) return;
    try {
      void fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: n.id }),
        keepalive: true,
      });
    } catch {
      /* ignore */
    }
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Bildirişlər"
        className="relative grid size-9 place-items-center rounded-full text-ink/70 transition-colors hover:bg-cream-100 hover:text-brand-600"
      >
        <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-0 top-0 grid min-w-[16px] place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-4 text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-cream-200 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-cream-200 px-4 py-2.5">
            <span className="font-semibold text-brand-700">Bildirişlər</span>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="text-xs font-medium text-brand-600 hover:underline">
                Hamısını oxu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {!loaded ? (
              <p className="p-4 text-sm text-ink/50">Yüklənir…</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-ink/50">Hələ bildiriş yoxdur</p>
            ) : (
              items.map((n) => {
                const cat = notificationCategory(n.type);
                const inner = (
                  <div className={`px-4 py-3 ${n.read ? '' : 'bg-brand-50'}`}>
                    <span
                      className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_TONE[cat.tone]}`}
                    >
                      {n.source ?? cat.label}
                    </span>
                    <p className="text-sm text-ink/80">{n.message}</p>
                    <p className="mt-0.5 text-xs text-ink/40">{timeAgo(n.createdAt)}</p>
                  </div>
                );
                return n.link ? (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => {
                      markOne(n);
                      setOpen(false);
                    }}
                    className="block transition-colors hover:bg-cream-50"
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markOne(n)}
                    className="block w-full border-b border-cream-100 text-left transition-colors last:border-0 hover:bg-cream-50"
                  >
                    {inner}
                  </button>
                );
              })
            )}
          </div>
          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-cream-200 px-4 py-2.5 text-center text-sm font-semibold text-brand-600 transition-colors hover:bg-cream-50"
          >
            Hamısına bax
          </Link>
        </div>
      )}
    </div>
  );
}
