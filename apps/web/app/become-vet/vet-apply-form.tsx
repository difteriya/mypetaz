'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { applyVetAction } from '@/lib/vet/actions';
import { DAYS } from '@/lib/business/hours';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';
const labelClass = 'text-sm font-medium';

export function VetApplyForm() {
  const [state, formAction, pending] = useActionState(applyVetAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="clinicName" className={labelClass}>
          Klinika / həkim adı <span className="text-badge-lostfound">*</span>
        </label>
        <input id="clinicName" name="clinicName" required minLength={2} maxLength={120} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="specialty" className={labelClass}>İxtisas sahəsi</label>
          <input id="specialty" name="specialty" maxLength={120} placeholder="Məs. cərrahiyyə, dermatologiya" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="licenseNo" className={labelClass}>Lisenziya №</label>
          <input id="licenseNo" name="licenseNo" maxLength={60} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className={labelClass}>Telefon</label>
          <input id="phone" name="phone" maxLength={20} placeholder="+994 ..." className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="address" className={labelClass}>Ünvan</label>
          <input id="address" name="address" maxLength={200} className={inputClass} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="about" className={labelClass}>Haqqında</label>
          <textarea
            id="about"
            name="about"
            rows={3}
            maxLength={2000}
            placeholder="Klinikanız / təcrübəniz haqqında qısa məlumat — açıq profildə göstərilir"
            className={inputClass}
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className={labelClass}>İş saatları</legend>
        {DAYS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm">
            <span>{label}</span>
            <input type="time" name={`open_${key}`} className="rounded border border-cream-200 px-2 py-1" />
            <input type="time" name={`close_${key}`} className="rounded border border-cream-200 px-2 py-1" />
          </div>
        ))}
      </fieldset>

      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}

      <p className="rounded-lg bg-cream-100 p-3 text-xs text-brand-900/60">
        Müraciət admin təsdiqinə göndərilir. Təsdiqlənəndən sonra vet.mypet.az panelinə çıxışınız açılır.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? 'Göndərilir…' : 'Müraciət et'}
      </Button>
    </form>
  );
}
