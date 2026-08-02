'use client';

import { useActionState } from 'react';
import { saveBrandingAction } from '@/lib/cms/branding-actions';
import { ImageDropZone } from '@/components/uploads/image-drop-zone';

/** Upload a logo and/or favicon. Empty fields keep whatever is already set. */
export function BrandingForm() {
  const [state, formAction, pending] = useActionState(saveBrandingAction, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="font-bold text-ink">Loqo</h2>
          <p className="text-sm text-ink/60">
            Başlıqda pəncə + “mypet.az” yazısını əvəz edir. Şəffaf fonlu PNG və ya SVG tövsiyə
            olunur; hündürlüyü 32px-ə uyğunlaşdırılır.
          </p>
          <ImageDropZone name="logo" maxMb={1} hint="SVG, PNG, JPG · maks. 1 MB" />
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-ink">Favicon</h2>
          <p className="text-sm text-ink/60">
            Brauzer tabında görünən ikon. Kvadrat SVG, PNG (512×512) və ya ICO seçin — fayl
            olduğu formatda saxlanılır.
          </p>
          <ImageDropZone name="favicon" maxMb={1} hint="SVG, PNG, ICO · maks. 1 MB" />
        </div>
      </div>

      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
      {state?.ok && <p className="text-sm font-semibold text-badge-sale">{state.ok}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {pending ? 'Yüklənir…' : 'Yadda saxla'}
      </button>
    </form>
  );
}
