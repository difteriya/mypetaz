'use client';

import { useActionState } from 'react';
import { createVisitRecordAction } from '@/lib/actions';

const inputClass =
  'w-full rounded-lg border border-vline bg-white px-3 py-2 text-sm outline-none focus:border-vteal-500';

/** Draft visit record for a completed appointment (§7.3). */
export function VisitRecordForm({ appointmentId }: { appointmentId: string }) {
  const [state, formAction, pending] = useActionState(createVisitRecordAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="recordType" className="text-sm font-semibold">Növ</label>
          <select id="recordType" name="recordType" required defaultValue="EXAM" className={inputClass}>
            <option value="EXAM">Müayinə</option>
            <option value="VACCINE">Peyvənd</option>
            <option value="SURGERY">Əməliyyat</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="examType" className="text-sm font-semibold">Prosedur adı</label>
          <input id="examType" name="examType" required minLength={2} maxLength={120} placeholder="Məs. Quduzluq peyvəndi" className={inputClass} />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-semibold">Qeyd</label>
        <textarea id="description" name="description" rows={3} maxLength={2000} placeholder="Müşahidələr, dozalar, tövsiyələr…" className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-vteal-500 px-5 py-2 text-sm font-bold text-white hover:bg-vteal-700 disabled:opacity-50"
      >
        {pending ? 'Saxlanılır…' : 'Qeydi yadda saxla'}
      </button>
    </form>
  );
}
