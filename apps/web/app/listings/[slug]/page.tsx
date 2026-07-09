import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListingBySlug, getSimilarListings } from '@/lib/listings/data';
import { imageVariant } from '@/lib/images';
import { ListingBadge } from '@/components/listings/listing-badge';
import { ListingCard } from '@/components/listings/listing-card';
import { PriceTag } from '@/components/listings/price-tag';
import { PhoneReveal } from '@/components/listings/phone-reveal';

const SEX_LABEL: Record<string, string> = { MALE: 'Erkək', FEMALE: 'Dişi', UNKNOWN: 'Bilinmir' };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: 'Elan tapılmadı' };
  const cityPart = listing.city ? `, ${listing.city.name}` : '';
  const pricePart = listing.price != null ? ` — ${Number(listing.price)} ₼` : '';
  return {
    title: `${listing.title}${cityPart}`,
    description: (listing.description ?? `${listing.title}${cityPart}${pricePart}`).slice(0, 160),
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const { pet } = listing;
  const staticFields = (pet.staticFields ?? {}) as Record<string, unknown>;
  const dynamicRows = pet.category.fields
    .map((f) => ({ label: f.label, value: staticFields[f.fieldName], type: f.type }))
    .filter((r) => r.value !== undefined && r.value !== '' && r.value !== null);
  const business = listing.user.businessProfile;
  const similar = await getSimilarListings(listing);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <nav className="mb-3 text-sm text-brand-900/50">
        <Link href="/listings" className="hover:underline">
          Elanlar
        </Link>{' '}
        › <span>{listing.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div>
          {pet.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {pet.images.map((img) => (
                <img
                  key={img.id}
                  src={imageVariant(img.url, 'detail')}
                  alt={img.alt}
                  className="aspect-square w-full rounded-card object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-card bg-cream-100 text-6xl">
              {pet.category.emoji}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <ListingBadge type={listing.type} />
            {listing.featured && <span className="text-amber-500">★ Seçilmiş</span>}
          </div>

          <h1 className="mt-2 text-2xl font-bold text-brand-700">{listing.title}</h1>
          {listing.price != null && (
            <PriceTag value={Number(listing.price)} className="mt-1 block text-2xl font-bold" />
          )}

          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-card bg-white p-5 text-sm">
            {(
              [
                ['Kateqoriya', `${pet.category.emoji ?? ''} ${pet.category.name}`.trim()],
                ['Cins/növ', pet.breed?.name ?? pet.breedFreeText ?? '—'],
                ['Cinsiyyət', SEX_LABEL[pet.sex] ?? pet.sex],
                ...(listing.city ? [['Şəhər', listing.city.name] as [string, string]] : []),
                ...(listing.address ? [['Ünvan', listing.address] as [string, string]] : []),
              ] as Array<[string, string]>
            ).map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-brand-900/50">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            {dynamicRows.map((r) => (
              <div key={r.label} className="contents">
                <dt className="text-brand-900/50">{r.label}</dt>
                <dd>{r.type === 'BOOL' ? (r.value ? 'Bəli' : 'Xeyr') : String(r.value)}</dd>
              </div>
            ))}
          </dl>

          {listing.description && (
            <p className="mt-4 whitespace-pre-line rounded-card bg-white p-5 text-sm">
              {listing.description}
            </p>
          )}

          {listing.lat != null && listing.lng != null && (
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold text-brand-600">
                Xəritədə göstər
              </summary>
              <iframe
                title="Xəritə"
                className="mt-2 h-72 w-full rounded-card border border-cream-200"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.01}%2C${listing.lat - 0.01}%2C${listing.lng + 0.01}%2C${listing.lat + 0.01}&marker=${listing.lat}%2C${listing.lng}`}
              />
            </details>
          )}
        </div>

        {/* Sidebar — seller */}
        <aside className="space-y-4">
          <div className="rounded-card bg-white p-5">
            {business ? (
              <Link href={`/business/${business.slug}`} className="mb-2 block font-semibold text-brand-700 hover:underline">
                {business.name} <span className="text-blue-500" title="Təsdiqlənmiş Biznes">✓</span>
              </Link>
            ) : (
              <p className="mb-2 font-semibold">{listing.user.name ?? 'İstifadəçi'}</p>
            )}
            <PhoneReveal phone={listing.phone ?? ''} />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-brand-700">Bənzər elanlar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
