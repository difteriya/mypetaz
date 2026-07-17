import type { Metadata } from 'next';
import { prisma } from '@mypet/db';
import { TaxonomyAddForm } from '@/components/admin/taxonomy-add-form';
import { InlineEditName } from '@/components/admin/inline-edit';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete';
import { MoveButtons } from '@/components/admin/move-buttons';
import {
  createServiceCategoryAction,
  renameServiceCategoryAction,
  toggleServiceCategoryAction,
  deleteServiceCategoryAction,
  moveServiceCategoryAction,
} from '@/lib/admin/taxonomy-actions';

export const metadata: Metadata = { title: 'Xidmət kateqoriyaları — Admin' };

export default async function AdminServiceCategoriesPage() {
  const items = await prisma.serviceCategory.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { businesses: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">Xidmət kateqoriyaları</h1>
        <p className="mt-1 text-sm text-brand-900/60">Biznes profillərində göstərilən xidmət növləri.</p>
      </div>

      <TaxonomyAddForm action={createServiceCategoryAction} title="Yeni xidmət kateqoriyası" placeholder="Məs. Pet taksi" />

      <div className="rounded-card border border-cream-200 bg-white">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-brand-900/50">Hələ kateqoriya yoxdur.</p>
        ) : (
          <ul className="divide-y divide-cream-100">
            {items.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 text-sm">
                <MoveButtons action={moveServiceCategoryAction} id={c.id} />
                <span className={c.active ? 'text-ink' : 'text-ink/40 line-through'}>
                  <InlineEditName action={renameServiceCategoryAction} id={c.id} value={c.name} />
                </span>
                {c._count.businesses > 0 && (
                  <span className="rounded-full bg-brand-100 px-1.5 text-xs text-brand-700" title="istifadə edən biznes sayı">
                    {c._count.businesses}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-3">
                  <form action={toggleServiceCategoryAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-xs font-medium text-brand-600 hover:underline">
                      {c.active ? 'Deaktiv' : 'Aktiv et'}
                    </button>
                  </form>
                  {c._count.businesses === 0 && (
                    <ConfirmDeleteButton action={deleteServiceCategoryAction} id={c.id} itemName={c.name} />
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
