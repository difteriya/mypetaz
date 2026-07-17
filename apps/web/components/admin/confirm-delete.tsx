'use client';

import { useState } from 'react';

type DeleteAction = (formData: FormData) => void | Promise<void>;

/**
 * Delete control with an "Are you sure?" modal. Passes the row id to the given
 * server action only after the admin confirms.
 */
export function ConfirmDeleteButton({
  action,
  id,
  itemName,
  label = 'Sil',
  note,
}: {
  action: DeleteAction;
  id: string;
  itemName: string;
  label?: string;
  note?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-badge-lostfound hover:underline"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-card bg-white p-5 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-brand-700">Silinsin?</h3>
            <p className="mt-2 text-sm text-ink/70">
              <b>{itemName}</b> silinəcək. Bu əməliyyat geri qaytarıla bilməz.
            </p>
            {note && <p className="mt-1 text-xs text-ink/50">{note}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-cream-200 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-cream-100"
              >
                Ləğv et
              </button>
              <form action={action}>
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  className="rounded-lg bg-badge-lostfound px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Bəli, sil
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
