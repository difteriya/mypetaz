'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/dashboard', label: 'İcmal', exact: true },
  { href: '/pets', label: 'Petlərim' },
  { href: '/dashboard/listings', label: 'Elanlarım' },
  { href: '/dashboard/business', label: 'Biznesim' },
  { href: '/messages', label: 'Mesajlar' },
  { href: '/dashboard/notifications', label: 'Bildirişlər' },
  { href: '/dashboard/blog', label: 'Bloqum' },
  { href: '/dashboard/favorites', label: 'Seçilmişlər' },
  { href: '/dashboard/settings', label: 'Ayarlar' },
];

// Account areas that share this nav (top menu must stay visible across them).
const ACCOUNT_PREFIXES = [
  '/dashboard',
  '/pets',
  '/pet',
  '/messages',
  '/become-business',
  '/post-listing',
  '/write-post',
];

export function AccountNav() {
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

  const onAccount = ACCOUNT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!onAccount || !loggedIn) return null;

  return (
    <nav className="w-full border-b border-cream-200 bg-white">
      <div className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-4">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
                active
                  ? 'border-brand-500 text-brand-700'
                  : 'border-transparent text-ink/55 hover:text-brand-600'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
