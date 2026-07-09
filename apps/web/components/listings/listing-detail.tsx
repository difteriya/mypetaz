import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { getListingBySlug, getSimilarListings, getListingStatusBySlug, countActiveListingsByUser } from '@/lib/listings/data';
import { imageVariant } from '@/lib/images';
import { ListingBadge, listingTypeLabel } from './listing-badge';
import { ListingCard } from './listing-card';
import { ListingGallery } from './listing-gallery';
import { PriceTag } from './price-tag';
import { PhoneReveal } from './phone-reveal';
import { FavoriteButton } from './favorite-button';
import { startConversationAction } from '@/lib/messages/actions';
import { isFavorited } from '@/lib/favorites/data';
import { listReviews, getReviewAggregate, getMyReview } from '@/lib/reviews/data';
import { ReviewSection } from '@/components/reviews/review-section';
import { ReportButton } from '@/components/report-button';
import { JsonLd, APP_URL } from '@/components/json-ld';
import { PawIcon, CheckIcon, StarRating } from '@/components/icons';

const SEX_LABEL: Record<string, string> = { MALE: 'Erkək', FEMALE: 'Dişi', UNKNOWN: 'Bilinmir' };
const HEALTH_LABEL: Record<string, string> = { VACCINE: 'Peyvənd', EXAM: 'Müayinə', SURGERY: 'Əməliyyat' };
const card = 'rounded-card bg-white p-5 ring-1 ring-cream-200';

export async function ListingDetailView({ slug }: { slug: string }) {
  const listing = await getListingBySlug(slug);

  if (!listing) {
    const existing = await getListingStatusBySlug(slug);
    if (!existing) notFound();
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <PawIcon className="mx-auto size-12 text-brand-200" />
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
  const business = listing.user.businessProfile;
  const [session, similar] = await Promise.all([auth(), getSimilarListings(listing)]);
  const canMessage = session?.user && session.user.id !== listing.userId;
  const favorited = session?.user ? await isFavorited(session.user.id, listing.id) : false;
  const bizCount = business ? await countActiveListingsByUser(listing.userId) : 0;
  const [reviewAgg, reviews, myReview] = await Promise.all([
    getReviewAggregate('LISTING', listing.id),
    listReviews('LISTING', listing.id),
    session?.user ? getMyReview(session.user.id, 'LISTING', listing.id) : Promise.resolve(null),
  ]);

  const specs: Array<[string, string]> = [
    ['Kateqoriya', pet.category.name],
    ['Cins / növ', pet.breed?.name ?? pet.breedFreeText ?? '—'],
    ['Cinsiyyət', SEX_LABEL[pet.sex] ?? pet.sex],
    ...(pet.birthDate ? [['Doğum tarixi', pet.birthDate.toISOString().slice(0, 10)] as [string, string]] : []),
    ...(pet.color ? [['Rəng', pet.color] as [string, string]] : []),
    ...(pet.weight != null ? [['Çəki', `${pet.weight} kq`] as [string, string]] : []),
    ...(pet.microchipNo ? [['Mikroçip', pet.microchipNo] as [string, string]] : []),
    ...(listing.city ? [['Şəhər', listing.city.name] as [string, string]] : []),
    ...(listing.address ? [['Ünvan', listing.address] as [string, string]] : []),
    ...pet.category.fields
      .map((f) => ({ label: f.label, value: staticFields[f.fieldName], type: f.type }))
      .filter((r) => r.value !== undefined && r.value !== '' && r.value !== null)
      .map((r) => [r.label, r.type === 'BOOL' ? (r.value ? 'Bəli' : 'Xeyr') : String(r.value)] as [string, string]),
  ];

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
        { '@type': 'ListItem', position: 3, name: pet.category.name, item: `${APP_URL}/listings/${pet.category.slug}` },
        { '@type': 'ListItem', position: 4, name: listing.title, item: `${APP_URL}/listings/${listing.slug}` },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8">
      <JsonLd data={jsonLd} />
      <nav className="mb-3 text-sm text-ink/50">
        <Link href="/listings" className="hover:underline">
          Elanlar
        </Link>{' '}
        ›{' '}
        <Link href={`/listings/${pet.category.slug}`} className="hover:underline">
          {pet.category.name}
        </Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{listing.title}</h1>
          <p className="mt-1 text-sm text-ink/50">
            {listing.city ? `${listing.city.name} · ` : ''}
            {listing.createdAt.toISOString().slice(0, 10)} · Elan № {listing.id.slice(-6)}
          </p>

          <div className="mt-4">
            <ListingGallery images={pet.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))} />
          </div>

          <section className={`mt-6 ${card}`}>
            <h2 className="mb-3 font-bold text-ink">Xüsusiyyətlər</h2>
            <div className="grid gap-x-10 sm:grid-cols-2">
              {specs.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-cream-100 py-2.5 text-sm">
                  <span className="text-ink/50">{label}</span>
                  <span className="text-right font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {(pet.passport || pet.healthRecords.length > 0) && (
            <section className={`mt-6 ${card}`}>
              <h2 className="mb-3 font-bold text-ink">Pasport və tibbi göstəricilər</h2>

              {pet.passport && (
                <div className="grid gap-x-10 sm:grid-cols-2">
                  {(
                    [
                      ['Sənəd №', pet.passport.documentNo],
                      ['Mikroçip', pet.passport.microchipId],
                      ['Doğulduğu yer', pet.passport.birthPlace],
                      ['Verilmə tarixi', pet.passport.issueDate?.toISOString().slice(0, 10)],
                    ] as Array<[string, string | null | undefined]>
                  )
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4 border-b border-cream-100 py-2.5 text-sm">
                        <span className="text-ink/50">{label}</span>
                        <span className="text-right font-medium text-ink">{value}</span>
                      </div>
                    ))}
                </div>
              )}

              {pet.healthRecords.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {pet.healthRecords.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-cream-100 p-3 text-sm">
                      <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs font-semibold">
                        {HEALTH_LABEL[r.type] ?? r.type}
                      </span>
                      <span className="font-medium text-ink">{r.name}</span>
                      <span className="text-ink/50">{r.date.toISOString().slice(0, 10)}</span>
                      {r.nextDate && <span className="text-ink/40">· növbəti: {r.nextDate.toISOString().slice(0, 10)}</span>}
                      <span className={`ml-auto text-xs ${r.source === 'VET' ? 'text-teal-600' : 'text-ink/40'}`}>
                        {r.source === 'VET'
                          ? `${r.vetAppointment?.vet?.clinicName ?? 'Baytar'} tərəfindən`
                          : 'Pet sahibi tərəfindən'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {listing.description && (
            <section className={`mt-6 ${card}`}>
              <h2 className="mb-2 font-bold text-ink">Ətraflı</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">{listing.description}</p>
            </section>
          )}

          {listing.lat != null && listing.lng != null && (
            <section className={`mt-6 ${card}`}>
              <h2 className="mb-2 font-bold text-ink">Ünvan</h2>
              <iframe
                title="Xəritə"
                className="h-72 w-full rounded-lg border border-cream-200"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.01}%2C${listing.lat - 0.01}%2C${listing.lng + 0.01}%2C${listing.lat + 0.01}&marker=${listing.lat}%2C${listing.lng}`}
              />
            </section>
          )}

          <div className="mt-6">
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
        </div>

        {/* RIGHT — sticky */}
        <aside className="space-y-4 self-start lg:sticky lg:top-20">
          <div className={card}>
            {listing.price != null ? (
              <PriceTag value={Number(listing.price)} className="font-display text-3xl font-extrabold text-ink" />
            ) : (
              <span className="text-xl font-bold text-ink">{listingTypeLabel(listing.type)}</span>
            )}
            <div className="mt-2 flex items-center gap-2">
              <ListingBadge type={listing.type} />
              {listing.featured && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-white">Seçilmiş</span>
              )}
            </div>
          </div>

          {business ? (
            <div className={`${card} space-y-3`}>
              <Link href={`/business/${business.slug}`} className="flex items-center gap-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                  {business.logo ? (
                    <img src={imageVariant(business.logo, 'thumb')} alt={business.logoAlt ?? business.name} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center"><PawIcon className="size-6 text-brand-200" /></div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate font-semibold text-brand-700">
                    {business.name}
                    <CheckIcon className="size-4 shrink-0 rounded-full bg-teal-500 p-0.5 text-white" />
                  </p>
                  {business.reviewCount > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-ink/60">
                      <StarRating value={business.avgRating ?? 0} className="[&_svg]:size-3.5" /> {business.avgRating?.toFixed(1)} ({business.reviewCount})
                    </span>
                  ) : (
                    <span className="text-xs text-ink/50">Təsdiqlənmiş biznes</span>
                  )}
                </div>
              </Link>
              {(business.city || business.address) && (
                <p className="text-sm text-ink/60">
                  {[business.city?.name, business.address].filter(Boolean).join(', ')}
                </p>
              )}
              <Link href={`/business/${business.slug}`} className="block text-sm font-semibold text-brand-600 hover:underline">
                Biznesin bütün elanları ({bizCount}) →
              </Link>
              <div className="border-t border-cream-100 pt-3">
                <PhoneReveal phone={listing.phone ?? ''} block />
              </div>
              {canMessage && (
                <form action={startConversationAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <Button type="submit" variant="secondary" className="w-full">
                    Mesaj göndər
                  </Button>
                </form>
              )}
              <div className="flex items-center justify-between pt-1">
                <FavoriteButton listingId={listing.id} initialFavorited={favorited} />
              </div>
              <ReportButton targetType="LISTING" targetId={listing.id} />
            </div>
          ) : (
            <div className={`${card} space-y-3`}>
              <p className="font-semibold text-ink">{listing.user.name ?? 'İstifadəçi'}</p>
              <PhoneReveal phone={listing.phone ?? ''} block />
              {canMessage && (
                <form action={startConversationAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <Button type="submit" variant="secondary" className="w-full">
                    Mesaj göndər
                  </Button>
                </form>
              )}
              <div className="flex items-center justify-between pt-1">
                <FavoriteButton listingId={listing.id} initialFavorited={favorited} />
              </div>
              <ReportButton targetType="LISTING" targetId={listing.id} />
            </div>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-extrabold text-ink">Bənzər elanlar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
