import { pendingBusinesses } from '@/lib/admin/data';
import { approveBusinessAction, rejectBusinessAction } from '@/lib/admin/actions';

export default async function AdminBusinessesPage() {
  const pending = await pendingBusinesses();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Gözləyən bizneslər ({pending.length})</h1>
      {pending.length === 0 ? (
        <p className="text-brand-900/50">Gözləyən biznes yoxdur.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((b) => (
            <li key={b.id} className="rounded-card bg-white p-4">
              <p className="font-semibold">{b.name}</p>
              <p className="text-xs text-brand-900/50">
                {b.city?.name ?? '—'} · {b.user.name ?? b.user.email}
              </p>
              {b.description && <p className="mt-1 text-sm text-brand-900/70">{b.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <form action={approveBusinessAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="rounded-full bg-badge-sale px-3 py-1 text-xs font-semibold text-white">Təsdiqlə</button>
                </form>
                <form action={rejectBusinessAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={b.id} />
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
