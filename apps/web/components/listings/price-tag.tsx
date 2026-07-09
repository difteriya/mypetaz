'use client';

import { useEffect, useState } from 'react';

const formatter = new Intl.NumberFormat('az-AZ');

/**
 * Price with the manat symbol (₼), falling back to the "AZN" text when the
 * glyph isn't supported by the device font (PLAN.md §2.4). Detection compares
 * the rendered width of ₼ against a guaranteed-missing glyph.
 */
export function PriceTag({ value, className = '' }: { value: number; className?: string }) {
  const [symbol, setSymbol] = useState('₼');

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.font = '16px sans-serif';
      const manat = ctx.measureText('₼').width;
      const tofu = ctx.measureText('￿').width;
      if (manat === tofu) setSymbol('AZN');
    } catch {
      /* keep ₼ */
    }
  }, []);

  return (
    <span className={className}>
      {formatter.format(value)} {symbol}
    </span>
  );
}
