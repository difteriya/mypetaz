'use client';

import { useActionState, useState } from 'react';
import { Button } from '@mypet/ui';
import {
  createShareLinkAction,
  toggleShareLinkAction,
  deleteShareLinkAction,
} from '@/lib/passport/share-actions';

interface ShareLinkView {
  id: string;
  token: string;
  active: boolean;
  sharedFields: { basicInfo?: boolean; passport?: boolean; medicalHistory?: boolean };
}

function LinkRow({ link }: { link: ShareLinkView }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/p/${link.token}` : `/p/${link.token}`;
  const parts = [
    link.sharedFields.basicInfo && 'Əsas',
    link.sharedFields.passport && 'Pasport',
    link.sharedFields.medicalHistory && 'Tibbi',
  ].filter(Boolean);

  return (
    <li className="rounded-lg border border-cream-200 p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs ${link.active ? 'bg-badge-sale/15 text-badge-sale' : 'bg-cream-200 text-brand-900/60'}`}>
          {link.active ? 'Aktiv' : 'Deaktiv'}
        </span>
        <span className="text-xs text-brand-900/50">{parts.join(' · ')}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="truncate rounded bg-cream-100 px-2 py-1 text-xs">{url}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(url);
            setCopied(true);
          }}
          className="text-xs text-brand-600 hover:underline"
        >
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
        {link.active && (
          <a href={`/p/${link.token}`} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">
            Bax
          </a>
        )}
        <a href={`/p/${link.token}/pdf`} className="text-xs text-brand-600 hover:underline">
          PDF
        </a>
        <form action={toggleShareLinkAction}>
          <input type="hidden" name="linkId" value={link.id} />
          <button type="submit" className="text-xs text-brand-600 hover:underline">
            {link.active ? 'Deaktiv et' : 'Aktiv et'}
          </button>
        </form>
        <form action={deleteShareLinkAction}>
          <input type="hidden" name="linkId" value={link.id} />
          <button type="submit" className="text-xs text-badge-lostfound hover:underline">
            Sil
          </button>
        </form>
      </div>
    </li>
  );
}

export function ShareManager({ petId, links }: { petId: string; links: ShareLinkView[] }) {
  const [state, formAction, pending] = useActionState(createShareLinkAction, undefined);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-3 rounded-card bg-white p-5">
        <input type="hidden" name="petId" value={petId} />
        <p className="text-sm font-medium">Hansı məlumatlar görünsün?</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="basicInfo" defaultChecked className="size-4" /> Əsas məlumat
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="passport" className="size-4" /> Pasport
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="medicalHistory" className="size-4" /> Tibbi tarixçə
          </label>
        </div>
        {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
        {state?.ok && <p className="text-sm text-badge-sale">{state.ok}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Yaradılır…' : 'Paylaşım linki yarat'}
        </Button>
      </form>

      {links.length > 0 && (
        <ul className="space-y-2">
          {links.map((l) => (
            <LinkRow key={l.id} link={l} />
          ))}
        </ul>
      )}
    </div>
  );
}
