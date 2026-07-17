'use client';

import { useActionState, useEffect, useState } from 'react';

export type EditState = { error?: string; ok?: string } | undefined;
type EditAction = (prev: EditState, fd: FormData) => Promise<EditState>;

/**
 * Inline rename: shows the value with a "Redaktə" link; on click swaps to an
 * input + Save/Cancel. Collapses back to display when the action reports `ok`.
 */
export function InlineEditName({
  action,
  id,
  value,
  inputName = 'name',
  label = 'Redaktə',
}: {
  action: EditAction;
  id: string;
  value: string;
  inputName?: string;
  label?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <span className="inline-flex items-center gap-2">
        <span>{value}</span>
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-brand-600 hover:underline">
          {label}
        </button>
      </span>
    );
  }

  return (
    <form action={formAction} className="inline-flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      <input
        name={inputName}
        defaultValue={value}
        autoFocus
        required
        className="rounded border border-cream-300 bg-white px-2 py-1 text-sm outline-none focus:border-brand-400"
      />
      <button type="submit" disabled={pending} className="text-xs font-semibold text-brand-600 hover:underline">
        {pending ? '…' : 'Saxla'}
      </button>
      <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink/50 hover:underline">
        Ləğv
      </button>
      {state?.error && <span className="text-xs text-badge-lostfound">{state.error}</span>}
    </form>
  );
}
