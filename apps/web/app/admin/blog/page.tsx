import { pendingBlogPosts } from '@/lib/admin/data';
import { approveBlogAction, rejectBlogAction } from '@/lib/admin/actions';

export default async function AdminBlogPage() {
  const pending = await pendingBlogPosts();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Gözləyən yazılar ({pending.length})</h1>
      {pending.length === 0 ? (
        <p className="text-brand-900/50">Gözləyən yazı yoxdur.</p>
      ) : (
        <ul className="space-y-4">
          {pending.map((p) => (
            <li key={p.id} className="rounded-card bg-white p-4">
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-brand-900/50">
                {p.category.name} · {p.user.name ?? 'İstifadəçi'}
              </p>

              {/* SEO meta filled at approval (PLAN.md §2.12) */}
              <form action={approveBlogAction} className="mt-3 space-y-2">
                <input type="hidden" name="id" value={p.id} />
                <input name="metaTitle" placeholder="Meta başlıq (SEO)" defaultValue={p.title} className="w-full rounded border border-cream-200 px-2 py-1 text-xs" />
                <input name="metaDescription" placeholder="Meta təsvir (SEO)" defaultValue={p.excerpt ?? ''} className="w-full rounded border border-cream-200 px-2 py-1 text-xs" />
                <button className="rounded-full bg-badge-sale px-3 py-1 text-xs font-semibold text-white">Təsdiqlə və dərc et</button>
              </form>

              <form action={rejectBlogAction} className="mt-2 flex items-center gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input name="reason" placeholder="Səbəb" className="rounded border border-cream-200 px-2 py-1 text-xs" />
                <button className="rounded-full bg-badge-lostfound px-3 py-1 text-xs font-semibold text-white">Rədd et</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
