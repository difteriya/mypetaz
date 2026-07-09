import { prisma, type ContentBlockPage } from '@mypet/db';

/** All values for a page as a key→value map, with a helper for fallbacks. */
export async function getBlockMap(page: ContentBlockPage) {
  const blocks = await prisma.contentBlock.findMany({ where: { page }, orderBy: { order: 'asc' } });
  const map: Record<string, string> = {};
  for (const b of blocks) map[b.key] = b.value;
  return {
    get: (key: string, fallback = '') => map[key] ?? fallback,
    raw: map,
  };
}

export function getAllBlocks() {
  return prisma.contentBlock.findMany({ orderBy: [{ page: 'asc' }, { order: 'asc' }] });
}

export async function getBlockValue(key: string, fallback = ''): Promise<string> {
  const b = await prisma.contentBlock.findUnique({ where: { key } });
  return b?.value ?? fallback;
}
