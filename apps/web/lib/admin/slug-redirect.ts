import 'server-only';
import { prisma } from '@mypet/db';

/**
 * Record that `oldSlug` now lives at `newSlug` within a scope, so old URLs can
 * 308-redirect. Also repoints existing redirects that targeted `oldSlug`
 * (chain collapse) and clears any redirect sitting on the now-live `newSlug`.
 */
export async function recordSlugChange(scope: string, oldSlug: string, newSlug: string): Promise<void> {
  if (oldSlug === newSlug) return;
  await prisma.$transaction([
    prisma.slugRedirect.deleteMany({ where: { scope, fromSlug: newSlug } }),
    prisma.slugRedirect.updateMany({ where: { scope, toSlug: oldSlug }, data: { toSlug: newSlug } }),
    prisma.slugRedirect.upsert({
      where: { scope_fromSlug: { scope, fromSlug: oldSlug } },
      update: { toSlug: newSlug },
      create: { scope, fromSlug: oldSlug, toSlug: newSlug },
    }),
  ]);
}

/** Resolve a redirect target within a scope, or null if none. */
export async function resolveSlugRedirect(scope: string, fromSlug: string): Promise<string | null> {
  const hit = await prisma.slugRedirect.findUnique({
    where: { scope_fromSlug: { scope, fromSlug } },
    select: { toSlug: true },
  });
  return hit?.toSlug ?? null;
}
