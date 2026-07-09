'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { addHealthRecordAction, deleteHealthRecordAction } from '@/lib/pets/health-actions';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';
const labelClass = 'text-sm font-medium';

export const HEALTH_TYPE_LABEL: Record<string, string> = {
  VACCINE: 'Peyvənd',
  EXAM: 'Müayinə',
  SURGERY: 'Əməliyyat',
};

export interface HealthRecordView {
  id: string;
  type: string;
  name: string;
  dateStr: string;
  nextDateStr: string | null;
  note: string | null;
  source: string; // SELF | VET
  vetLabel?: string | null;
}

export function HealthSection({ petId, records }: { petId: string; records: HealthRecordView[] }) {
  const [state, formAction, pending] = useActionState(addHealthRecordAction, undefined);

  return (
    <section className="rounded-card bg-white p-5">
      <h2 className="font-semibold text-brand-700">Peyvənd və tibbi tarixçə</h2>

      {records.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {records.map((r) => (
            <li
              key={r.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-cream-200 p-3 text-sm"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs">
                    {HEALTH_TYPE_LABEL[r.type] ?? r.type}
                  </span>
                  <span className="font-medium">{r.name}</span>
                  <span
                    className={`text-xs ${r.source === 'VET' ? 'text-teal-600' : 'text-brand-900/50'}`}
                  >
                    {r.source === 'VET'
                      ? `${r.vetLabel ?? 'Baytar'} tərəfindən`
                      : 'Pet sahibi tərəfindən'}
                  </span>
                </div>
                <div className="mt-1 text-brand-900/60">
                  {r.dateStr}
                  {r.nextDateStr && ` · növbəti: ${r.nextDateStr}`}
                </div>
                {r.note && <p className="mt-1 text-brand-900/70">{r.note}</p>}
              </div>
              {r.source === 'SELF' && (
                <form action={deleteHealthRecordAction}>
                  <input type="hidden" name="recordId" value={r.id} />
                  <button type="submit" className="text-xs text-badge-lostfound hover:underline">
                    Sil
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-brand-900/50">Hələ qeyd yoxdur.</p>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-brand-600">+ Qeyd əlavə et</summary>
        <form action={formAction} className="mt-3 space-y-3">
          <input type="hidden" name="petId" value={petId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="type" className={labelClass}>
                Növ
              </label>
              <select id="type" name="type" className={inputClass} defaultValue="VACCINE">
                <option value="VACCINE">Peyvənd</option>
                <option value="EXAM">Müayinə</option>
                <option value="SURGERY">Əməliyyat</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="hr-name" className={labelClass}>
                Ad <span className="text-badge-lostfound">*</span>
              </label>
              <input id="hr-name" name="name" required maxLength={120} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label htmlFor="date" className={labelClass}>
                Tarix <span className="text-badge-lostfound">*</span>
              </label>
              <input id="date" name="date" type="date" required className={inputClass} />
            </div>
            <div className="space-y-1">
              <label htmlFor="nextDate" className={labelClass}>
                Növbəti tarix
              </label>
              <input id="nextDate" name="nextDate" type="date" className={inputClass} />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="note" className={labelClass}>
              Qeyd
            </label>
            <textarea id="note" name="note" rows={2} maxLength={1000} className={inputClass} />
          </div>

          {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
          {state?.ok && <p className="text-sm text-badge-sale">Əlavə edildi</p>}

          <Button type="submit" disabled={pending}>
            {pending ? 'Əlavə edilir…' : 'Əlavə et'}
          </Button>
        </form>
      </details>
    </section>
  );
}
