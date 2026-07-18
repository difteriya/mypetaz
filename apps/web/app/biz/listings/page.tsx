import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { imageVariant } from '@/lib/images';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { PawIcon } from '@/components/icons';

export const metadata: Metadata = { title: 'Biznes elanları' };

export default async function BizListingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const listings = await prisma.listing.findMany({
    where: { userId: session.user.id, asBusiness: true },
    orderBy: { createdAt: 'desc' },
    include: { pet: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } } },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-700">Biznes elanları</h1>
        <Link
          href="/post-listing?ctx=biz"
          className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600"
        >
          + Yeni elan
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-card border border-dashed border-cream-200 bg-white p-10 text-center text-brand-900/60">
          <PawIcon className="mx-auto mb-2 size-10 text-brand-200" />
          <p>Biznes adından hələ elan yoxdur.</p>
          <Link href="/post-listing?ctx=biz" className="mt-2 inline-block font-semibold text-teal-600 hover:underline">
            İlk elanı yerləşdir →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-cream-100 rounded-card bg-white ring-1 ring-cream-200">
          {listings.map((l) => {
            const cover = l.pet.images[0];
            return (
              <li key={l.id} className="flex items-center gap-3 p-3">
                <span className="size-14 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageVariant(cover.url, 'thumb')} alt={cover.alt} className="size-full object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <Link href={`/listings/${l.slug}`} className="block truncate font-semibold text-ink hover:text-teal-600">
                    {l.title}
                  </Link>
                  <span className="text-xs text-ink/50">
                    {l.price != null ? `${Number(l.price)} ₼ · ` : ''}
                    {l.createdAt.toISOString().slice(0, 10)}
                  </span>
                </span>
                <AdminStatusBadge status={l.status} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
