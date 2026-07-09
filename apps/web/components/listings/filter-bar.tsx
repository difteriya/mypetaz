'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@mypet/ui';
import { LISTING_TYPES } from '@/lib/listings/schema';
import { listingTypeLabel } from './listing-badge';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400';

interface CategoryOpt {
  id: string;
  name: string;
  breeds: { id: string; name: string }[];
}

export function FilterBar({
  categories,
  cities,
  current,
}: {
  categories: CategoryOpt[];
  cities: { id: string; name: string }[];
  current: Record<string, string>;
}) {
  const [categoryId, setCategoryId] = useState(current.categoryId ?? '');
  const breeds = categories.find((c) => c.id === categoryId)?.breeds ?? [];

  return (
    <form method="get" action="/listings" className="grid gap-2 rounded-card bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <input name="q" defaultValue={current.q} placeholder="Axtarış…" className={`${inputClass} sm:col-span-2`} />

      <select name="type" defaultValue={current.type ?? ''} className={inputClass}>
        <option value="">Bütün növlər</option>
        {LISTING_TYPES.map((t) => (
          <option key={t} value={t}>
            {listingTypeLabel(t)}
          </option>
        ))}
      </select>

      <select name="cityId" defaultValue={current.cityId ?? ''} className={inputClass}>
        <option value="">Bütün şəhərlər</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        name="categoryId"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className={inputClass}
      >
        <option value="">Bütün kateqoriyalar</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select name="breedId" defaultValue={current.breedId} disabled={!categoryId} className={inputClass}>
        <option value="">Bütün cinslər</option>
        {breeds.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <input name="priceMin" type="number" defaultValue={current.priceMin} placeholder="Min qiymət" className={inputClass} />
      <input name="priceMax" type="number" defaultValue={current.priceMax} placeholder="Max qiymət" className={inputClass} />

      <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
        <Button type="submit">Filtrlə</Button>
        <Link href="/listings" className="inline-flex items-center px-3 text-sm text-brand-600 hover:underline">
          Təmizlə
        </Link>
      </div>
    </form>
  );
}
