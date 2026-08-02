import { getBlockMap } from './data';

/**
 * Site branding stored as GLOBAL CMS blocks, managed at /admin/branding.
 * Both values are full public paths (e.g. "/uploads/brand/logo-ab12.png") —
 * brand assets keep their original format, so never run them through
 * imageVariant(). Empty means "use the built-in mark".
 */
export const BRAND_LOGO_KEY = 'site_logo';
export const BRAND_FAVICON_KEY = 'site_favicon';

/** Built-in fallbacks shipped in public/. */
export const DEFAULT_FAVICON = '/icon.svg';
export const DEFAULT_APPLE_ICON = '/apple-icon.png';

export async function getBranding(): Promise<{ logo: string | null; favicon: string | null }> {
  const blocks = await getBlockMap('GLOBAL');
  const logo = blocks.get(BRAND_LOGO_KEY).trim();
  const favicon = blocks.get(BRAND_FAVICON_KEY).trim();
  return { logo: logo || null, favicon: favicon || null };
}
