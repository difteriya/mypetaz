'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Günün vərəqi', exact: true },
  { href: '/calendar', label: 'Təqvim' },
  { href: '/appointments', label: 'Təyinatlar' },
  { href: '/new', label: '+ Yeni' },
];

export function PanelNav() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? 'border-vteal-500 text-vteal-700' : 'border-transparent text-vink/50 hover:text-vteal-700'
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
