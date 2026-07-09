import { pendingReviews } from '@/lib/admin/data';
import { approveReviewAction, rejectReviewAction } from '@/lib/admin/actions';

const TARGET_LABEL: Record<string, string> = { LISTING: 'Elan', BUSINESS: 'Biznes' };

export default async function AdminReviewsPage() {
  const pending = await pendingReviews();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Gözləyən rəylər ({pending.length})</h1>
      {pending.length === 0 ? (
        <p className="text-brand-900/50">Gözləyən rəy yoxdur.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((r) => (
            <li key={r.id} className="rounded-card bg-white p-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
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
    </div>
  );
}
