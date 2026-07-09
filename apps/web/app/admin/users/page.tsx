import { listUsers } from '@/lib/admin/data';
import { setUserBlockedAction, createUserAction, deleteUserAction } from '@/lib/admin/actions';

const inputClass = 'rounded-lg border border-cream-200 px-3 py-1.5 text-sm';

export default async function AdminUsersPage() {
  const users = await listUsers();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">İstifadəçilər</h1>

      <form action={createUserAction} className="mb-6 flex flex-wrap items-end gap-2 rounded-card bg-white p-4">
        <input name="email" type="email" required placeholder="E-poçt" className={inputClass} />
        <input name="name" placeholder="Ad" className={inputClass} />
        <input name="password" type="password" required minLength={8} placeholder="Şifrə (min 8)" className={inputClass} />
        <select name="role" defaultValue="USER" className={inputClass}>
          <option value="USER">USER</option>
          <option value="VET">VET</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white">
          İstifadəçi əlavə et
        </button>
      </form>
      <div className="overflow-x-auto rounded-card bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-left text-brand-900/50">
              <th className="p-3">Ad</th>
              <th className="p-3">E-poçt</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-cream-100 last:border-0">
                <td className="p-3">{u.name ?? '—'}</td>
                <td className="p-3 text-brand-900/70">{u.email}</td>
                <td className="p-3">
                  <span className="text-xs">{u.role}</span>
                  {u.accountType === 'BUSINESS' && <span className="ml-1 text-xs text-brand-500">· Biznes</span>}
                </td>
                <td className="p-3">
                  {u.blocked ? (
                    <span className="text-xs text-badge-lostfound">Bloklanıb</span>
                  ) : (
                    <span className="text-xs text-badge-sale">Aktiv</span>
                  )}
                </td>
                <td className="p-3">
                  {u.role !== 'ADMIN' && (
                    <div className="flex justify-end gap-2">
                      <form action={setUserBlockedAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="blocked" value={u.blocked ? 'false' : 'true'} />
                        <button className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300">
                          {u.blocked ? 'Blokdan çıxar' : 'Blokla'}
                        </button>
                      </form>
                      <form action={deleteUserAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="rounded-full border border-cream-200 px-3 py-1 text-xs text-badge-lostfound hover:border-badge-lostfound">
                          Sil
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
