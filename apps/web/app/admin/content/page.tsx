import { getAllBlocks } from '@/lib/cms/data';
import { upsertContentBlockAction, deleteContentBlockAction } from '@/lib/cms/actions';
import { imageVariant } from '@/lib/images';

const PAGES = ['HOME', 'ABOUT', 'CONTACT', 'FOOTER', 'GLOBAL'] as const;
const TYPES = ['TEXT', 'RICHTEXT', 'IMAGE', 'URL'] as const;
const inputClass = 'w-full rounded border border-cream-200 px-2 py-1 text-sm';

export default async function AdminContentPage() {
  const blocks = await getAllBlocks();
  const byPage = PAGES.map((p) => ({ page: p, items: blocks.filter((b) => b.page === p) }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-700">Kontent (CMS)</h1>

      {byPage.map(({ page, items }) => (
        <section key={page}>
          <h2 className="mb-3 text-lg font-semibold text-brand-700">{page}</h2>
          <div className="space-y-3">
            {items.map((b) => (
              <form
                key={b.id}
                action={upsertContentBlockAction}
                className="flex flex-wrap items-end gap-2 rounded-card bg-white p-3"
              >
                <input type="hidden" name="key" value={b.key} />
                <input type="hidden" name="page" value={b.page} />
                <input type="hidden" name="type" value={b.type} />
                <input type="hidden" name="order" value={b.order} />
                <div className="min-w-0 flex-1">
                  <label className="text-xs text-brand-900/50">
                    {b.key} <span className="text-brand-900/30">({b.type})</span>
                  </label>
                  {b.type === 'IMAGE' ? (
                    <div className="flex items-center gap-2">
                      {b.value && b.value.startsWith('/uploads/') && (
                        <img src={imageVariant(b.value, 'thumb')} alt={b.key} className="size-12 rounded object-cover" />
                      )}
                      <input type="file" name="image" accept="image/*" className="text-sm" />
                    </div>
                  ) : b.type === 'RICHTEXT' ? (
                    <textarea name="value" rows={3} defaultValue={b.value} className={inputClass} />
                  ) : (
                    <input name="value" defaultValue={b.value} className={inputClass} />
                  )}
                </div>
                <button className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                  Saxla
                </button>
                <button
                  formAction={deleteContentBlockAction}
                  className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300"
                >
                  Sil
                </button>
              </form>
            ))}
          </div>
        </section>
      ))}

      {/* Add a new block */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-brand-700">Yeni blok</h2>
        <form action={upsertContentBlockAction} className="flex flex-wrap items-end gap-2 rounded-card bg-white p-3">
          <input name="key" placeholder="key (unikal)" required className={`${inputClass} w-40`} />
          <select name="page" className={`${inputClass} w-32`}>
            {PAGES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select name="type" className={`${inputClass} w-32`}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input name="value" placeholder="dəyər" className={`${inputClass} flex-1`} />
          <button className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">Əlavə et</button>
        </form>
      </section>
    </div>
  );
}
