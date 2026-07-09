import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getPetCategoryBySlug,
  getActiveListings,
  getListingBySlug,
} from '@/lib/listings/data';
import { ListingCard } from '@/components/listings/listing-card';
import { ListingDetailView } from '@/components/listings/listing-detail';
import { JsonLd, APP_URL } from '@/components/json-ld';

// One segment resolves to a category landing OR a listing detail — avoids the
// /listings/[category] vs /listings/[slug] collision (PLAN.md §8.1).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment } = await params;
  const category = await getPetCategoryBySlug(segment);
  if (category) {
    return {
      title: `${category.name} elanları`,
      description: `Azərbaycanda ${category.name.toLowerCase()} elanları — satış, sahiblənmə və daha çox.`,
      alternates: { canonical: `/listings/${segment}` },
    };
  }
  const listing = await getListingBySlug(segment);
  if (!listing) return { title: 'Elan tapılmadı' };
  const cityPart = listing.city ? `, ${listing.city.name}` : '';
  return {
    title: `${listing.title}${cityPart}`,
    description: (listing.description ?? `${listing.title}${cityPart}`).slice(0, 160),
    alternates: { canonical: `/listings/${listing.slug}` },
    openGraph: { title: listing.title, type: 'website' },
  };
}

export default async function ListingSegmentPage({ params }: { params: Promise<{ segment: string }> }) {
  const { segment } = await params;
  const category = await getPetCategoryBySlug(segment);

  if (!category) {
    // Not a category → treat as a listing slug.
    return <ListingDetailView slug={segment} />;
  }

  const listings = await getActiveListings({ categoryId: category.id });

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ana səhifə', item: APP_URL },
            { '@type': 'ListItem', position: 2, name: 'Elanlar', item: `${APP_URL}/listings` },
            { '@type': 'ListItem', position: 3, name: category.name, item: `${APP_URL}/listings/${category.slug}` },
          ],
        }}
      />
      <nav className="mb-3 text-sm text-brand-900/50">
        <Link href="/listings" className="hover:underline">
          Elanlar
        </Link>{' '}
        › <span>{category.name}</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-700">
        {category.emoji} {category.name} elanları
      </h1>

      {category.breeds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {category.breeds.map((b) => (
            <Link
              key={b.id}
              href={`/listings/${category.slug}/${b.slug}`}
              className="rounded-full border border-cream-200 bg-white px-3 py-1 text-sm text-brand-700 hover:border-brand-300"
            >
              {b.name}
            </Link>
          ))}
        </div>
      )}

      {listings.length === 0 ? (
        <p className="mt-8 text-center text-brand-900/50">Bu kateqoriyada aktiv elan yoxdur.</p>
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
