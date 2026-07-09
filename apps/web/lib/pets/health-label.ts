// Attribution label for a health record (PLAN.md §2.3):
// - vet record → "{clinic} tərəfindən"
// - owner record → "{owner name} tərəfindən", with "(keçmiş sahib)" if the
//   adder is no longer the pet's current owner.
export function healthSourceLabel(opts: {
  source: 'SELF' | 'VET';
  ownerId: string;
  addedById?: string | null;
  addedByName?: string | null;
  vetName?: string | null;
}): string {
  if (opts.source === 'VET') return `${opts.vetName ?? 'Baytar'} tərəfindən`;
  if (opts.addedByName) {
    const past = opts.addedById != null && opts.addedById !== opts.ownerId;
    return `${opts.addedByName} tərəfindən${past ? ' (keçmiş sahib)' : ''}`;
  }
  return 'Pet sahibi tərəfindən';
}
