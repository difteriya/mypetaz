'use client';

import { useActionState } from 'react';
import { createReportAction } from '@/lib/reports/actions';

const REASONS = ['Spam', 'Saxta', 'Təhqiredici', 'Fırıldaq', 'Digər'];

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: 'LISTING' | 'BLOG_POST' | 'REVIEW' | 'BUSINESS';
  targetId: string;
}) {
  const [state, formAction, pending] = useActionState(createReportAction, undefined);

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-brand-900/40 hover:text-brand-900/70">Şikayət et</summary>
      <form action={formAction} className="mt-2 space-y-2 rounded-lg border border-cream-200 p-3">
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <select name="reason" className="w-full rounded border border-cream-200 px-2 py-1 text-sm" defaultValue="">
          <option value="" disabled>
            Səbəb seçin…
          </option>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <textarea name="note" rows={2} placeholder="Əlavə qeyd (istəyə bağlı)" className="w-full rounded border border-cream-200 px-2 py-1 text-sm" />
        {state?.error && <p className="text-badge-lostfound">{state.error}</p>}
        {state?.ok ? (
          <p className="text-badge-sale">{state.ok}</p>
        ) : (
          <button type="submit" disabled={pending} className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300">
            {pending ? 'Göndərilir…' : 'Göndər'}
          </button>
        )}
      </form>
    </details>
  );
}
