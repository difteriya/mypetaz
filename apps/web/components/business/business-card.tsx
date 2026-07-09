import Link from 'next/link';
import { imageVariant } from '@/lib/images';
import type { BusinessListItem } from '@/lib/business/data';

export function BusinessCard({ business }: { business: BusinessListItem }) {
  const categories = business.serviceCategories.map((s) => s.serviceCategory.name);
  return (
    <Link
      href={`/business/${business.slug}`}
      className="flex gap-3 rounded-card border border-cream-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-cream-100">
        {business.logo ? (
          <img
            src={imageVariant(business.logo, 'thumb')}
            alt={business.logoAlt ?? business.name}
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-2xl">🏪</div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-brand-700">
          {business.name} <span className="text-blue-500" title="Təsdiqlənmiş Biznes">✓</span>
        </p>
        {business.city && <p className="text-sm text-brand-900/60">{business.city.name}</p>}
        {categories.length > 0 && (
          <p className="mt-1 truncate text-xs text-brand-900/50">{categories.join(' · ')}</p>
        )}
      </div>
    </Link>
  );
}
