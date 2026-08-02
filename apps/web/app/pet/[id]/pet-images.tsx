'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { Button } from '@mypet/ui';
import { imageVariant } from '@/lib/images';
import {
  addPetImagesAction,
  deletePetImageAction,
  reorderPetImagesAction,
} from '@/lib/pets/actions';
import { PawIcon, CloseIcon } from '@/components/icons';
import { ImageDropZone } from '@/components/uploads/image-drop-zone';

interface Img {
  id: string;
  url: string;
  alt: string;
}

/**
 * Saved pet photos: thumbnail grid with a remove button on each and
 * drag-to-reorder (the first photo is the cover). Reordering is optimistic —
 * the new order renders immediately and is persisted in the background.
 */
export function PetImages({ petId, images }: { petId: string; images: Img[] }) {
  const [state, formAction, pending] = useActionState(addPetImagesAction, undefined);
  const [order, setOrder] = useState<Img[]>(images);
  const [, startTransition] = useTransition();
  const dragIndex = useRef<number | null>(null);

  // Follow the server whenever photos are added or removed.
  useEffect(() => setOrder(images), [images]);

  const persist = (next: Img[]) => {
    const fd = new FormData();
    fd.set('petId', petId);
    fd.set('ids', next.map((i) => i.id).join(','));
    startTransition(() => {
      void reorderPetImagesAction(fd);
    });
  };

  const onDrop = (target: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from == null || from === target) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(target, 0, moved);
    setOrder(next);
    persist(next);
  };

  return (
    <div>
      {order.length > 0 ? (
        <>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {order.map((img, i) => (
              <li
                key={img.id}
                draggable
                onDragStart={() => {
                  dragIndex.current = i;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="group relative cursor-grab overflow-hidden rounded-card active:cursor-grabbing"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageVariant(img.url, 'detail')}
                  alt={img.alt}
                  className="aspect-square w-full object-cover"
                  draggable={false}
                />

                <form action={deletePetImageAction} className="absolute right-1.5 top-1.5">
                  <input type="hidden" name="imageId" value={img.id} />
                  <button
                    type="submit"
                    title="Sil"
                    aria-label="Şəkli sil"
                    className="rounded-full bg-white/90 p-1 text-badge-lostfound shadow transition-colors hover:bg-white"
                  >
                    <CloseIcon className="size-3.5" />
                  </button>
                </form>

                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">
                  {i === 0 ? 'Əsas şəkil' : i + 1}
                </span>
              </li>
            ))}
          </ul>
          {order.length > 1 && (
            <p className="mt-1.5 text-xs text-ink/45">
              Sıranı dəyişmək üçün şəkilləri sürüşdürün — birinci şəkil elanlarda görünən əsas şəkildir.
            </p>
          )}
        </>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-card bg-cream-100">
          <PawIcon className="size-16 text-brand-200" />
        </div>
      )}

      <form action={formAction} className="mt-3 space-y-2">
        <input type="hidden" name="petId" value={petId} />
        <ImageDropZone name="images" multiple maxFiles={10} />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" variant="secondary" disabled={pending}>
            {pending ? 'Yüklənir…' : 'Şəkilləri yüklə'}
          </Button>
          {state?.error && <span className="text-sm text-badge-lostfound">{state.error}</span>}
        </div>
      </form>
    </div>
  );
}
