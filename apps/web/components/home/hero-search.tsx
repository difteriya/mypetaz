'use client';

import { useState } from 'react';
import { Button } from '@mypet/ui';
import { LISTING_TYPES } from '@/lib/listings/schema';
import { listingTypeLabel } from '@/components/listings/listing-badge';

interface HeroCategory {
  id: string;
  name: string;
  breeds: { id: string; name: string }[];
}

const fieldLabel = 'mb-1 block text-xs font-bold text-ink/60';
const fieldBox =
  'w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-ink outline-none focus:border-brand-400 disabled:bg-cream-100 disabled:text-ink/40';

/** Homepage search with a category → breed dependent dropdown. GET → /listings. */
export function HeroSearch({ categories }: { categories: HeroCategory[] }) {
  const [categoryId, setCategoryId] = useState('');
  const breeds = categories.find((c) => c.id === categoryId)?.breeds ?? [];

  return (
    <form
      action="/listings"
      method="get"
      className="mx-auto mt-8 grid max-w-5xl gap-3 rounded-2xl bg-white p-5 text-left shadow-soft sm:grid-cols-2 sm:items-end lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
    >
      <div>
        <label htmlFor="h-cat" className={fieldLabel}>Kateqoriya</label>
        <select
          id="h-cat"
          name="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={fieldBox}
        >
          <option value="">Kateqoriya seçin</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="h-breed" className={fieldLabel}>Cins</label>
        <select id="h-breed" name="breedId" defaultValue="" disabled={breeds.length === 0} className={fieldBox}>
          <option value="">{breeds.length === 0 ? 'Əvvəlcə kateqoriya' : 'Bütün cinslər'}</option>
          {breeds.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="h-type" className={fieldLabel}>Tip</label>
        <select id="h-type" name="type" defaultValue="" className={fieldBox}>
          <option value="">Tipi seçin</option>
          {LISTING_TYPES.map((t) => (
            <option key={t} value={t}>{listingTypeLabel(t)}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="h-q" className={fieldLabel}>Açar söz</label>
        <input id="h-q" name="q" placeholder="Açar söz…" className={fieldBox} />
      </div>

      <Button type="submit" className="h-[42px] sm:col-span-2 lg:col-span-1">Axtar</Button>
    </form>
  );
}
