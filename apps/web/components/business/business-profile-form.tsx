'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { saveBusinessProfileAction } from '@/lib/business/actions';
import { DAYS, type BusinessHours } from '@/lib/business/hours';
import { imageVariant } from '@/lib/images';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';
const labelClass = 'text-sm font-medium';

export interface BusinessDefaults {
  name: string;
  description: string;
  cityId: string;
  address: string;
  lat: string;
  lng: string;
  phone: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  hours: BusinessHours;
  banner: string | null;
  logo: string | null;
}

export function BusinessProfileForm({
  cities,
  defaults,
  submitLabel,
}: {
  cities: { id: string; name: string }[];
  defaults: BusinessDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(saveBusinessProfileAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className={labelClass}>
          Biznes adı <span className="text-badge-lostfound">*</span>
        </label>
        <input id="name" name="name" required defaultValue={defaults.name} maxLength={100} className={inputClass} />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className={labelClass}>
          Təsvir
        </label>
        <textarea id="description" name="description" rows={3} defaultValue={defaults.description} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="cityId" className={labelClass}>
            Şəhər
          </label>
          <select id="cityId" name="cityId" defaultValue={defaults.cityId} className={inputClass}>
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
            Telefon
          </label>
          <input id="phone" name="phone" defaultValue={defaults.phone} className={inputClass} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="address" className={labelClass}>
            Ünvan
          </label>
          <input id="address" name="address" defaultValue={defaults.address} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="lat" className={labelClass}>
            En dairəsi (lat)
          </label>
          <input id="lat" name="lat" type="number" step="any" defaultValue={defaults.lat} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="lng" className={labelClass}>
            Uzunluq (lng)
          </label>
          <input id="lng" name="lng" type="number" step="any" defaultValue={defaults.lng} className={inputClass} />
        </div>
      </div>

      {/* Images */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="banner" className={labelClass}>
            Banner
          </label>
          {defaults.banner && (
            <img src={imageVariant(defaults.banner, 'card')} alt="Banner" className="mb-1 h-20 w-full rounded object-cover" />
          )}
          <input id="banner" name="banner" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="block w-full text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="logo" className={labelClass}>
            Loqo
          </label>
          {defaults.logo && (
            <img src={imageVariant(defaults.logo, 'thumb')} alt="Loqo" className="mb-1 size-16 rounded object-cover" />
          )}
          <input id="logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="block w-full text-sm" />
        </div>
      </div>

      {/* Social links */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(['instagram', 'facebook', 'tiktok', 'website'] as const).map((k) => (
          <div key={k} className="space-y-1">
            <label htmlFor={k} className={`${labelClass} capitalize`}>
              {k}
            </label>
            <input id={k} name={k} defaultValue={defaults[k]} className={inputClass} />
          </div>
        ))}
      </div>

      {/* Hours */}
      <fieldset className="space-y-2">
        <legend className={labelClass}>İş saatları</legend>
        {DAYS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm">
            <span>{label}</span>
            <input type="time" name={`open_${key}`} defaultValue={defaults.hours[key]?.open ?? ''} className="rounded border border-cream-200 px-2 py-1" />
            <input type="time" name={`close_${key}`} defaultValue={defaults.hours[key]?.close ?? ''} className="rounded border border-cream-200 px-2 py-1" />
          </div>
        ))}
      </fieldset>

      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saxlanılır…' : submitLabel}
      </Button>
    </form>
  );
}
