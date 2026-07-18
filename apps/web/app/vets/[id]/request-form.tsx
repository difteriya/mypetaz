'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { requestAppointmentAction } from '@/lib/vet/appointment-actions';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400';

interface PetOpt {
  id: string;
  name: string;
  label: string;
}

export function RequestForm({ vetId, pets }: { vetId: string; pets: PetOpt[] }) {
  const [state, formAction, pending] = useActionState(requestAppointmentAction, undefined);

  if (state?.ok) {
    return (
      <div className="rounded-card bg-badge-sale/10 p-4 text-sm font-semibold text-badge-sale">
        {state.ok}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="vetId" value={vetId} />
      <div className="space-y-1">
        <label htmlFor="petId" className="text-sm font-medium">Pet</label>
        <select id="petId" name="petId" required defaultValue="" className={inputClass}>
          <option value="" disabled>Seçin…</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="date" className="text-sm font-medium">Tarix</label>
          <input id="date" name="date" type="date" required className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="time" className="text-sm font-medium">Saat</label>
          <input id="time" name="time" type="time" required className={inputClass} />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="note" className="text-sm font-medium">Qeyd</label>
        <input id="note" name="note" maxLength={300} placeholder="Şikayət / səbəb" className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Göndərilir…' : 'Sorğu göndər'}
      </Button>
    </form>
  );
}
