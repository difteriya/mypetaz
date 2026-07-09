import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { listMyListings } from '@/lib/listings/data';
import { deleteListingAction } from '@/lib/listings/actions';
import { listingTypeLabel } from '@/components/listings/listing-badge';
import { PriceTag } from '@/components/listings/price-tag';
import { TransferForm } from './transfer-form';

export const metadata: Metadata = { title: 'Mənim elanlarım' };

const STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Gözləmədə', className: 'bg-amber-100 text-amber-700' },
  ACTIVE: { label: 'Aktiv', className: 'bg-badge-sale/15 text-badge-sale' },
  FINISHED: { label: 'Bitib', className: 'bg-cream-200 text-brand-900/60' },
  REJECTED: { label: 'Rədd edilib', className: 'bg-badge-lostfound/15 text-badge-lostfound' },
};

export default async function MyListingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const listings = await listMyListings(session.user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-700">Mənim elanlarım</h1>
        <Link href="/post-listing">
          <Button>+ Yeni elan</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="text-brand-900/50">Hələ elanınız yoxdur.</p>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => {
            const status = STATUS_META[l.status] ?? { label: l.status, className: 'bg-cream-200' };
            return (
              <li key={l.id} className="rounded-card bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-brand-900/50">{listingTypeLabel(l.type)}</span>
                    </div>
                    <p className="mt-1 truncate font-semibold">
                      {l.status === 'ACTIVE' ? (
                        <Link href={`/listings/${l.slug}`} className="hover:underline">
                          {l.title}
                        </Link>
                      ) : (
                        l.title
                      )}
                    </p>
                    {l.price != null && (
                      <PriceTag value={Number(l.price)} className="text-sm text-brand-700" />
                    )}
                  </div>
                  <form action={deleteListingAction}>
                    <input type="hidden" name="listingId" value={l.id} />
                    <button type="submit" className="text-sm text-badge-lostfound hover:underline">
                      Sil
                    </button>
                  </form>
                </div>
                {l.status === 'ACTIVE' && <TransferForm listingId={l.id} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
