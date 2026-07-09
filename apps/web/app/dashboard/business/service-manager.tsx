'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import {
  setServiceCategoriesAction,
  addServiceOfferingAction,
  deleteServiceOfferingAction,
} from '@/lib/business/actions';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';

interface Offering {
  id: string;
  name: string;
  price: string | null;
  description: string | null;
}

export function ServiceManager({
  categories,
  selectedIds,
  offerings,
}: {
  categories: { id: string; name: string }[];
  selectedIds: string[];
  offerings: Offering[];
}) {
  const [state, formAction, pending] = useActionState(addServiceOfferingAction, undefined);

  return (
    <div className="space-y-8">
      {/* Service categories (admin-managed lookup, multi-select) */}
      <section className="rounded-card bg-white p-5">
        <h2 className="font-semibold text-brand-700">Xidmət kateqoriyaları</h2>
        <form action={setServiceCategoriesAction} className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="serviceCategoryId"
                  value={c.id}
                  defaultChecked={selectedIds.includes(c.id)}
                  className="size-4"
                />
                {c.name}
              </label>
            ))}
          </div>
          <Button type="submit" variant="secondary">
            Kateqoriyaları saxla
          </Button>
        </form>
      </section>

      {/* Service offerings (owner-managed, no moderation) */}
      <section className="rounded-card bg-white p-5">
        <h2 className="font-semibold text-brand-700">Göstərdiyi xidmətlər</h2>

        {offerings.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {offerings.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 rounded-lg border border-cream-200 p-3 text-sm">
                <div>
                  <span className="font-medium">{o.name}</span>
                  {o.price != null && <span className="ml-2 text-brand-700">{o.price} ₼</span>}
                  {o.description && <p className="text-brand-900/60">{o.description}</p>}
                </div>
                <form action={deleteServiceOfferingAction}>
                  <input type="hidden" name="offeringId" value={o.id} />
                  <button type="submit" className="text-xs text-badge-lostfound hover:underline">
                    Sil
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-brand-900/50">Hələ xidmət əlavə edilməyib.</p>
        )}

        <form action={formAction} className="mt-4 grid gap-2 sm:grid-cols-[1fr_120px] sm:items-end">
          <div className="space-y-1">
            <label htmlFor="so-name" className="text-sm font-medium">
              Xidmət adı
            </label>
            <input id="so-name" name="name" required maxLength={100} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label htmlFor="so-price" className="text-sm font-medium">
              Qiymət (₼)
            </label>
            <input id="so-price" name="price" type="number" step="any" className={inputClass} />
          </div>
          <input name="description" placeholder="Təsvir (istəyə bağlı)" className={`${inputClass} sm:col-span-2`} />
          {state?.error && <p className="text-sm text-badge-lostfound sm:col-span-2">{state.error}</p>}
          {state?.ok && <p className="text-sm text-badge-sale sm:col-span-2">{state.ok}</p>}
          <Button type="submit" disabled={pending} className="sm:col-span-2">
            {pending ? 'Əlavə edilir…' : 'Xidmət əlavə et'}
          </Button>
        </form>
      </section>
    </div>
  );
}
