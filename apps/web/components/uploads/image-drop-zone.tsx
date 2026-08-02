'use client';

import { useEffect, useRef, useState } from 'react';
import { imageVariant } from '@/lib/images';
import { CloseIcon } from '@/components/icons';

/**
 * Drag-and-drop picker for images that are submitted with the surrounding form
 * (pet photos, business logo/banner, blog cover…).
 *
 * It owns a real `<input type="file">` so plain form submission keeps working —
 * the selection is written back with a DataTransfer so removing or reordering a
 * thumbnail changes what the server receives. Previews come from object URLs,
 * revoked on unmount.
 */

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

function UploadIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

export function ImageDropZone({
  name,
  multiple = false,
  maxFiles = 10,
  maxMb = 10,
  currentUrl = null,
  currentAlt = '',
  hint,
}: {
  name: string;
  multiple?: boolean;
  maxFiles?: number;
  maxMb?: number;
  /** Already-saved image (single-image fields) shown until a new one is picked. */
  currentUrl?: string | null;
  currentAlt?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  // Object URLs are recreated whenever the selection changes, and always revoked.
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  /** Push the current selection back into the real input so the form submits it. */
  const syncInput = (next: File[]) => {
    const dt = new DataTransfer();
    next.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
    setFiles(next);
  };

  const accept = (incoming: FileList | File[]) => {
    const picked = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
    if (picked.length === 0) return;

    const tooBig = picked.find((f) => f.size > maxMb * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" ${maxMb} MB-dan böyükdür.`);
      return;
    }
    setError(null);

    const next = multiple ? [...files, ...picked].slice(0, maxFiles) : picked.slice(0, 1);
    if (multiple && files.length + picked.length > maxFiles) {
      setError(`Ən çox ${maxFiles} şəkil seçə bilərsiniz.`);
    }
    syncInput(next);
  };

  const removeAt = (i: number) => {
    setError(null);
    syncInput(files.filter((_, idx) => idx !== i));
  };

  /** Reorder by dragging a thumbnail onto another — first image is the cover. */
  const onThumbDrop = (target: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from == null || from === target) return;
    const next = [...files];
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(target, 0, moved);
    syncInput(next);
  };

  const showCurrent = currentUrl && files.length === 0;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => e.target.files && accept(e.target.files)}
      />

      {/* Drop area — also a keyboard-reachable button that opens the picker. */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          accept(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-card border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragOver
            ? 'border-brand-400 bg-brand-50 text-brand-700'
            : 'border-cream-200 bg-white text-ink/55 hover:border-brand-300 hover:bg-cream-50'
        }`}
      >
        <UploadIcon className={dragOver ? 'size-8 text-brand-500' : 'size-8 text-brand-300'} />
        <span className="text-sm font-semibold">
          Şəkli buraya sürüşdürün <span className="font-normal text-ink/45">və ya seçmək üçün klikləyin</span>
        </span>
        <span className="text-xs text-ink/45">
          {hint ?? `JPG, PNG, WebP, GIF · maks. ${maxMb} MB${multiple ? ` · ${maxFiles} şəkilə qədər` : ''}`}
        </span>
      </button>

      {error && <p className="text-sm text-badge-lostfound">{error}</p>}

      {/* Existing saved image (single-image fields) */}
      {showCurrent && (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageVariant(currentUrl, 'thumb')}
            alt={currentAlt}
            className="size-16 rounded-lg object-cover"
          />
          <span className="text-xs text-ink/50">Hazırkı şəkil — yenisini seçsəniz əvəzlənəcək.</span>
        </div>
      )}

      {/* Picked files */}
      {previews.length > 0 && (
        <>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previews.map((src, i) => (
              <li
                key={src}
                draggable={multiple}
                onDragStart={() => {
                  dragIndex.current = i;
                }}
                onDragOver={(e) => multiple && e.preventDefault()}
                onDrop={() => multiple && onThumbDrop(i)}
                className={`group relative overflow-hidden rounded-lg ring-1 ring-cream-200 ${
                  multiple ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={files[i]?.name ?? ''} className="aspect-square w-full object-cover" />

                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  title="Sil"
                  aria-label={`${files[i]?.name ?? 'Şəkil'} — sil`}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-badge-lostfound shadow hover:bg-white"
                >
                  <CloseIcon className="size-3.5" />
                </button>

                {multiple && (
                  <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    <DragHandleIcon />
                    {i === 0 ? 'Əsas' : i + 1}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {multiple && previews.length > 1 && (
            <p className="text-xs text-ink/45">
              Sıranı dəyişmək üçün şəkilləri sürüşdürün — birinci şəkil əsas (cover) olur.
            </p>
          )}
        </>
      )}
    </div>
  );
}
