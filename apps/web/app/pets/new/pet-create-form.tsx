'use client';

import { useActionState, useState } from 'react';
import { Button } from '@mypet/ui';
import { createPetAction } from '@/lib/pets/actions';
import { fieldOptions, type PetFieldDef } from '@/lib/pets/fields';
import type { CategoryForForm } from '@/lib/pets/data';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';
const labelClass = 'text-sm font-medium';

function DynamicField({ field }: { field: PetFieldDef }) {
  const name = `sf_${field.fieldName}`;
  if (field.type === 'BOOL') {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name={name} className="size-4" />
        {field.label}
      </label>
    );
  }
  return (
    <div className="space-y-1">
      <label htmlFor={name} className={labelClass}>
        {field.label}
        {field.required && <span className="text-badge-lostfound"> *</span>}
      </label>
      {field.type === 'SELECT' ? (
        <select id={name} name={name} required={field.required} className={inputClass} defaultValue="">
          <option value="">Seçin…</option>
          {fieldOptions(field).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={field.type === 'NUMBER' ? 'number' : 'text'}
          step={field.type === 'NUMBER' ? 'any' : undefined}
          required={field.required}
          className={inputClass}
        />
      )}
    </div>
  );
}

export function PetCreateForm({ categories }: { categories: CategoryForForm[] }) {
  const [state, formAction, pending] = useActionState(createPetAction, undefined);
  const [categoryId, setCategoryId] = useState('');
  const category = categories.find((c) => c.id === categoryId);

  return (
    <form action={formAction} className="space-y-8">
      {/* Step 1 — category */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-700">1. Kateqoriya seçin</h2>
        <input type="hidden" name="categoryId" value={categoryId} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`flex flex-col items-center gap-1 rounded-card border p-3 transition-colors ${
                c.id === categoryId
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-cream-200 bg-white hover:border-brand-200'
              }`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {category && (
        <>
          {/* Step 2 — breed */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-brand-700">2. Cins / növ</h2>
            {category.freeTextBreed ? (
              <input
                name="breedFreeText"
                placeholder="Növü yazın"
                className={inputClass}
              />
            ) : (
              <select name="breedId" className={inputClass} defaultValue="">
                <option value="">Seçin…</option>
                {category.breeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </section>

          {/* Step 3 — details */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-brand-700">3. Məlumatlar</h2>

            <div className="space-y-1">
              <label htmlFor="name" className={labelClass}>
                Ad <span className="text-badge-lostfound">*</span>
              </label>
              <input id="name" name="name" required maxLength={60} className={inputClass} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="sex" className={labelClass}>
                  Cins
                </label>
                <select id="sex" name="sex" className={inputClass} defaultValue="UNKNOWN">
                  <option value="MALE">Erkək</option>
                  <option value="FEMALE">Dişi</option>
                  <option value="UNKNOWN">Bilinmir</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="birthDate" className={labelClass}>
                  Doğum tarixi
                </label>
                <input id="birthDate" name="birthDate" type="date" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label htmlFor="color" className={labelClass}>
                  Rəng
                </label>
                <input id="color" name="color" maxLength={40} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label htmlFor="weight" className={labelClass}>
                  Çəki (kq)
                </label>
                <input id="weight" name="weight" type="number" step="any" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label htmlFor="microchipNo" className={labelClass}>
                  Mikroçip nömrəsi
                </label>
                <input id="microchipNo" name="microchipNo" maxLength={40} className={inputClass} />
              </div>
              <label className="flex items-center gap-2 self-end text-sm">
                <input type="checkbox" name="birthApprox" className="size-4" />
                Doğum tarixi təxminidir
              </label>
            </div>

            {/* Dynamic, category-specific fields (PLAN.md §4.1) */}
            {category.fields.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {category.fields.map((f) => (
                  <DynamicField key={f.id} field={f as PetFieldDef} />
                ))}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="description" className={labelClass}>
                Qısa təsvir / xasiyyət
              </label>
              <textarea id="description" name="description" rows={3} className={inputClass} />
            </div>

            <div className="space-y-1">
              <label htmlFor="images" className={labelClass}>
                Şəkillər
              </label>
              <input
                id="images"
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="block w-full text-sm"
              />
            </div>
          </section>

          {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? 'Yaradılır…' : 'Peti yarat'}
          </Button>
        </>
      )}
    </form>
  );
}
