import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  getPetCategoryBySlug,
  getBreedBySlugInCategory,
  getActiveListings,
} from '@/lib/listings/data';
import { resolveSlugRedirect } from '@/lib/admin/slug-redirect';
import { ListingCard } from '@/components/listings/listing-card';
import { JsonLd, APP_URL } from '@/components/json-ld';

// Breed landing — the strongest long-tail page (PLAN.md §8.1).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string; breed: string }>;
}): Promise<Metadata> {
  const { segment, breed } = await params;
  const category = await getPetCategoryBySlug(segment);
  if (!category) return { title: 'Tapılmadı' };
  const b = await getBreedBySlugInCategory(category.id, breed);
  if (!b) return { title: 'Tapılmadı' };
  return {
    title: b.metaTitle ?? `${b.name} — ${category.name}`,
    description: (b.metaDescription ?? b.description ?? `${b.name} elanları Azərbaycanda`).slice(0, 160),
    alternates: { canonical: `/listings/${segment}/${breed}` },
  };
}

export default async function BreedLandingPage({
  params,
}: {
  params: Promise<{ segment: string; breed: string }>;
}) {
  const { segment, breed } = await params;
  const category = await getPetCategoryBySlug(segment);
  if (!category) notFound();
  const b = await getBreedBySlugInCategory(category.id, breed);
  if (!b) {
    const to = await resolveSlugRedirect(`breed:${category.id}`, breed);
    if (to) permanentRedirect(`/listings/${category.slug}/${to}`);
    notFound();
  }

  const listings = await getActiveListings({ categoryId: category.id, breedId: b.id });

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
            { '@type': 'ListItem', position: 4, name: b.name, item: `${APP_URL}/listings/${category.slug}/${b.slug}` },
          ],
        }}
      />
      <nav className="mb-3 text-sm text-brand-900/50">
        <Link href="/listings" className="hover:underline">
          Elanlar
        </Link>{' '}
        ›{' '}
        <Link href={`/listings/${category.slug}`} className="hover:underline">
          {category.name}
        </Link>{' '}
        › <span>{b.name}</span>
      </nav>

      <h1 className="text-2xl font-bold text-brand-700">
        {b.name} — {category.name}
      </h1>
      {b.description && <p className="mt-2 max-w-2xl text-sm text-brand-900/70">{b.description}</p>}

      {listings.length === 0 ? (
        <p className="mt-8 text-center text-brand-900/50">Bu cins üzrə aktiv elan yoxdur.</p>
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
