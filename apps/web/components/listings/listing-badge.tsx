// Listing-type ribbon (PLAN.md §2.4). Pure — safe in server components.

const TYPE_META: Record<string, { label: string; className: string }> = {
  SALE: { label: 'Satılır', className: 'bg-badge-sale' },
  ADOPTION: { label: 'Sahiblənmə', className: 'bg-badge-adoption' },
  LOST_FOUND: { label: 'İtkin/Tapıldı', className: 'bg-badge-lostfound' },
  MATING: { label: 'Cütləşmə', className: 'bg-badge-mating' },
};

export function listingTypeLabel(type: string): string {
  return TYPE_META[type]?.label ?? type;
}

export function ListingBadge({ type }: { type: string }) {
  const meta = TYPE_META[type] ?? { label: type, className: 'bg-brand-500' };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
