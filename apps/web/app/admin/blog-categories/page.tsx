import type { Metadata } from 'next';
import { prisma } from '@mypet/db';
import { TaxonomyAddForm } from '@/components/admin/taxonomy-add-form';
import { InlineEditName } from '@/components/admin/inline-edit';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete';
import { MoveButtons } from '@/components/admin/move-buttons';
import {
  createBlogCategoryAction,
  renameBlogCategoryAction,
  toggleBlogCategoryAction,
  deleteBlogCategoryAction,
  moveBlogCategoryAction,
} from '@/lib/admin/taxonomy-actions';

export const metadata: Metadata = { title: 'Bloq kateqoriyaları — Admin' };

export default async function AdminBlogCategoriesPage() {
  const items = await prisma.blogCategory.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">Bloq kateqoriyaları</h1>
        <p className="mt-1 text-sm text-brand-900/60">
          Bloq bölmələri. Ad dəyişəndə köhnə URL yeni slug-a yönləndirilir (308).
        </p>
      </div>

      <TaxonomyAddForm action={createBlogCategoryAction} title="Yeni bloq kateqoriyası" placeholder="Məs. Baytar məsləhətləri" />

      <div className="rounded-card border border-cream-200 bg-white">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-brand-900/50">Hələ kateqoriya yoxdur.</p>
        ) : (
          <ul className="divide-y divide-cream-100">
            {items.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 text-sm">
                <MoveButtons action={moveBlogCategoryAction} id={c.id} />
                <span className={c.active ? 'text-ink' : 'text-ink/40 line-through'}>
                  <InlineEditName action={renameBlogCategoryAction} id={c.id} value={c.name} />
                </span>
                {c._count.posts > 0 && (
                  <span className="rounded-full bg-brand-100 px-1.5 text-xs text-brand-700" title="yazı sayı">
                    {c._count.posts}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-3">
                  <form action={toggleBlogCategoryAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-xs font-medium text-brand-600 hover:underline">
                      {c.active ? 'Deaktiv' : 'Aktiv et'}
                    </button>
                  </form>
                  {c._count.posts === 0 && (
                    <ConfirmDeleteButton action={deleteBlogCategoryAction} id={c.id} itemName={c.name} />
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
