'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateFieldAction } from '@/lib/admin/category-field-actions';

const inputClass =
  'w-full rounded border border-cream-300 bg-white px-2 py-1 text-sm outline-none focus:border-brand-400';

/** Inline editor for a category field: label + (SELECT) options + required. The
 * fieldName key and any stored pet data are never touched. */
export function FieldEdit({
  id,
  label,
  type,
  options,
  required,
}: {
  id: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateFieldAction, undefined);

  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <span className="inline-flex items-center gap-2">
        <span>{label}</span>
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-brand-600 hover:underline">
          Redaktə
        </button>
      </span>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-md space-y-2 rounded-lg bg-cream-50 p-3">
      <input type="hidden" name="id" value={id} />
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink/60">Label</label>
        <input name="label" defaultValue={label} required autoFocus className={inputClass} />
      </div>
      {type === 'SELECT' && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink/60">Seçimlər (hər sətirdə bir)</label>
          <textarea name="options" defaultValue={options.join('\n')} rows={3} className={inputClass} />
        </div>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="required" defaultChecked={required} className="size-4" /> Tələb olunur
      </label>
      {state?.error && <p className="text-xs text-badge-lostfound">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="text-xs font-semibold text-brand-600 hover:underline">
          {pending ? '…' : 'Saxla'}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink/50 hover:underline">
          Ləğv
        </button>
      </div>
    </form>
  );
}
