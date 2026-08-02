'use client';

import { ImageDropZone } from '@/components/uploads/image-drop-zone';

const MAX_MB = 5;

/** CMS image picker — drag & drop with a preview, capped at 5 MB (PLAN admin). */
export function AdminImageInput({ name = 'image' }: { name?: string }) {
  return <ImageDropZone name={name} maxMb={MAX_MB} />;
}
