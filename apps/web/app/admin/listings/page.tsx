import Link from 'next/link';
import { pendingListings, recentActiveListings, allListings } from '@/lib/admin/data';
import {
  approveListingAction,
  rejectListingAction,
  toggleFeaturedAction,
} from '@/lib/admin/actions';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete';
import { adminDeleteListingAction } from '@/lib/admin/content-actions';

export default async function AdminListingsPage() {
  const [pending, active, all] = await Promise.all([
    pendingListings(),
    recentActiveListings(),
    allListings(),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-2xl font-bold text-brand-700">Gözləyən elanlar ({pending.length})</h1>
        {pending.length === 0 ? (
          <p className="text-brand-900/50">Gözləyən elan yoxdur.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((l) => (
              <li key={l.id} className="rounded-card bg-white p-4">
                <p className="font-semibold">{l.title}</p>
                <p className="text-xs text-brand-900/50">
                  {l.pet.category.name} · {l.user.name ?? l.user.email}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/listings/${l.slug}`}
                    target="_blank"
                    className="rounded-full border border-cream-200 px-3 py-1 text-xs font-semibold text-brand-700 hover:border-brand-300"
                  >
                    Bax
                  </Link>
                  <form action={approveListingAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <button className="rounded-full bg-badge-sale px-3 py-1 text-xs font-semibold text-white">
                      Təsdiqlə
                    </button>
                  </form>
                  <form action={rejectListingAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={l.id} />
                    <input name="reason" placeholder="Səbəb" className="rounded border border-cream-200 px-2 py-1 text-xs" />
                    <button className="rounded-full bg-badge-lostfound px-3 py-1 text-xs font-semibold text-white">
                      Rədd et
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-brand-700">Seçilmiş elanlar (Featured)</h2>
        <ul className="divide-y divide-cream-100 rounded-card bg-white">
          {active.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <Link href={`/listings/${l.slug}`} className="truncate hover:underline">
                {l.featured ? '(seçilmiş) ' : ''}
                {l.title}
              </Link>
              <form action={toggleFeaturedAction}>
                <input type="hidden" name="id" value={l.id} />
                <button className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300">
                  {l.featured ? 'Featured-dan çıxar' : 'Featured et'}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-brand-700">Bütün elanlar ({all.length})</h2>
        <ul className="divide-y divide-cream-100 rounded-card bg-white">
          {all.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <Link href={`/listings/${l.slug}`} target="_blank" className="min-w-0 flex-1 truncate hover:underline">
                {l.title}
                <span className="ml-2 text-xs text-brand-900/45">
                  {l.pet.category.name} · {l.user.name ?? l.user.email}
                </span>
              </Link>
              <AdminStatusBadge status={l.status} />
              <Link
                href={`/admin/listings/${l.id}/edit`}
                className="shrink-0 rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300"
              >
                Redaktə
              </Link>
              <ConfirmDeleteButton action={adminDeleteListingAction} id={l.id} itemName={l.title} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
