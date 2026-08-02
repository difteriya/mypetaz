import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@mypet/db';
import { getCitiesList } from '@/lib/listings/data';
import { adminUpdateListingAction } from '@/lib/admin/content-actions';
import { AdminEditForm, adminInput, adminLabel } from '@/components/admin/edit-form';

export const metadata: Metadata = { title: 'Elanı redaktə et' };

const TYPES = [
  { value: 'SALE', label: 'Satılır' },
  { value: 'ADOPTION', label: 'Sahiblənmə' },
  { value: 'LOST_FOUND', label: 'İtkin/Tapıldı' },
  { value: 'MATING', label: 'Cütləşmə' },
];
const STATUSES = ['PENDING', 'ACTIVE', 'REJECTED', 'FINISHED'];

export default async function AdminListingEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, cities] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      include: {
        pet: { select: { name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    getCitiesList(),
  ]);
  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/listings" className="text-sm text-brand-600 hover:underline">
        ← Elanlar
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-extrabold text-ink">Elanı redaktə et</h1>
      <p className="mb-6 text-sm text-brand-900/60">
        Pet: {listing.pet.name} · Sahib:{' '}
        <Link href={`/admin/users/${listing.user.id}`} className="text-brand-600 hover:underline">
          {listing.user.name ?? listing.user.email}
        </Link>{' '}
        ·{' '}
        <Link href={`/listings/${listing.slug}`} className="text-brand-600 hover:underline">
          Açıq səhifə
        </Link>
      </p>

      <div className="rounded-card bg-white p-6 ring-1 ring-cream-200">
        <AdminEditForm action={adminUpdateListingAction} id={listing.id}>
          <div className="space-y-1">
            <label htmlFor="title" className={adminLabel}>Başlıq</label>
            <input id="title" name="title" required minLength={3} defaultValue={listing.title} className={adminInput} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="type" className={adminLabel}>Tip</label>
              <select id="type" name="type" defaultValue={listing.type} className={adminInput}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className={adminLabel}>Status</label>
              <select id="status" name="status" defaultValue={listing.status} className={adminInput}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="price" className={adminLabel}>Qiymət (₼)</label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={listing.price != null ? String(listing.price) : ''}
                className={adminInput}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="cityId" className={adminLabel}>Şəhər</label>
              <select id="cityId" name="cityId" defaultValue={listing.cityId ?? ''} className={adminInput}>
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className={adminLabel}>Telefon</label>
              <input id="phone" name="phone" defaultValue={listing.phone ?? ''} className={adminInput} />
            </div>
            <div className="space-y-1">
              <label htmlFor="address" className={adminLabel}>Ünvan</label>
              <input id="address" name="address" defaultValue={listing.address ?? ''} className={adminInput} />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className={adminLabel}>Açıqlama</label>
            <textarea id="description" name="description" rows={6} defaultValue={listing.description ?? ''} className={adminInput} />
          </div>

          <div className="space-y-1">
            <label htmlFor="rejectionReason" className={adminLabel}>Rədd səbəbi (status REJECTED olduqda göstərilir)</label>
            <input id="rejectionReason" name="rejectionReason" defaultValue={listing.rejectionReason ?? ''} className={adminInput} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={listing.featured} />
            Seçilmiş elan (ana səhifədə yuxarıda)
          </label>
        </AdminEditForm>
      </div>
    </div>
  );
}
