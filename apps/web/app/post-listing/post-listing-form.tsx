'use client';

import { useActionState, useState } from 'react';
import { Button } from '@mypet/ui';
import { createListingAction } from '@/lib/listings/actions';
import { LISTING_TYPES, NEW_PET } from '@/lib/listings/schema';
import { listingTypeLabel } from '@/components/listings/listing-badge';
import { PetFieldset } from '@/components/pets/pet-fieldset';
import type { CategoryForForm } from '@/lib/pets/data';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';
const labelClass = 'text-sm font-medium';

interface PetOpt {
  id: string;
  name: string;
  category: { name: string; emoji: string | null };
  breed: { name: string } | null;
}

export function PostListingForm({
  pets,
  cities,
  categories,
}: {
  pets: PetOpt[];
  cities: { id: string; name: string }[];
  categories: CategoryForForm[];
}) {
  const [state, formAction, pending] = useActionState(createListingAction, undefined);
  const [type, setType] = useState<string>('SALE');
  // Default to inline creation when the user has no pets yet.
  const [petId, setPetId] = useState<string>(pets.length === 0 ? NEW_PET : '');
  const creatingPet = petId === NEW_PET;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="petId" className={labelClass}>
          Pet <span className="text-badge-lostfound">*</span>
        </label>
        <select
          id="petId"
          name="petId"
          required
          className={inputClass}
          value={petId}
          onChange={(e) => setPetId(e.target.value)}
        >
          <option value="" disabled>
            Seçin…
          </option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.breed ? ` — ${p.breed.name}` : ''}
            </option>
          ))}
          <option value={NEW_PET}>+ Yeni pet əlavə et</option>
        </select>
      </div>

      {creatingPet && (
        <div className="rounded-card border border-cream-200 bg-cream-50/60 p-4">
          <PetFieldset categories={categories} descriptionName="petDescription" />
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="type" className={labelClass}>
          Elan növü <span className="text-badge-lostfound">*</span>
        </label>
        <select
          id="type"
          name="type"
          className={inputClass}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {LISTING_TYPES.map((t) => (
            <option key={t} value={t}>
              {listingTypeLabel(t)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="title" className={labelClass}>
          Başlıq <span className="text-badge-lostfound">*</span>
        </label>
        <input id="title" name="title" required minLength={3} maxLength={100} className={inputClass} />
      </div>

      {(type === 'SALE' || type === 'MATING') && (
        <div className="space-y-1">
          <label htmlFor="price" className={labelClass}>
            Qiymət (₼) {type === 'SALE' && <span className="text-badge-lostfound">*</span>}
          </label>
          <input id="price" name="price" type="number" step="any" min={0} className={inputClass} />
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="description" className={labelClass}>
          Təsvir
        </label>
        <textarea id="description" name="description" rows={4} maxLength={4000} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="cityId" className={labelClass}>
            Şəhər
          </label>
          <select id="cityId" name="cityId" className={inputClass} defaultValue="">
            <option value="">Seçin…</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className={labelClass}>
            Telefon <span className="text-badge-lostfound">*</span>
          </label>
          <input id="phone" name="phone" required placeholder="+994 ..." className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="address" className={labelClass}>
            Ünvan
          </label>
          <input id="address" name="address" maxLength={200} className={inputClass} />
        </div>
      </div>

      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}

      <p className="rounded-lg bg-cream-100 p-3 text-xs text-brand-900/60">
        Elan yaradıldıqdan sonra admin təsdiqinə göndərilir və təsdiqlənənə qədər saytda görünmür.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? 'Göndərilir…' : 'Elanı yerləşdir'}
      </Button>
    </form>
  );
}
