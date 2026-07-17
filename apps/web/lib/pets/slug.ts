import { randomBytes } from 'node:crypto';
import { slugify } from '@mypet/db';

/**
 * A readable, always-unique pet slug: name[-breed]-<hex>, e.g.
 * "toby-golden-retriever-3f8a". The random suffix guarantees uniqueness so no
 * two pets ever collide, even with identical names/breeds.
 */
export function petSlug(name: string, breedName?: string | null): string {
  const parts = [slugify(name)];
  if (breedName) {
    const b = slugify(breedName);
    if (b) parts.push(b);
  }
  const base = parts.filter(Boolean).join('-') || 'pet';
  return `${base}-${randomBytes(2).toString('hex')}`;
}
