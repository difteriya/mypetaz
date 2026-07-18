import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getMyBusiness, getServiceCategories } from '@/lib/business/data';
import { getCitiesList } from '@/lib/listings/data';
import { BusinessProfileForm } from '@/components/business/business-profile-form';
import { toBusinessDefaults } from '@/lib/business/to-defaults';
import { ServiceManager } from '@/app/dashboard/business/service-manager';

export const metadata: Metadata = { title: 'Mağaza profili' };

const STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Admin təsdiqi gözlənilir', className: 'bg-amber-100 text-amber-700' },
  ACTIVE: { label: 'Aktiv', className: 'bg-badge-sale/15 text-badge-sale' },
  REJECTED: { label: 'Rədd edilib', className: 'bg-badge-lostfound/15 text-badge-lostfound' },
};

export default async function BizProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const business = await getMyBusiness(session.user.id);
  if (!business) redirect('/become-business');

  const [cities, categories] = await Promise.all([getCitiesList(), getServiceCategories()]);
  const status = STATUS_META[business.status] ?? { label: business.status, className: 'bg-cream-200' };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-700">Mağaza profili</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
      </div>

      {business.status === 'ACTIVE' && (
        <Link href={`/business/${business.slug}`} className="mb-4 inline-block text-sm text-brand-600 hover:underline">
          Açıq profilə bax →
        </Link>
      )}
      {business.rejectionReason && (
        <p className="mb-4 rounded-lg bg-badge-lostfound/10 p-3 text-sm text-badge-lostfound">
          Səbəb: {business.rejectionReason}
        </p>
      )}

      <BusinessProfileForm cities={cities} defaults={toBusinessDefaults(business)} submitLabel="Yadda saxla" />

      <div className="mt-8">
        <ServiceManager
          categories={categories}
          selectedIds={business.serviceCategories.map((s) => s.serviceCategoryId)}
          offerings={business.serviceOfferings.map((o) => ({
            id: o.id,
            name: o.name,
            price: o.price != null ? String(o.price) : null,
            description: o.description,
          }))}
        />
      </div>
    </div>
  );
}
