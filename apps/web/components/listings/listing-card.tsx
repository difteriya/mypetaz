import Link from 'next/link';
import { imageVariant } from '@/lib/images';
import type { ListingCard as ListingCardData } from '@/lib/listings/data';
import { ListingBadge } from './listing-badge';
import { PriceTag } from './price-tag';
import { PawIcon } from '@/components/icons';

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = listing.pet.images[0];
  const isBusiness = listing.user.accountType === 'BUSINESS';

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-card bg-white ring-1 ring-cream-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        {cover ? (
          <img
            src={imageVariant(cover.url, 'card')}
            alt={cover.alt}
            width={400}
            height={400}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <PawIcon className="size-12 text-brand-200" />
          </div>
        )}
        <div className="absolute left-2.5 top-2.5">
          <ListingBadge type={listing.type} />
        </div>
        {listing.featured && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-white shadow">
            Seçilmiş
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="line-clamp-1 font-semibold text-ink">{listing.title}</p>
        {listing.price != null && (
          <PriceTag value={Number(listing.price)} className="font-display text-lg font-extrabold text-brand-600" />
        )}
        <p className="line-clamp-1 text-sm text-ink/50">
          {listing.pet.breed?.name ?? listing.pet.breedFreeText ?? listing.pet.category.name}
          {listing.city ? ` · ${listing.city.name}` : ''}
        </p>
        {isBusiness && (
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-600">
            Biznes
          </span>
        )}
      </div>
    </Link>
  );
}
