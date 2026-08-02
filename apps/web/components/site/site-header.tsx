'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@mypet/ui';
import { PawIcon } from '@/components/icons';
import { NotificationBell } from './notification-bell';

// Auth is checked client-side so the root layout stays static/ISR-friendly
// (public pages don't depend on the session — PLAN.md §8.5).
export function SiteHeader({ logoUrl = null }: { logoUrl?: string | null }) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((s) => active && setLoggedIn(Boolean(s?.user)))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-cream-200 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5 font-display text-xl font-extrabold text-brand-600">
          {logoUrl ? (
            // Admin-uploaded logo (/admin/branding) replaces the mark + wordmark.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="mypet.az" className="h-8 w-auto max-w-[180px] object-contain" />
          ) : (
            <>
              <PawIcon className="size-6" /> mypet<span className="text-teal-500">.az</span>
            </>
          )}
        </Link>

        <nav className="hidden gap-6 text-[0.95rem] font-semibold sm:flex">
          <Link href="/listings" className="text-ink/70 transition-colors hover:text-brand-600">
            Elanlar
          </Link>
          <Link href="/businesses" className="text-ink/70 transition-colors hover:text-brand-600">
            Bizneslər
          </Link>
          <Link href="/vets" className="text-ink/70 transition-colors hover:text-brand-600">
            Baytarlar
          </Link>
          <Link href="/blog" className="text-ink/70 transition-colors hover:text-brand-600">
            Bloq
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/post-listing">
            <Button size="sm">Elan yerləşdir</Button>
          </Link>
          {loggedIn && <NotificationBell />}
          <Link href={loggedIn ? '/dashboard' : '/login'}>
            <Button size="sm" variant="secondary">
              {loggedIn ? 'Profil' : 'Daxil ol'}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
