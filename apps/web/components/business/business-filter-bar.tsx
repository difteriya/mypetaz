'use client';

import Link from 'next/link';
import { Button } from '@mypet/ui';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400';

export function BusinessFilterBar({
  cities,
  categories,
  current,
}: {
  cities: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  current: Record<string, string>;
}) {
  return (
    <form method="get" action="/businesses" className="grid gap-2 rounded-card bg-white p-4 sm:grid-cols-4">
      <input name="q" defaultValue={current.q} placeholder="Axtarış…" className={inputClass} />
      <select name="cityId" defaultValue={current.cityId ?? ''} className={inputClass}>
        <option value="">Bütün şəhərlər</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select name="serviceCategoryId" defaultValue={current.serviceCategoryId ?? ''} className={inputClass}>
        <option value="">Bütün xidmətlər</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button type="submit">Filtrlə</Button>
        <Link href="/businesses" className="inline-flex items-center px-2 text-sm text-brand-600 hover:underline">
          Təmizlə
        </Link>
      </div>
    </form>
  );
}
