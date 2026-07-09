'use client';

import { useState } from 'react';
import { Button } from '@mypet/ui';

/** "Nömrəni göstər" — masked until clicked, plus a WhatsApp link (PLAN.md §2.4). */
export function PhoneReveal({ phone }: { phone: string }) {
  const [revealed, setRevealed] = useState(false);
  const digits = phone.replace(/[^\d]/g, '');
  const waNumber = digits.startsWith('994') ? digits : digits.replace(/^0/, '994');

  return (
    <div className="flex flex-wrap gap-2">
      {revealed ? (
        <a href={`tel:${phone}`} className="inline-flex items-center rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white">
          {phone}
        </a>
      ) : (
        <Button type="button" onClick={() => setRevealed(true)}>
          Nömrəni göstər
        </Button>
      )}
      <a
        href={`https://wa.me/${waNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
      >
        WhatsApp
      </a>
    </div>
  );
}
