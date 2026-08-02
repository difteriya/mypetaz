'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { savePassportAction } from '@/lib/pets/health-actions';
import { ImageDropZone } from '@/components/uploads/image-drop-zone';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';
const labelClass = 'text-sm font-medium';

export interface PassportView {
  documentNo: string;
  issueDate: string; // yyyy-mm-dd or ''
  microchipId: string;
  birthPlace: string;
  documentImage: string | null;
  documentImageAlt: string | null;
}

export function PassportSection({ petId, passport }: { petId: string; passport: PassportView }) {
  const [state, formAction, pending] = useActionState(savePassportAction, undefined);

  return (
    <details className="rounded-card bg-white p-5">
      <summary className="cursor-pointer font-semibold text-brand-700">Pasport</summary>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="petId" value={petId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="documentNo" className={labelClass}>
              Sənəd nömrəsi
            </label>
            <input id="documentNo" name="documentNo" defaultValue={passport.documentNo} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label htmlFor="issueDate" className={labelClass}>
              Verilmə tarixi
            </label>
            <input id="issueDate" name="issueDate" type="date" defaultValue={passport.issueDate} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label htmlFor="microchipId" className={labelClass}>
              Mikroçip ID
            </label>
            <input id="microchipId" name="microchipId" defaultValue={passport.microchipId} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label htmlFor="birthPlace" className={labelClass}>
              Doğulduğu yer
            </label>
            <input id="birthPlace" name="birthPlace" defaultValue={passport.birthPlace} className={inputClass} />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="documentImage" className={labelClass}>
            Sənəd şəkli
          </label>
          <ImageDropZone
            name="documentImage"
            currentUrl={passport.documentImage}
            currentAlt={passport.documentImageAlt ?? 'Pasport sənədi'}
          />
        </div>

        {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
        {state?.ok && <p className="text-sm text-badge-sale">Yadda saxlanıldı</p>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Saxlanılır…' : 'Pasportu saxla'}
        </Button>
      </form>
    </details>
  );
}
