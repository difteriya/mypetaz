'use client';

import { useActionState, useState } from 'react';
import { Button } from '@mypet/ui';
import { createFieldAction } from '@/lib/admin/category-field-actions';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400';

export function FieldAddForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createFieldAction, undefined);
  const [type, setType] = useState('TEXT');

  return (
    <form action={formAction} className="space-y-3 rounded-card border border-cream-200 bg-white p-5">
      <h2 className="font-semibold text-brand-700">Yeni sahə əlavə et</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="categoryId" className="text-sm font-medium">Kateqoriya</label>
          <select id="categoryId" name="categoryId" required defaultValue="" className={inputClass}>
            <option value="" disabled>Seçin…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="label" className="text-sm font-medium">Label (görünən ad)</label>
          <input id="label" name="label" required minLength={2} maxLength={80} placeholder="Məs. Peyvənd statusu" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="type" className="text-sm font-medium">Tip</label>
          <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="TEXT">Mətn</option>
            <option value="NUMBER">Rəqəm</option>
            <option value="SELECT">Seçim (siyahı)</option>
            <option value="BOOL">Bəli / Xeyr</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" name="required" className="size-4" /> Tələb olunur
        </label>
      </div>

      {type === 'SELECT' && (
        <div className="space-y-1">
          <label htmlFor="options" className="text-sm font-medium">Seçimlər (hər sətirdə bir)</label>
          <textarea id="options" name="options" rows={3} placeholder={'Qısa\nOrta\nUzun'} className={inputClass} />
        </div>
      )}

      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
      {state?.ok && <p className="text-sm text-badge-sale">{state.ok}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Əlavə olunur…' : 'Əlavə et'}</Button>
    </form>
  );
}
