const STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Aktiv', cls: 'bg-badge-sale/15 text-badge-sale' },
  PENDING: { label: 'Gözləmədə', cls: 'bg-amber-100 text-amber-700' },
  REJECTED: { label: 'Rədd edilib', cls: 'bg-badge-lostfound/15 text-badge-lostfound' },
  FINISHED: { label: 'Bitib', cls: 'bg-cream-200 text-ink/60' },
  REVIEWED: { label: 'Baxılıb', cls: 'bg-teal-50 text-teal-600' },
};

export function AdminStatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: 'bg-cream-200 text-ink/60' };
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}
