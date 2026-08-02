import type { Metadata } from 'next';
import {
  getBranding,
  BRAND_LOGO_KEY,
  BRAND_FAVICON_KEY,
  DEFAULT_FAVICON,
} from '@/lib/cms/branding';
import { resetBrandingAction } from '@/lib/cms/branding-actions';
import { BrandingForm } from './branding-form';

export const metadata: Metadata = { title: 'Brend' };

function Current({
  title,
  url,
  fallbackNote,
  resetKey,
  boxClass,
}: {
  title: string;
  url: string | null;
  fallbackNote: string;
  resetKey: string;
  boxClass: string;
}) {
  return (
    <div className="rounded-card bg-white p-4 ring-1 ring-cream-200">
      <p className="mb-2 text-sm font-bold text-ink">{title}</p>
      <div className="flex items-center gap-3">
        <span className={`grid place-items-center rounded-lg bg-cream-100 ${boxClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url ?? DEFAULT_FAVICON} alt={title} className="max-h-full max-w-full object-contain" />
        </span>
        <div className="min-w-0 flex-1">
          {url ? (
            <>
              <p className="truncate text-xs text-ink/50">{url}</p>
              <form action={resetBrandingAction} className="mt-1">
                <input type="hidden" name="key" value={resetKey} />
                <button className="text-xs font-semibold text-badge-lostfound hover:underline">
                  Standarta qaytar
                </button>
              </form>
            </>
          ) : (
            <p className="text-xs text-ink/50">{fallbackNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function AdminBrandingPage() {
  const { logo, favicon } = await getBranding();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Brend</h1>
        <p className="mt-1 text-sm text-ink/60">
          Saytın loqosu və brauzer ikonu. Dəyişiklik dərhal qüvvəyə minir — brauzer favicon-u
          keşlədiyi üçün sizdə görünməsə, səhifəni Ctrl+F5 ilə yeniləyin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Current
          title="Hazırkı loqo"
          url={logo}
          fallbackNote="Standart: pəncə işarəsi + “mypet.az” yazısı"
          resetKey={BRAND_LOGO_KEY}
          boxClass="h-12 w-28 p-1.5"
        />
        <Current
          title="Hazırkı favicon"
          url={favicon}
          fallbackNote="Standart: coral pəncə plitəsi"
          resetKey={BRAND_FAVICON_KEY}
          boxClass="size-12 p-1.5"
        />
      </div>

      <div className="rounded-card bg-white p-6 ring-1 ring-cream-200">
        <BrandingForm />
      </div>
    </div>
  );
}
