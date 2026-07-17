'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { createBreedAction } from '@/lib/admin/breed-actions';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';

export function BreedAddForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createBreedAction, undefined);

  return (
    <form action={formAction} className="rounded-card border border-cream-200 bg-white p-5">
      <h2 className="mb-3 font-semibold text-brand-700">Yeni cins əlavə et</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <label htmlFor="categoryId" className="text-sm font-medium">
            Kateqoriya
          </label>
          <select id="categoryId" name="categoryId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Seçin…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Cins adı
          </label>
          <input id="name" name="name" required minLength={2} maxLength={80} placeholder="Məs. Border Collie" className={inputClass} />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Əlavə olunur…' : 'Əlavə et'}
        </Button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-badge-lostfound">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-sm text-badge-sale">{state.ok}</p>}
    </form>
  );
}
