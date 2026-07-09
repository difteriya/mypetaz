import { pendingReports } from '@/lib/admin/data';
import { markReportReviewedAction, deactivateReportedContentAction } from '@/lib/admin/actions';

const TARGET_LABEL: Record<string, string> = {
  LISTING: 'Elan',
  BLOG_POST: 'Bloq yazısı',
  REVIEW: 'Rəy',
  BUSINESS: 'Biznes',
};

export default async function AdminReportsPage() {
  const reports = await pendingReports();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Şikayətlər ({reports.length})</h1>
      {reports.length === 0 ? (
        <p className="text-brand-900/50">Gözləyən şikayət yoxdur.</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-card bg-white p-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs">{TARGET_LABEL[r.targetType]}</span>
                <span className="font-medium">{r.reason}</span>
                <span className="text-xs text-brand-900/40">— {r.reporter.name ?? r.reporter.email}</span>
              </div>
              {r.note && <p className="mt-1 text-sm text-brand-900/70">{r.note}</p>}
              <p className="mt-1 text-xs text-brand-900/40">Hədəf ID: {r.targetId}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={deactivateReportedContentAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-full bg-badge-lostfound px-3 py-1 text-xs font-semibold text-white">
                    Deaktiv et
                  </button>
                </form>
                <form action={markReportReviewedAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300">
                    Baxıldı (saxla)
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
