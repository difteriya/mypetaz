import type { Metadata } from 'next';
import Link from 'next/link';
import { pendingCounts } from '@/lib/admin/data';

export const metadata: Metadata = { title: 'Admin' };

export default async function AdminDashboard() {
  const counts = await pendingCounts();
  const cards = [
    { href: '/admin/listings', label: 'Gözləyən elanlar', value: counts.listings },
    { href: '/admin/businesses', label: 'Gözləyən bizneslər', value: counts.businesses },
    { href: '/admin/blog', label: 'Gözləyən yazılar', value: counts.blog },
    { href: '/admin/reviews', label: 'Gözləyən rəylər', value: counts.reviews },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Admin panel</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-card bg-white p-5 transition-shadow hover:shadow-md">
            <p className="text-3xl font-bold text-brand-700">{c.value}</p>
            <p className="mt-1 text-sm text-brand-900/60">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
