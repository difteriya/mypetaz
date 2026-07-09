import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { getListingBySlug, getSimilarListings, getListingStatusBySlug } from '@/lib/listings/data';
import { imageVariant } from '@/lib/images';
import { ListingBadge } from './listing-badge';
import { ListingCard } from './listing-card';
import { PriceTag } from './price-tag';
import { PhoneReveal } from './phone-reveal';
import { FavoriteButton } from './favorite-button';
import { startConversationAction } from '@/lib/messages/actions';
import { isFavorited } from '@/lib/favorites/data';
import { listReviews, getReviewAggregate, getMyReview } from '@/lib/reviews/data';
import { ReviewSection } from '@/components/reviews/review-section';
import { ReportButton } from '@/components/report-button';
import { JsonLd, APP_URL } from '@/components/json-ld';

const SEX_LABEL: Record<string, string> = { MALE: 'Erkək', FEMALE: 'Dişi', UNKNOWN: 'Bilinmir' };

/** Listing detail with Product/Offer + BreadcrumbList JSON-LD (PLAN.md §8.3). */
export async function ListingDetailView({ slug }: { slug: string }) {
  const listing = await getListingBySlug(slug);

  if (!listing) {
    // FINISHED/removed → friendly "gone" page instead of a soft-404 (§8.4).
    const existing = await getListingStatusBySlug(slug);
    if (!existing) notFound();
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-4xl">🐾</p>
        <h1 className="mt-3 text-2xl font-bold text-brand-700">Bu elan artıq mövcud deyil</h1>
        <p className="mt-2 text-brand-900/60">Elan bağlanıb və ya silinib.</p>
        <Link href="/listings" className="mt-4 inline-block font-semibold text-brand-600 hover:underline">
          Digər elanlara bax →
        </Link>
      </main>
    );
  }

  const { pet } = listing;
  const staticFields = (pet.staticFields ?? {}) as Record<string, unknown>;
  const dynamicRows = pet.category.fields
    .map((f) => ({ label: f.label, value: staticFields[f.fieldName], type: f.type }))
    .filter((r) => r.value !== undefined && r.value !== '' && r.value !== null);
  const business = listing.user.businessProfile;
  const [session, similar] = await Promise.all([auth(), getSimilarListings(listing)]);
  const canMessage = session?.user && session.user.id !== listing.userId;
  const favorited = session?.user ? await isFavorited(session.user.id, listing.id) : false;
  const [reviewAgg, reviews, myReview] = await Promise.all([
    getReviewAggregate('LISTING', listing.id),
    listReviews('LISTING', listing.id),
    session?.user ? getMyReview(session.user.id, 'LISTING', listing.id) : Promise.resolve(null),
  ]);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description ?? undefined,
      image: pet.images.map((i) => `${APP_URL}${imageVariant(i.url, 'detail')}`),
      offers: {
        '@type': 'Offer',
        priceCurrency: 'AZN',
        price: listing.price != null ? Number(listing.price) : undefined,
        availability: 'https://schema.org/InStock',
        url: `${APP_URL}/listings/${listing.slug}`,
      },
      ...(reviewAgg.count > 0
        ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: reviewAgg.avg, reviewCount: reviewAgg.count } }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana səhifə', item: APP_URL },
        { '@type': 'ListItem', position: 2, name: 'Elanlar', item: `${APP_URL}/listings` },
        { '@type': 'ListItem', position: 3, name: `${pet.category.name}`, item: `${APP_URL}/listings/${pet.category.slug}` },
        { '@type': 'ListItem', position: 4, name: listing.title, item: `${APP_URL}/listings/${listing.slug}` },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <JsonLd data={jsonLd} />
      <nav className="mb-3 text-sm text-brand-900/50">
        <Link href="/listings" className="hover:underline">
          Elanlar
        </Link>{' '}
        ›{' '}
        <Link href={`/listings/${pet.category.slug}`} className="hover:underline">
          {pet.category.name}
        </Link>{' '}
        › <span>{listing.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {pet.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {pet.images.map((img) => (
                <img key={img.id} src={imageVariant(img.url, 'detail')} alt={img.alt} className="aspect-square w-full rounded-card object-cover" />
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
            <p className="mt-4 whitespace-pre-line rounded-card bg-white p-5 text-sm">{listing.description}</p>
          )}

          {listing.lat != null && listing.lng != null && (
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold text-brand-600">Xəritədə göstər</summary>
              <iframe
                title="Xəritə"
                className="mt-2 h-72 w-full rounded-card border border-cream-200"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.01}%2C${listing.lat - 0.01}%2C${listing.lng + 0.01}%2C${listing.lat + 0.01}&marker=${listing.lat}%2C${listing.lng}`}
              />
            </details>
          )}
        </div>

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
            {canMessage && (
              <form action={startConversationAction} className="mt-3">
                <input type="hidden" name="listingId" value={listing.id} />
                <Button type="submit" variant="secondary">
                  Mesaj göndər
                </Button>
              </form>
            )}
            <div className="mt-3">
              <FavoriteButton listingId={listing.id} initialFavorited={favorited} />
            </div>
            <div className="mt-3">
              <ReportButton targetType="LISTING" targetId={listing.id} />
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <ReviewSection
          targetType="LISTING"
          targetId={listing.id}
          avg={reviewAgg.avg}
          count={reviewAgg.count}
          reviews={reviews.map((r) => ({ id: r.id, rating: r.rating, content: r.content, userName: r.user.name, createdAt: r.createdAt.toISOString() }))}
          canReview={Boolean(session?.user)}
          isOwner={session?.user?.id === listing.userId}
          myRating={myReview?.rating}
          myContent={myReview?.content ?? undefined}
        />
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
