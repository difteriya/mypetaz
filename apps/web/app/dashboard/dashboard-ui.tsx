import Link from 'next/link';
import type { ReactNode } from 'react';
import { imageVariant } from '@/lib/images';

// Server-rendered presentational pieces for the dashboard overview.
// SVG icons only (project rule: no emojis).

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const PawStatIcon = () => (
  <svg {...iconProps}>
    <circle cx="5.5" cy="12" r="1.7" />
    <circle cx="9.5" cy="7.5" r="1.7" />
    <circle cx="14.5" cy="7.5" r="1.7" />
    <circle cx="18.5" cy="12" r="1.7" />
    <path d="M12 12.5c-2.2 0-4 1.7-4 3.6 0 1.4 1.1 2.4 2.5 2.4.9 0 1-.4 1.5-.4s.6.4 1.5.4c1.4 0 2.5-1 2.5-2.4 0-1.9-1.8-3.6-4-3.6Z" />
  </svg>
);
export const TagIcon = () => (
  <svg {...iconProps}>
    <path d="M3.5 12.5 12 4h6a2 2 0 0 1 2 2v6l-8.5 8.5a1.5 1.5 0 0 1-2.1 0L3.5 14.6a1.5 1.5 0 0 1 0-2.1Z" />
    <circle cx="16" cy="8" r="1.3" />
  </svg>
);
export const HeartIcon = () => (
  <svg {...iconProps}>
    <path d="M12 20s-7-4.3-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.7 12 20 12 20Z" />
  </svg>
);
export const ChatIcon = () => (
  <svg {...iconProps}>
    <path d="M4 5h16v11H8l-4 3V5Z" />
  </svg>
);
export const BellIcon = () => (
  <svg {...iconProps}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);
export const BlogIcon = () => (
  <svg {...iconProps}>
    <path d="M5 4h9l5 5v11H5Z" />
    <path d="M14 4v5h5M8 13h8M8 16h5" />
  </svg>
);
export const StoreIcon = () => (
  <svg {...iconProps}>
    <path d="M4 9 5.5 4h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6" />
  </svg>
);
export const PlusIcon = () => (
  <svg {...iconProps}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const PhoneIcon = () => (
  <svg {...iconProps} width={16} height={16}>
    <path d="M4 5c0 8 7 15 15 15l-1-4-4-1-2 2a12 12 0 0 1-5-5l2-2-1-4Z" />
  </svg>
);
export const MailIcon = () => (
  <svg {...iconProps} width={16} height={16}>
    <path d="M4 6h16v12H4Z" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
export const CalendarIcon = () => (
  <svg {...iconProps} width={16} height={16}>
    <path d="M4 6h16v14H4Z" />
    <path d="M4 10h16M8 4v4M16 4v4" />
  </svg>
);
export const ArrowIcon = () => (
  <svg {...iconProps} width={16} height={16}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const StethoscopeIcon = () => (
  <svg {...iconProps}>
    <path d="M5 4v5a4 4 0 0 0 8 0V4" />
    <path d="M9 15a5 5 0 0 0 10 0v-2" />
    <circle cx="19" cy="11" r="2" />
  </svg>
);

function fmtShort(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const TONES: Record<string, string> = {
  coral: 'bg-brand-50 text-brand-600',
  teal: 'bg-teal-50 text-teal-600',
  pink: 'bg-badge-adoption/10 text-badge-adoption',
  purple: 'bg-badge-mating/10 text-badge-mating',
  amber: 'bg-amber-50 text-amber-600',
};

export function StatCard({
  icon,
  label,
  value,
  sub,
  href,
  tone = 'coral',
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  href: string;
  tone?: keyof typeof TONES | string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-card border border-cream-200 bg-white p-4 transition-shadow hover:shadow-soft"
    >
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${TONES[tone] ?? TONES.coral}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-bold leading-none text-ink">{value}</span>
        <span className="mt-1 block truncate text-sm text-ink/60">{label}</span>
      </span>
      {sub && (
        <span className="shrink-0 rounded-full bg-cream-100 px-2 py-0.5 text-xs font-medium text-ink/60">
          {sub}
        </span>
      )}
    </Link>
  );
}

export function QuickAction({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
    >
      {icon}
      {label}
    </Link>
  );
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-cream-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-brand-700">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const LISTING_STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Aktiv', cls: 'bg-badge-sale/15 text-badge-sale' },
  PENDING: { label: 'Gözləmədə', cls: 'bg-amber-100 text-amber-700' },
  FINISHED: { label: 'Bitib', cls: 'bg-cream-200 text-ink/60' },
  REJECTED: { label: 'Rədd edilib', cls: 'bg-badge-lostfound/15 text-badge-lostfound' },
};

export function ListingStatusBadge({ status }: { status: string }) {
  const s = LISTING_STATUS[status] ?? { label: 'Gözləmədə', cls: 'bg-amber-100 text-amber-700' };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export function PetStrip({
  pets,
}: {
  pets: { id: string; slug: string | null; name: string; images: { url: string; alt: string }[] }[];
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-1">
      {pets.map((p) => (
        <Link key={p.id} href={`/pet/${p.slug ?? p.id}`} className="group shrink-0 text-center">
          <span className="block size-16 overflow-hidden rounded-full border border-cream-200 bg-cream-100">
            {p.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageVariant(p.images[0].url, 'thumb')} alt={p.images[0].alt} className="size-full object-cover" />
            ) : (
              <span className="grid size-full place-items-center text-lg font-bold text-brand-400">
                {p.name.trim()[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </span>
          <span className="mt-1 block w-16 truncate text-xs text-ink/70 group-hover:text-brand-600">{p.name}</span>
        </Link>
      ))}
    </div>
  );
}

export function NotificationRow({
  message,
  createdAt,
  link,
  read,
}: {
  message: string;
  createdAt: Date;
  link: string | null;
  read: boolean;
}) {
  const inner = (
    <div className="flex gap-2.5 py-2">
      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${read ? 'bg-cream-300' : 'bg-brand-500'}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink/80">{message}</span>
        <span className="text-xs text-ink/40">{fmtShort(createdAt)}</span>
      </span>
    </div>
  );
  return link ? (
    <Link href={link} className="block transition-opacity hover:opacity-70">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function CompletenessBar({ done, total }: { done: number; total: number }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ink/60">Profil tamlığı</span>
        <span className="font-semibold text-brand-700">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-cream-200">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
