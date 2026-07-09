import Link from 'next/link';
import { imageVariant } from '@/lib/images';
import type { ListingCard as ListingCardData } from '@/lib/listings/data';
import { ListingBadge } from './listing-badge';
import { PriceTag } from './price-tag';

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = listing.pet.images[0];
  const isBusiness = listing.user.accountType === 'BUSINESS';

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group overflow-hidden rounded-card border border-cream-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-cream-100">
        {cover ? (
          <img
            src={imageVariant(cover.url, 'card')}
            alt={cover.alt}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-5xl">
            {listing.pet.category.emoji}
          </div>
        )}
        <div className="absolute left-2 top-2">
          <ListingBadge type={listing.type} />
        </div>
        {listing.featured && (
          <span
            title="Seçilmiş"
            className="absolute right-2 top-2 rounded-full bg-white/90 px-1.5 py-0.5 text-sm text-amber-500 shadow"
          >
            ★
          </span>
        )}
      </div>

      <div className="space-y-1 p-3">
        <p className="truncate font-semibold">{listing.title}</p>
        {listing.price != null && (
          <PriceTag value={Number(listing.price)} className="font-bold text-brand-700" />
        )}
        <p className="truncate text-sm text-brand-900/60">
          {listing.pet.breed?.name ?? listing.pet.breedFreeText ?? listing.pet.category.name}
          {listing.city ? ` · ${listing.city.name}` : ''}
        </p>
        {isBusiness && (
          <span className="inline-block rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-700">
            Biznes
          </span>
        )}
      </div>
    </Link>
  );
}
