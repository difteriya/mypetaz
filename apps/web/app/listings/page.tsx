import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@mypet/ui';
import {
  getActiveListings,
  getCategoriesWithBreeds,
  getCitiesList,
} from '@/lib/listings/data';
import { listingFilterSchema } from '@/lib/listings/schema';
import { FilterBar } from '@/components/listings/filter-bar';
import { ListingCard } from '@/components/listings/listing-card';

export const metadata: Metadata = { title: 'Elanlar' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // Normalize query → string record (drop empties), then validate.
  const raw: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val) raw[k] = val;
  }
  const filter = listingFilterSchema.safeParse(raw);

  const [listings, categories, cities] = await Promise.all([
    getActiveListings(filter.success ? filter.data : {}),
    getCategoriesWithBreeds(),
    getCitiesList(),
  ]);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-700">Elanlar</h1>
        <Link href="/post-listing">
          <Button>+ Elan yerləşdir</Button>
        </Link>
      </div>

      <FilterBar
        categories={categories.map((c) => ({ id: c.id, name: c.name, breeds: c.breeds }))}
        cities={cities.map((c) => ({ id: c.id, name: c.name }))}
        current={raw}
      />

      {listings.length === 0 ? (
        <p className="mt-10 text-center text-brand-900/50">Bu filtrlərə uyğun elan tapılmadı.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </main>
  );
}
