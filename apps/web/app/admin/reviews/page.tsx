import { pendingReviews, allReviews } from '@/lib/admin/data';
import { approveReviewAction, rejectReviewAction } from '@/lib/admin/actions';
import { adminDeleteReviewAction } from '@/lib/admin/content-actions';
import { StarRating } from '@/components/icons';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete';

const TARGET_LABEL: Record<string, string> = { LISTING: 'Elan', BUSINESS: 'Biznes' };

export default async function AdminReviewsPage() {
  const [pending, all] = await Promise.all([pendingReviews(), allReviews()]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-2xl font-bold text-brand-700">Gözləyən rəylər ({pending.length})</h1>
        {pending.length === 0 ? (
          <p className="text-brand-900/50">Gözləyən rəy yoxdur.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((r) => (
              <li key={r.id} className="rounded-card bg-white p-4">
                <div className="flex items-center gap-2 text-sm">
                  <StarRating value={r.rating} />
                  <span className="text-xs text-brand-900/50">
                    {TARGET_LABEL[r.targetType]}: {r.targetLabel} · {r.user.name ?? 'İstifadəçi'}
                  </span>
                </div>
                {r.content && <p className="mt-1 text-sm text-brand-900/70">{r.content}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <form action={approveReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-full bg-badge-sale px-3 py-1 text-xs font-semibold text-white">Təsdiqlə</button>
                  </form>
                  <form action={rejectReviewAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <input name="reason" placeholder="Səbəb" className="rounded border border-cream-200 px-2 py-1 text-xs" />
                    <button className="rounded-full bg-badge-lostfound px-3 py-1 text-xs font-semibold text-white">Rədd et</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-brand-700">Bütün rəylər ({all.length})</h2>
        <ul className="divide-y divide-cream-100 rounded-card bg-white">
          {all.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <StarRating value={r.rating} />
                <span className="truncate text-xs text-brand-900/50">
                  {TARGET_LABEL[r.targetType]}: {r.targetLabel} · {r.user.name ?? 'İstifadəçi'}
                  {r.content ? ` — ${r.content}` : ''}
                </span>
              </span>
              <AdminStatusBadge status={r.status} />
              <ConfirmDeleteButton
                action={adminDeleteReviewAction}
                id={r.id}
                itemName={`${r.user.name ?? 'İstifadəçi'} — ${r.rating}★`}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
