// Azerbaijani → ASCII slug transliteration (PLAN.md §8.1 / §3.1).
// ə→e, ı→i, ö→o, ü→u, ş→sh, ç→ch, ğ→g — clean, readable, SEO-friendly slugs.

const TRANSLITERATE: Record<string, string> = {
  ə: 'e',
  ı: 'i',
  ö: 'o',
  ü: 'u',
  ş: 'sh',
  ç: 'ch',
  ğ: 'g',
  // Explicit uppercase forms whose JS toLowerCase() is lossy/locale-dependent.
  Ə: 'e',
  I: 'i', // Azerbaijani dotless capital I
  İ: 'i', // dotted capital I
};

/**
 * Turn any Azerbaijani/Latin string into a clean ASCII slug.
 * "Qafqaz Çoban İti (Alabaş)" → "qafqaz-choban-iti-alabash"
 */
export function slugify(input: string): string {
  return input
    .split('')
    .map((ch) => TRANSLITERATE[ch] ?? TRANSLITERATE[ch.toLowerCase()] ?? ch)
    .join('')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip any remaining combining diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
