'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { imageVariant } from '@/lib/images';
import { addPetImagesAction, deletePetImageAction } from '@/lib/pets/actions';
import { PawIcon, CloseIcon } from '@/components/icons';

interface Img {
  id: string;
  url: string;
  alt: string;
}

export function PetImages({ petId, images }: { petId: string; images: Img[] }) {
  const [state, formAction, pending] = useActionState(addPetImagesAction, undefined);

  return (
    <div>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-card">
              <img src={imageVariant(img.url, 'detail')} alt={img.alt} className="aspect-square w-full object-cover" />
              <form action={deletePetImageAction} className="absolute right-1.5 top-1.5">
                <input type="hidden" name="imageId" value={img.id} />
                <button
                  type="submit"
                  title="Sil"
                  className="rounded-full bg-white/90 p-1 text-badge-lostfound shadow"
                >
                  <CloseIcon className="size-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-card bg-cream-100">
          <PawIcon className="size-16 text-brand-200" />
        </div>
      )}

      <form action={formAction} className="mt-3 flex flex-wrap items-center gap-2">
        <input type="hidden" name="petId" value={petId} />
        <input
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="text-sm"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {pending ? 'Yüklənir…' : 'Şəkil əlavə et'}
        </Button>
        {state?.error && <span className="text-sm text-badge-lostfound">{state.error}</span>}
      </form>
    </div>
  );
}
