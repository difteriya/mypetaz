// Responsive image variants (PLAN.md §3.1). Client-safe (no sharp here) so it
// can build <img>/<Image> src values in any component.

export const IMAGE_VARIANTS = {
  thumb: 160,
  card: 400,
  detail: 1024,
  full: 1920,
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;

/**
 * The DB stores a stem like "/uploads/pets/golden-retriever-a1b2"; each variant
 * is a separate WebP file. This derives the concrete URL for a given size.
 */
export function imageVariant(stem: string, variant: ImageVariant = 'card'): string {
  return `${stem}-${variant}.webp`;
}
