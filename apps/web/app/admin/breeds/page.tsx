import type { Metadata } from 'next';
import { prisma } from '@mypet/db';
import { BreedAddForm } from './breed-add-form';
import {
  toggleBreedActiveAction,
  deleteBreedAction,
  renameBreedAction,
  moveBreedAction,
} from '@/lib/admin/breed-actions';
import { InlineEditName } from '@/components/admin/inline-edit';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete';
import { MoveButtons } from '@/components/admin/move-buttons';

export const metadata: Metadata = { title: 'Cinslər — Admin' };

export default async function AdminBreedsPage() {
  const categories = await prisma.petCategory.findMany({
    where: { freeTextBreed: false },
    orderBy: { order: 'asc' },
    include: {
      breeds: {
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { pets: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">Cinslər</h1>
        <p className="mt-1 text-sm text-brand-900/60">
          Kateqoriyalara cins əlavə edin, adını dəyişin, sıralayın, deaktiv edin və ya silin. Ad dəyişəndə
          köhnə URL yeni cinsə yönləndirilir.
        </p>
      </div>

      <BreedAddForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />

      <div className="space-y-3">
        {categories.map((cat) => (
          <details key={cat.id} className="group rounded-card border border-cream-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-3.5">
              <span className="flex items-center gap-2 font-semibold text-brand-700">
                <span className="text-ink/40 transition-transform group-open:rotate-90">›</span>
                {cat.name}
              </span>
              <span className="text-xs text-brand-900/50">{cat.breeds.length} cins</span>
            </summary>

            <div className="border-t border-cream-200 px-5 py-3">
              {cat.breeds.length === 0 ? (
                <p className="text-sm text-brand-900/50">Hələ cins yoxdur.</p>
              ) : (
                <ul className="divide-y divide-cream-100">
                  {cat.breeds.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                      <MoveButtons action={moveBreedAction} id={b.id} />
                      <span className={b.active ? 'text-ink' : 'text-ink/40 line-through'}>
                        <InlineEditName action={renameBreedAction} id={b.id} value={b.name} />
                      </span>
                      {b._count.pets > 0 && (
                        <span className="rounded-full bg-brand-100 px-1.5 text-xs text-brand-700" title="istifadə edən pet sayı">
                          {b._count.pets}
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-3">
                        <form action={toggleBreedActiveAction}>
                          <input type="hidden" name="id" value={b.id} />
                          <button type="submit" className="text-xs font-medium text-brand-600 hover:underline">
                            {b.active ? 'Deaktiv' : 'Aktiv et'}
                          </button>
                        </form>
                        {b._count.pets === 0 && (
                          <ConfirmDeleteButton action={deleteBreedAction} id={b.id} itemName={b.name} />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
