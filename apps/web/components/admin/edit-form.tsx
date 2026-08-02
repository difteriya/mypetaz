'use client';

import { useActionState } from 'react';
import type { AdminEditState } from '@/lib/admin/content-actions';

export const adminInput =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400';
export const adminLabel = 'text-sm font-medium text-ink';

type EditAction = (prev: AdminEditState, fd: FormData) => Promise<AdminEditState>;

/**
 * Shell for the admin edit forms: wires useActionState, renders the error and
 * the save button so each entity form only declares its own fields.
 */
export function AdminEditForm({
  action,
  id,
  children,
  saveLabel = 'Yadda saxla',
}: {
  action: EditAction;
  id: string;
  children: React.ReactNode;
  saveLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      {children}
      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {pending ? 'Saxlanılır…' : saveLabel}
      </button>
    </form>
  );
}
