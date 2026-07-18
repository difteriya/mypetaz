// Small shared pieces for the panel's sheet look. Server-safe (no hooks).

const STATUS: Record<string, { label: string; cls: string }> = {
  REQUEST: { label: 'Sorğu', cls: 'bg-vsignal/10 text-vsignal' },
  CONFIRMED: { label: 'Təsdiqli', cls: 'bg-vteal-50 text-vteal-700' },
  COMPLETED: { label: 'Bitib', cls: 'bg-vline/60 text-vink/60' },
  REJECTED: { label: 'Rədd', cls: 'bg-red-50 text-red-600' },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: 'bg-vline/60 text-vink/60' };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
  );
}

export function fmtTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fmtDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-vink/45">{children}</p>;
}
