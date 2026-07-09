'use client';

import { useEffect, useState } from 'react';
import { imageVariant } from '@/lib/images';
import { PawIcon, CloseIcon } from '@/components/icons';

interface Img {
  id: string;
  url: string;
  alt: string;
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

export function ListingGallery({ images }: { images: Img[] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const n = images.length;
  const go = (d: number) => setActive((i) => (i + d + n) % n);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, n]);

  if (n === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-card bg-cream-100">
        <PawIcon className="size-16 text-brand-200" />
      </div>
    );
  }

  const current = images[active]!;

  return (
    <div>
      {/* Main image — blurred filler behind a contained image (turbo.az style) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-card bg-cream-100"
      >
        <img src={imageVariant(current.url, 'detail')} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover blur-2xl opacity-60" />
        <img src={imageVariant(current.url, 'detail')} alt={current.alt} className="relative size-full object-contain" />
      </button>

      {/* Thumbnails */}
      {n > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`size-16 shrink-0 overflow-hidden rounded-lg ring-2 transition-all ${i === active ? 'ring-brand-500' : 'ring-transparent hover:ring-cream-300'}`}
            >
              <img src={imageVariant(img.url, 'thumb')} alt={img.alt} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox carousel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setOpen(false)}>
          <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <CloseIcon className="size-6" />
          </button>
          {n > 1 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
              <Chevron dir="left" />
            </button>
          )}
          <img
            src={imageVariant(current.url, 'full')}
            alt={current.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] object-contain"
          />
          {n > 1 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
              <Chevron dir="right" />
            </button>
          )}
          <div className="absolute bottom-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {active + 1} / {n}
          </div>
        </div>
      )}
    </div>
  );
}
