import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getMyBusiness } from '@/lib/business/data';
import { getCitiesList } from '@/lib/listings/data';
import { BusinessProfileForm } from '@/components/business/business-profile-form';
import { EMPTY_BUSINESS_DEFAULTS } from '@/lib/business/to-defaults';

export const metadata: Metadata = { title: 'Biznes hesabı yarat' };

export default async function BecomeBusinessPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const existing = await getMyBusiness(session.user.id);
  if (existing) redirect('/dashboard/business');

  const cities = await getCitiesList();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-brand-700">Biznes hesabı yarat</h1>
      <p className="mb-6 text-sm text-brand-900/60">
        Profil yaradıldıqdan sonra admin təsdiqinə göndərilir və təsdiqlənənə qədər kataloqda
        görünmür. Phase 1-də pulsuzdur.
      </p>
      <BusinessProfileForm cities={cities} defaults={EMPTY_BUSINESS_DEFAULTS} submitLabel="Profili yarat" />
    </main>
  );
}
