'use client';

import { useActionState } from 'react';
import { createWalkInAction } from '@/lib/actions';

const inputClass =
  'w-full rounded-lg border border-vline bg-white px-3 py-2 text-sm outline-none focus:border-vteal-500';

interface PetOpt {
  id: string;
  name: string;
  breedName: string | null;
  categoryName: string;
}

export function WalkInForm({ pets }: { pets: PetOpt[] }) {
  const [state, formAction, pending] = useActionState(createWalkInAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="petId" className="text-sm font-semibold">Pet</label>
        <select id="petId" name="petId" required defaultValue="" className={inputClass}>
          <option value="" disabled>Seçin…</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.breedName ?? p.categoryName}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="date" className="text-sm font-semibold">Tarix</label>
          <input id="date" name="date" type="date" required className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="time" className="text-sm font-semibold">Saat</label>
          <input id="time" name="time" type="time" required className={inputClass} />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="note" className="text-sm font-semibold">Qeyd</label>
        <input id="note" name="note" maxLength={300} placeholder="Şikayət / səbəb" className={inputClass} />
      </div>

      {/* Mode: customer is here (confirmed now) vs offer sent for the customer to accept */}
      <fieldset className="space-y-1.5">
        <legend className="text-sm font-semibold">Rejim</legend>
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" name="mode" value="walkin" defaultChecked className="mt-0.5" />
          <span>
            <b>Walk-in</b> — müştəri buradadır, dərhal təsdiqli yaradılır
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" name="mode" value="propose" className="mt-0.5" />
          <span>
            <b>Təklif göndər</b> — müştəriyə bildiriş gedir, o qəbul edəndə təsdiqlənir
          </span>
        </label>
      </fieldset>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-vteal-500 px-5 py-2 text-sm font-bold text-white hover:bg-vteal-700 disabled:opacity-50"
      >
        {pending ? 'Göndərilir…' : 'Təyinat yarat'}
      </button>
    </form>
  );
}
