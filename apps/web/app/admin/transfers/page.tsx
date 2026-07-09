import { recentTransfers } from '@/lib/admin/data';
import { adminRevertTransferAction } from '@/lib/admin/actions';

export default async function AdminTransfersPage() {
  const transfers = await recentTransfers();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Sahiblik köçürmələri</h1>
      {transfers.length === 0 ? (
        <p className="text-brand-900/50">Köçürmə yoxdur.</p>
      ) : (
        <ul className="space-y-2">
          {transfers.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 rounded-card bg-white p-3 text-sm">
              <div>
                <span className="font-medium">{t.pet.name}</span>{' '}
                <span className="text-brand-900/50">
                  {t.oldOwner.name ?? t.oldOwner.email} → {t.newOwner.name ?? t.newOwner.email}
                </span>
                <span className="ml-2 text-xs text-brand-900/40">{t.createdAt.toISOString().slice(0, 10)}</span>
              </div>
              {t.reverted ? (
                <span className="text-xs text-brand-900/40">Geri qaytarılıb</span>
              ) : (
                <form action={adminRevertTransferAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300">
                    Geri qaytar
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
