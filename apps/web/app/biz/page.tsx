import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { getMyBusiness } from '@/lib/business/data';
import { getMyVetProfile } from '@/lib/vet/data';
import { VET_APP_URL } from '@/lib/vet/urls';
import { StatCard, SectionCard, QuickAction, TagIcon, PawStatIcon, StoreIcon, PlusIcon, StethoscopeIcon, ArrowIcon } from '@/app/dashboard/dashboard-ui';
import { AdminStatusBadge } from '@/components/admin/status-badge';

export const metadata: Metadata = { title: 'Biznes paneli' };

export default async function BizOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const uid = session.user.id;

  const [business, vet, listingCount, activeCount, petCount] = await Promise.all([
    getMyBusiness(uid),
    getMyVetProfile(uid),
    prisma.listing.count({ where: { userId: uid, asBusiness: true } }),
    prisma.listing.count({ where: { userId: uid, asBusiness: true, status: 'ACTIVE' } }),
    prisma.pet.count({ where: { ownerId: uid, asBusiness: true } }),
  ]);
  if (!business) redirect('/become-business');

  return (
    <div className="space-y-6">
      {/* Status hero */}
      <section className="rounded-card bg-gradient-to-br from-teal-500 to-teal-400 p-6 text-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <p className="mt-1 text-sm text-white/80">
              {business.status === 'ACTIVE'
                ? 'Mağazanız yayımdadır'
                : business.status === 'PENDING'
                  ? 'Admin təsdiqi gözlənilir — təsdiqlənənə qədər kataloqda görünmür'
                  : `Rədd edilib${business.rejectionReason ? `: ${business.rejectionReason}` : ''}`}
            </p>
          </div>
          {business.status === 'ACTIVE' && (
            <Link
              href={`/business/${business.slug}`}
              className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"
            >
              Vitrinə bax →
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<TagIcon />} label="Biznes elanları" value={listingCount} sub={`${activeCount} aktiv`} href="/biz/listings" tone="teal" />
        <StatCard icon={<PawStatIcon />} label="Biznes petləri" value={petCount} href="/biz/pets" tone="coral" />
        <StatCard icon={<StoreIcon />} label="Baxış" value={business.viewCount} href="/biz/profile" tone="purple" />
        <StatCard
          icon={<StoreIcon />}
          label="Reytinq"
          value={business.avgRating?.toFixed(1) ?? '—'}
          sub={`${business.reviewCount} rəy`}
          href={business.status === 'ACTIVE' ? `/business/${business.slug}` : '/biz/profile'}
          tone="pink"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <QuickAction icon={<PlusIcon />} label="Elan yerləşdir" href="/post-listing?ctx=biz" />
        <QuickAction icon={<PlusIcon />} label="Pet əlavə et" href="/pets/new?ctx=biz" />
        <QuickAction icon={<StoreIcon />} label="Profili tamamla" href="/biz/profile" />
      </div>

      {/* Vet service */}
      <SectionCard title="Baytar xidməti">
        {!vet ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/70">
              Klinikanız baytar xidməti göstərirsə, baytar profili yaradın — təyinatları vet panelindən idarə edin.
            </p>
            <Link
              href="/become-vet"
              className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100"
            >
              <StethoscopeIcon /> Baytar profili yarat
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-ink">{vet.clinicName}</span>
              <AdminStatusBadge status={vet.verified ? 'ACTIVE' : 'PENDING'} />
            </span>
            {vet.verified ? (
              <a
                href={VET_APP_URL}
                className="inline-flex items-center gap-1 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600"
              >
                Vet panelə keç <ArrowIcon />
              </a>
            ) : (
              <span className="text-xs text-ink/50">Admin təsdiqindən sonra panel açılacaq</span>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
