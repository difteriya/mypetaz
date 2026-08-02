import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@mypet/db';
import { adminUpdateBlogPostAction } from '@/lib/admin/content-actions';
import { AdminEditForm, adminInput, adminLabel } from '@/components/admin/edit-form';

export const metadata: Metadata = { title: 'Bloq yazısını redaktə et' };

const STATUSES = ['PENDING', 'ACTIVE', 'REJECTED'];

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.blogCategory.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
  ]);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/blog" className="text-sm text-brand-600 hover:underline">
        ← Bloq
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-extrabold text-ink">Bloq yazısını redaktə et</h1>
      <p className="mb-6 text-sm text-brand-900/60">
        Müəllif:{' '}
        <Link href={`/admin/users/${post.user.id}`} className="text-brand-600 hover:underline">
          {post.user.name ?? post.user.email}
        </Link>{' '}
        ·{' '}
        <Link href={`/blog/${post.slug}`} className="text-brand-600 hover:underline">
          Açıq səhifə
        </Link>
      </p>

      <div className="rounded-card bg-white p-6 ring-1 ring-cream-200">
        <AdminEditForm action={adminUpdateBlogPostAction} id={post.id}>
          <div className="space-y-1">
            <label htmlFor="title" className={adminLabel}>Başlıq</label>
            <input id="title" name="title" required minLength={3} defaultValue={post.title} className={adminInput} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="categoryId" className={adminLabel}>Kateqoriya</label>
              <select id="categoryId" name="categoryId" defaultValue={post.categoryId} className={adminInput}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className={adminLabel}>Status</label>
              <select id="status" name="status" defaultValue={post.status} className={adminInput}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="excerpt" className={adminLabel}>Qısa təsvir</label>
            <input id="excerpt" name="excerpt" defaultValue={post.excerpt ?? ''} className={adminInput} />
          </div>

          <div className="space-y-1">
            <label htmlFor="content" className={adminLabel}>Məzmun</label>
            <textarea id="content" name="content" rows={14} required defaultValue={post.content} className={adminInput} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="metaTitle" className={adminLabel}>SEO başlıq</label>
              <input id="metaTitle" name="metaTitle" defaultValue={post.metaTitle ?? ''} className={adminInput} />
            </div>
            <div className="space-y-1">
              <label htmlFor="metaDescription" className={adminLabel}>SEO təsvir</label>
              <input id="metaDescription" name="metaDescription" defaultValue={post.metaDescription ?? ''} className={adminInput} />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="rejectionReason" className={adminLabel}>Rədd səbəbi</label>
            <input id="rejectionReason" name="rejectionReason" defaultValue={post.rejectionReason ?? ''} className={adminInput} />
          </div>
        </AdminEditForm>
      </div>
    </div>
  );
}
