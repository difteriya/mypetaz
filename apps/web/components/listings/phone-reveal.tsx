'use client';

import { useState } from 'react';
import { Button } from '@mypet/ui';

/** "Nömrəni göstər" — masked until clicked, plus a WhatsApp link (PLAN.md §2.4). */
export function PhoneReveal({ phone, block = false }: { phone: string; block?: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const digits = phone.replace(/[^\d]/g, '');
  const waNumber = digits.startsWith('994') ? digits : digits.replace(/^0/, '994');

  const btn = 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold';

  return (
    <div className={block ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
      {revealed ? (
        <a href={`tel:${phone}`} className={`${btn} bg-brand-500 text-white ${block ? 'w-full' : ''}`}>
          {phone}
        </a>
      ) : (
        <Button type="button" onClick={() => setRevealed(true)} className={block ? 'w-full' : ''}>
          Nömrəni göstər
        </Button>
      )}
      <a
        href={`https://wa.me/${waNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btn} bg-[#25D366] text-white ${block ? 'w-full' : ''}`}
      >
        WhatsApp
      </a>
    </div>
  );
}
