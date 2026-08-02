import Link from 'next/link';
import { pendingBusinesses, allBusinesses } from '@/lib/admin/data';
import { approveBusinessAction, rejectBusinessAction } from '@/lib/admin/actions';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete';
import { adminDeleteBusinessAction } from '@/lib/admin/content-actions';

export default async function AdminBusinessesPage() {
  const [pending, all] = await Promise.all([pendingBusinesses(), allBusinesses()]);

  return (
    <div className="space-y-8">
      <section>
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
                  <Link href={`/business/${b.slug}`} target="_blank" className="rounded-full border border-cream-200 px-3 py-1 text-xs font-semibold text-brand-700 hover:border-brand-300">
                    Bax
                  </Link>
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
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-brand-700">Bütün bizneslər ({all.length})</h2>
        <ul className="divide-y divide-cream-100 rounded-card bg-white">
          {all.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <Link href={`/business/${b.slug}`} target="_blank" className="min-w-0 flex-1 truncate hover:underline">
                {b.name}
                <span className="ml-2 text-xs text-brand-900/45">{b.city?.name ?? '—'} · {b.user.name ?? b.user.email}</span>
              </Link>
              <AdminStatusBadge status={b.status} />
              <Link
                href={`/admin/businesses/${b.id}/edit`}
                className="shrink-0 rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300"
              >
                Redaktə
              </Link>
              <ConfirmDeleteButton action={adminDeleteBusinessAction} id={b.id} itemName={b.name} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
