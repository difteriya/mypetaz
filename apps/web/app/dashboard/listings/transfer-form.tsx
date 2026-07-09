'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { transferOwnershipAction } from '@/lib/pets/transfer-actions';

export function TransferForm({ listingId }: { listingId: string }) {
  const [state, formAction, pending] = useActionState(transferOwnershipAction, undefined);

  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-sm font-semibold text-brand-600">
        Sahibliyi köçür
      </summary>
      <form action={formAction} className="mt-2 space-y-2">
        <input type="hidden" name="listingId" value={listingId} />
        <p className="text-xs text-brand-900/60">
          Alıcının hesabını e-poçt və ya telefonla seçin. Təsdiqdən sonra pet və onun tam
          tarixçəsi (pasport, peyvəndlər) yeni sahibə köçürüləcək.
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
