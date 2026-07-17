'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';

type State = { error?: string; ok?: string } | undefined;
type Action = (prev: State, fd: FormData) => Promise<State>;

/** Single-field "add" form for a flat taxonomy (name → server action). */
export function TaxonomyAddForm({
  action,
  title,
  placeholder,
}: {
  action: Action;
  title: string;
  placeholder: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="rounded-card border border-cream-200 bg-white p-5">
      <h2 className="mb-3 font-semibold text-brand-700">{title}</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <Button type="submit" disabled={pending}>{pending ? 'Əlavə olunur…' : 'Əlavə et'}</Button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-badge-lostfound">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-sm text-badge-sale">{state.ok}</p>}
    </form>
  );
}
