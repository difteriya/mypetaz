import type { Metadata } from 'next';
import { prisma } from '@mypet/db';
import { FieldAddForm } from './field-add-form';
import { FieldEdit } from './field-edit';
import {
  toggleFieldActiveAction,
  deleteFieldAction,
  moveFieldAction,
} from '@/lib/admin/category-field-actions';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete';
import { MoveButtons } from '@/components/admin/move-buttons';

export const metadata: Metadata = { title: 'Kateqoriya sahələri — Admin' };

const TYPE_LABEL: Record<string, string> = { TEXT: 'Mətn', NUMBER: 'Rəqəm', SELECT: 'Seçim', BOOL: 'Bəli/Xeyr' };

export default async function AdminCategoryFieldsPage() {
  const categories = await prisma.petCategory.findMany({
    where: { freeTextBreed: false },
    orderBy: { order: 'asc' },
    include: { fields: { orderBy: { order: 'asc' } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">Kateqoriya sahələri</h1>
        <p className="mt-1 text-sm text-brand-900/60">
          Hər kateqoriya üçün dinamik pet sahələri. Label, seçimlər və “tələb olunur” dəyişdirilə bilər; daxili
          açar (fieldName) və mövcud pet məlumatı toxunulmur.
        </p>
      </div>

      <FieldAddForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />

      <div className="space-y-3">
        {categories.map((cat) => (
          <details key={cat.id} className="group rounded-card border border-cream-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-3.5">
              <span className="flex items-center gap-2 font-semibold text-brand-700">
                <span className="text-ink/40 transition-transform group-open:rotate-90">›</span>
                {cat.name}
              </span>
              <span className="text-xs text-brand-900/50">{cat.fields.length} sahə</span>
            </summary>

            <div className="border-t border-cream-200 px-5 py-3">
              {cat.fields.length === 0 ? (
                <p className="text-sm text-brand-900/50">Hələ sahə yoxdur.</p>
              ) : (
                <ul className="divide-y divide-cream-100">
                  {cat.fields.map((f) => {
                    const options = Array.isArray(f.options) ? (f.options as string[]) : [];
                    return (
                      <li key={f.id} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2.5 text-sm">
                        <div className="pt-0.5">
                          <MoveButtons action={moveFieldAction} id={f.id} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={f.active ? 'text-ink' : 'text-ink/40 line-through'}>
                            <FieldEdit id={f.id} label={f.label} type={f.type} options={options} required={f.required} />
                          </span>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink/45">
                            <span className="rounded bg-cream-100 px-1.5 py-0.5">{TYPE_LABEL[f.type] ?? f.type}</span>
                            {f.required && <span className="text-amber-600">tələb olunur</span>}
                            <span className="font-mono">{f.fieldName}</span>
                            {options.length > 0 && <span>[{options.join(', ')}]</span>}
                          </div>
                        </div>
                        <span className="flex items-center gap-3">
                          <form action={toggleFieldActiveAction}>
                            <input type="hidden" name="id" value={f.id} />
                            <button type="submit" className="text-xs font-medium text-brand-600 hover:underline">
                              {f.active ? 'Deaktiv' : 'Aktiv et'}
                            </button>
                          </form>
                          <ConfirmDeleteButton
                            action={deleteFieldAction}
                            id={f.id}
                            itemName={f.label}
                            note="Bu sahə üçün gələcək pet formalarından çıxarılacaq (mövcud pet məlumatı qalır)."
                          />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
