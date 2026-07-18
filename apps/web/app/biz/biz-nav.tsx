'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/biz', label: 'İcmal', exact: true },
  { href: '/biz/profile', label: 'Mağaza profili' },
  { href: '/biz/listings', label: 'Elanlar' },
  { href: '/biz/pets', label: 'Petlər' },
];

export function BizNav() {
  const pathname = usePathname();
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
                active ? 'border-teal-500 text-teal-700' : 'border-transparent text-ink/55 hover:text-teal-600'
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
