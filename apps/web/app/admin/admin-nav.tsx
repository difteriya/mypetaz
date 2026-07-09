'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNav({ counts }: { counts: { listings: number; businesses: number; blog: number; reviews: number } }) {
  const pathname = usePathname();
  const links = [
    { href: '/admin', label: 'İcmal', exact: true, badge: 0 },
    { href: '/admin/listings', label: 'Elanlar', badge: counts.listings },
    { href: '/admin/businesses', label: 'Bizneslər', badge: counts.businesses },
    { href: '/admin/blog', label: 'Bloq', badge: counts.blog },
    { href: '/admin/reviews', label: 'Rəylər', badge: counts.reviews },
    { href: '/admin/transfers', label: 'Köçürmələr', badge: 0 },
    { href: '/admin/users', label: 'İstifadəçilər', badge: 0 },
  ];

  return (
    <nav className="border-b border-cream-200 bg-white">
      <div className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-4">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${
                active ? 'border-brand-500 text-brand-700' : 'border-transparent text-brand-900/60 hover:text-brand-700'
              }`}
            >
              {l.label}
              {l.badge > 0 && (
                <span className="rounded-full bg-brand-500 px-1.5 text-xs text-white">{l.badge}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
