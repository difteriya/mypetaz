import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getBusinessBySlug, bumpBusinessView } from '@/lib/business/data';
import { getActiveListingsByUser } from '@/lib/listings/data';
import { listReviews, getMyReview } from '@/lib/reviews/data';
import { ReviewSection } from '@/components/reviews/review-section';
import { ReportButton } from '@/components/report-button';
import { JsonLd, APP_URL } from '@/components/json-ld';
import { PawIcon, CheckIcon, StarRating } from '@/components/icons';
import { parseBusinessHours, isOpenNow, DAYS } from '@/lib/business/hours';
import { imageVariant } from '@/lib/images';
import { PhoneReveal } from '@/components/listings/phone-reveal';
import { ListingCard } from '@/components/listings/listing-card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBusinessBySlug(slug);
  if (!b) return { title: 'Biznes tapılmadı' };
  return {
    title: `${b.name}${b.city ? `, ${b.city.name}` : ''}`,
    description: (b.description ?? b.name).slice(0, 160),
  };
}

export default async function BusinessStorefront({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  await bumpBusinessView(business.id);
  const [listings, session, reviews] = await Promise.all([
    getActiveListingsByUser(business.user.id),
    auth(),
    listReviews('BUSINESS', business.id),
  ]);
  const myReview = session?.user ? await getMyReview(session.user.id, 'BUSINESS', business.id) : null;

  const hours = parseBusinessHours(business.businessHours);
  const { open } = isOpenNow(hours);
  const social = (business.socialLinks ?? {}) as Record<string, string>;
  const categories = business.serviceCategories.map((s) => s.serviceCategory.name);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    address: business.address ?? undefined,
    telephone: business.phone ?? undefined,
    ...(business.lat != null && business.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: business.lat, longitude: business.lng } }
      : {}),
    url: `${APP_URL}/business/${business.slug}`,
    ...(business.reviewCount > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: business.avgRating, reviewCount: business.reviewCount } }
      : {}),
  };

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-6">
      <JsonLd data={jsonLd} />
      {/* Banner + logo */}
      <div className="relative">
        <div className="h-40 w-full overflow-hidden rounded-card bg-cream-200 sm:h-56">
          {business.banner ? (
            <img src={imageVariant(business.banner, 'detail')} alt={business.bannerAlt ?? business.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center"><PawIcon className="size-16 text-brand-200" /></div>
          )}
        </div>
        <div className="absolute -bottom-8 left-6 size-20 overflow-hidden rounded-card border-4 border-white bg-cream-100">
          {business.logo ? (
            <img src={imageVariant(business.logo, 'thumb')} alt={business.logoAlt ?? business.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center"><PawIcon className="size-8 text-brand-200" /></div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-1.5 text-2xl font-bold text-brand-700">
            {business.name}
            <CheckIcon className="size-5 rounded-full bg-teal-500 p-1 text-white" />
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-900/60">
            {listings.length} elan · {business.viewCount} baxış ·{' '}
            {business.reviewCount > 0 ? (
              <>
                <StarRating value={business.avgRating ?? 0} /> {business.avgRating?.toFixed(1)} ({business.reviewCount})
              </>
            ) : (
              'Rəy yoxdur'
            )}
          </p>
          {categories.length > 0 && (
            <p className="mt-1 text-xs text-brand-900/50">{categories.join(' · ')}</p>
          )}
        </div>
        {business.phone && (
          <div className="text-right">
            <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs ${open ? 'bg-badge-sale/15 text-badge-sale' : 'bg-cream-200 text-brand-900/60'}`}>
              {open ? 'Açıqdır' : 'Bağlıdır'}
            </span>
            <PhoneReveal phone={business.phone} />
          </div>
        )}
      </div>

      {business.description && (
        <p className="mt-4 whitespace-pre-line rounded-card bg-white p-5 text-sm">{business.description}</p>
      )}

      {(business.address || (business.lat != null && business.lng != null)) && (
        <div className="mt-4 rounded-card bg-white p-5 text-sm">
          {business.address && <p>{business.address}</p>}
          {business.lat != null && business.lng != null && (
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold text-brand-600">Xəritədə göstər</summary>
              <iframe
                title="Xəritə"
                className="mt-2 h-72 w-full rounded-card border border-cream-200"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.lng - 0.01}%2C${business.lat - 0.01}%2C${business.lng + 0.01}%2C${business.lat + 0.01}&marker=${business.lat}%2C${business.lng}`}
              />
            </details>
          )}
        </div>
      )}

      {/* Hours */}
      <details className="mt-4 rounded-card bg-white p-5 text-sm">
        <summary className="cursor-pointer font-semibold text-brand-600">İş saatları</summary>
        <ul className="mt-2 space-y-1">
          {DAYS.map(({ key, label }) => (
            <li key={key} className="flex justify-between">
              <span>{label}</span>
              <span className="text-brand-900/60">
                {hours[key] ? `${hours[key]!.open} – ${hours[key]!.close}` : 'Bağlı'}
              </span>
            </li>
          ))}
        </ul>
      </details>

      {/* Social */}
      {Object.keys(social).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {Object.entries(social).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="capitalize text-brand-600 hover:underline">
              {k}
            </a>
          ))}
        </div>
      )}

      {/* Listings */}
      {listings.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-brand-700">
            {business.name} elanları ({listings.length})
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      {business.serviceOfferings.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-brand-700">Göstərdiyi xidmətlər</h2>
          <ul className="space-y-2">
            {business.serviceOfferings.map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-card bg-white p-4 text-sm">
                <div>
                  <span className="font-medium">{o.name}</span>
                  {o.description && <p className="text-brand-900/60">{o.description}</p>}
                </div>
                {o.price != null && <span className="font-bold text-brand-700">{Number(o.price)} ₼</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8">
        <ReviewSection
          targetType="BUSINESS"
          targetId={business.id}
          avg={business.avgRating}
          count={business.reviewCount}
          reviews={reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            content: r.content,
            userName: r.user.name,
            createdAt: r.createdAt.toISOString(),
          }))}
          canReview={Boolean(session?.user)}
          isOwner={session?.user?.id === business.user.id}
          myRating={myReview?.rating}
          myContent={myReview?.content ?? undefined}
        />
      </div>

      <div className="mt-4">
        <ReportButton targetType="BUSINESS" targetId={business.id} />
      </div>
    </main>
  );
}
