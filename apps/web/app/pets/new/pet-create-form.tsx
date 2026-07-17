'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { createPetAction } from '@/lib/pets/actions';
import { PetFieldset } from '@/components/pets/pet-fieldset';
import type { CategoryForForm } from '@/lib/pets/data';

export function PetCreateForm({ categories }: { categories: CategoryForForm[] }) {
  const [state, formAction, pending] = useActionState(createPetAction, undefined);

  return (
    <form action={formAction} className="space-y-8">
      <PetFieldset categories={categories} />

      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Yaradılır…' : 'Peti yarat'}
      </Button>
    </form>
  );
}
