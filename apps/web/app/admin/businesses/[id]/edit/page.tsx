import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@mypet/db';
import { getCitiesList } from '@/lib/listings/data';
import { adminUpdateBusinessAction } from '@/lib/admin/content-actions';
import { AdminEditForm, adminInput, adminLabel } from '@/components/admin/edit-form';

export const metadata: Metadata = { title: 'Mağazanı redaktə et' };

const STATUSES = ['PENDING', 'ACTIVE', 'REJECTED'];

export default async function AdminBusinessEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [business, cities] = await Promise.all([
    prisma.businessProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    getCitiesList(),
  ]);
  if (!business) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/businesses" className="text-sm text-brand-600 hover:underline">
        ← Bizneslər
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-extrabold text-ink">Mağazanı redaktə et</h1>
      <p className="mb-6 text-sm text-brand-900/60">
        Sahib:{' '}
        <Link href={`/admin/users/${business.user.id}`} className="text-brand-600 hover:underline">
          {business.user.name ?? business.user.email}
        </Link>{' '}
        ·{' '}
        <Link href={`/business/${business.slug}`} className="text-brand-600 hover:underline">
          Açıq vitrin
        </Link>
      </p>

      <div className="rounded-card bg-white p-6 ring-1 ring-cream-200">
        <AdminEditForm action={adminUpdateBusinessAction} id={business.id}>
          <div className="space-y-1">
            <label htmlFor="name" className={adminLabel}>Ad</label>
            <input id="name" name="name" required minLength={2} defaultValue={business.name} className={adminInput} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="status" className={adminLabel}>Status</label>
              <select id="status" name="status" defaultValue={business.status} className={adminInput}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="cityId" className={adminLabel}>Şəhər</label>
              <select id="cityId" name="cityId" defaultValue={business.cityId ?? ''} className={adminInput}>
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className={adminLabel}>Telefon</label>
              <input id="phone" name="phone" defaultValue={business.phone ?? ''} className={adminInput} />
            </div>
            <div className="space-y-1">
              <label htmlFor="address" className={adminLabel}>Ünvan</label>
              <input id="address" name="address" defaultValue={business.address ?? ''} className={adminInput} />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className={adminLabel}>Açıqlama</label>
            <textarea id="description" name="description" rows={5} defaultValue={business.description ?? ''} className={adminInput} />
          </div>

          <div className="space-y-1">
            <label htmlFor="rejectionReason" className={adminLabel}>Rədd səbəbi</label>
            <input id="rejectionReason" name="rejectionReason" defaultValue={business.rejectionReason ?? ''} className={adminInput} />
          </div>

          <p className="rounded-lg bg-cream-100 p-3 text-xs text-brand-900/60">
            Loqo, banner, iş saatları və xidmətlər sahibin öz panelindən (/biz/profile) idarə olunur.
          </p>
        </AdminEditForm>
      </div>
    </div>
  );
}
