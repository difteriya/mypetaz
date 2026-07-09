'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { transferOwnershipAction } from '@/lib/pets/transfer-actions';

export function TransferForm({ petId }: { petId: string }) {
  const [state, formAction, pending] = useActionState(transferOwnershipAction, undefined);

  return (
    <details className="rounded-card bg-white p-5 ring-1 ring-cream-200">
      <summary className="cursor-pointer font-semibold text-brand-700">Sahibliyi köçür</summary>
      <form action={formAction} className="mt-3 space-y-2">
        <input type="hidden" name="petId" value={petId} />
        <p className="text-xs text-ink/60">
          Alıcının hesabını e-poçt və ya telefonla seçin. Təsdiqdən sonra pet və onun tam tarixçəsi
          (pasport, peyvəndlər) yeni sahibə köçürüləcək və aktiv elan bağlanacaq.
        </p>
        <input
          name="buyerContact"
          placeholder="Alıcının e-poçtu və ya telefonu"
          className="w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
        {state?.ok && <p className="text-sm text-badge-sale">{state.ok}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Köçürülür…' : 'Sahibliyi təsdiq et'}
        </Button>
      </form>
    </details>
  );
}
