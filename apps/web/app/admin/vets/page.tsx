import { pendingVets, allVets } from '@/lib/admin/data';
import { approveVetAction, rejectVetAction } from '@/lib/admin/vet-actions';
import { AdminStatusBadge } from '@/components/admin/status-badge';

export default async function AdminVetsPage() {
  const [pending, all] = await Promise.all([pendingVets(), allVets()]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-2xl font-bold text-brand-700">Gözləyən baytarlar ({pending.length})</h1>
        {pending.length === 0 ? (
          <p className="text-brand-900/50">Gözləyən baytar müraciəti yoxdur.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((v) => (
              <li key={v.id} className="rounded-card bg-white p-4">
                <p className="font-semibold">{v.clinicName}</p>
                <p className="text-xs text-brand-900/50">
                  {v.specialty ?? 'İxtisas göstərilməyib'} · {v.user.name ?? v.user.email}
                  {v.user.phone ? ` · ${v.user.phone}` : ''}
                  {v.licenseNo ? ` · Lisenziya: ${v.licenseNo}` : ''}
                </p>
                {v.address && <p className="mt-1 text-sm text-brand-900/70">{v.address}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <form action={approveVetAction}>
                    <input type="hidden" name="id" value={v.id} />
                    <button className="rounded-full bg-badge-sale px-3 py-1 text-xs font-semibold text-white">
                      Təsdiqlə
                    </button>
                  </form>
                  <form action={rejectVetAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={v.id} />
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
        <h2 className="mb-4 text-lg font-semibold text-brand-700">Bütün baytarlar ({all.length})</h2>
        <ul className="divide-y divide-cream-100 rounded-card bg-white">
          {all.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span className="min-w-0 flex-1 truncate">
                {v.clinicName}
                <span className="ml-2 text-xs text-brand-900/45">{v.user.name ?? v.user.email}</span>
              </span>
              <AdminStatusBadge status={v.verified ? 'ACTIVE' : 'PENDING'} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
