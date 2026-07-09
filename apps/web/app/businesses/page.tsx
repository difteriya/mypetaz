import type { Metadata } from 'next';
import { listBusinesses, getServiceCategories } from '@/lib/business/data';
import { getCitiesList } from '@/lib/listings/data';
import { BusinessCard } from '@/components/business/business-card';
import { BusinessFilterBar } from '@/components/business/business-filter-bar';

export const metadata: Metadata = { title: 'Bizneslər' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BusinessesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val) raw[k] = val;
  }

  const [businesses, cities, categories] = await Promise.all([
    listBusinesses({ cityId: raw.cityId, serviceCategoryId: raw.serviceCategoryId, q: raw.q }),
    getCitiesList(),
    getServiceCategories(),
  ]);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Bizneslər</h1>
      <BusinessFilterBar
        cities={cities.map((c) => ({ id: c.id, name: c.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        current={raw}
      />
      {businesses.length === 0 ? (
        <p className="mt-10 text-center text-brand-900/50">Biznes tapılmadı.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </main>
  );
}
