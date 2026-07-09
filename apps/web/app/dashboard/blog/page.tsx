import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { listMyPosts } from '@/lib/blog/data';
import { deleteBlogPostAction } from '@/lib/blog/actions';

export const metadata: Metadata = { title: 'Bloq yazılarım' };

const STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Gözləmədə', className: 'bg-amber-100 text-amber-700' },
  ACTIVE: { label: 'Aktiv', className: 'bg-badge-sale/15 text-badge-sale' },
  REJECTED: { label: 'Rədd edilib', className: 'bg-badge-lostfound/15 text-badge-lostfound' },
};

export default async function MyBlogPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const posts = await listMyPosts(session.user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-700">Bloq yazılarım</h1>
        <Link href="/write-post">
          <Button>+ Yeni yazı</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-brand-900/50">Hələ yazınız yoxdur.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => {
            const status = STATUS_META[p.status] ?? { label: p.status, className: 'bg-cream-200' };
            return (
              <li key={p.id} className="rounded-card bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-brand-900/50">{p.category.name}</span>
                    </div>
                    <p className="mt-1 truncate font-semibold">
                      {p.status === 'ACTIVE' ? (
                        <Link href={`/blog/${p.slug}`} className="hover:underline">
                          {p.title}
                        </Link>
                      ) : (
                        p.title
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-sm">
                    <Link href={`/write-post?id=${p.id}`} className="text-brand-600 hover:underline">
                      Redaktə
                    </Link>
                    <form action={deleteBlogPostAction}>
                      <input type="hidden" name="postId" value={p.id} />
                      <button type="submit" className="text-badge-lostfound hover:underline">
                        Sil
                      </button>
                    </form>
                  </div>
                </div>
                {p.rejectionReason && (
                  <p className="mt-2 text-xs text-badge-lostfound">Səbəb: {p.rejectionReason}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
