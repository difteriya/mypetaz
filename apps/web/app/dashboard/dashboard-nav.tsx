'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/dashboard', label: 'İcmal', exact: true },
  { href: '/pets', label: 'Petlərim' },
  { href: '/dashboard/listings', label: 'Elanlarım' },
  { href: '/dashboard/business', label: 'Biznesim' },
  { href: '/messages', label: 'Mesajlar' },
  { href: '/dashboard/favorites', label: 'Seçilmişlər' },
  { href: '/dashboard/settings', label: 'Ayarlar' },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-cream-200 bg-white">
      <div className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-4">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'border-brand-500 text-brand-700'
                  : 'border-transparent text-brand-900/60 hover:text-brand-700'
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
