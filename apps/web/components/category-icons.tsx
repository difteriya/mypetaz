import type { SVGProps, ReactNode } from 'react';
import { PawIcon } from './icons';

// Cute line-art animal icons per category (colored). Reference: mypet.az cards.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function Dog(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...S} {...p}>
      <path d="M15 15c-5-3-9 1-9 7 0 5 3 8 6 9" />
      <path d="M33 15c5-3 9 1 9 7 0 5-3 8-6 9" />
      <path d="M15 14c0-4 4-7 9-7s9 3 9 7v10c0 6-4 11-9 11s-9-5-9-11z" />
      <circle cx="20" cy="22" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="28" cy="22" r="1.4" fill="currentColor" stroke="none" />
      <path d="M24 27v3" />
      <path d="M21 31c1 1.5 5 1.5 6 0" />
    </svg>
  );
}
function Cat(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...S} {...p}>
      <path d="M13 24V13l7 5" />
      <path d="M35 24V13l-7 5" />
      <path d="M13 24c0 7 5 12 11 12s11-5 11-12" />
      <circle cx="20" cy="24" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="28" cy="24" r="1.4" fill="currentColor" stroke="none" />
      <path d="M24 27v2" />
      <path d="M18 28h-6M18 30l-5 2M30 28h6M30 30l5 2" />
    </svg>
  );
}
function Bird(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...S} {...p}>
      <path d="M14 16c-6 0-9 5-9 11 0 8 6 14 15 14 8 0 14-6 14-15 0-3-1-6-3-8" />
      <path d="M31 18c0-5-4-9-9-9-4 0-7 2-8 6" />
      <path d="M31 20l8-3-5 6" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Rabbit(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...S} {...p}>
      <path d="M18 20C16 14 15 6 19 6s4 8 3 14" />
      <path d="M30 20c2-6 3-14-1-14s-4 8-3 14" />
      <path d="M16 26c0 6 3 12 8 12s8-6 8-12c0-4-3-7-8-7s-8 3-8 7z" />
      <circle cx="21" cy="27" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="27" cy="27" r="1.3" fill="currentColor" stroke="none" />
      <path d="M24 30v1.5M21.5 32c1 1 4 1 5 0" />
    </svg>
  );
}
function Fish(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...S} {...p}>
      <path d="M6 24c5-8 15-11 24-8 5 1.7 9 5 12 8-3 3-7 6.3-12 8-9 3-19 0-24-8z" />
      <path d="M42 24l0 0" />
      <path d="M30 16l0 16" />
      <circle cx="14" cy="22" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Hamster(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...S} {...p}>
      <circle cx="16" cy="16" r="3" />
      <circle cx="32" cy="16" r="3" />
      <path d="M12 26c0-7 5-11 12-11s12 4 12 11-5 12-12 12-12-5-12-12z" />
      <circle cx="20" cy="25" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="28" cy="25" r="1.4" fill="currentColor" stroke="none" />
      <path d="M24 28v2M21 31c1 1 5 1 6 0" />
    </svg>
  );
}

const MAP: Record<string, { Icon: (p: SVGProps<SVGSVGElement>) => ReactNode; color: string }> = {
  it: { Icon: Dog, color: 'text-brand-500' },
  pisik: { Icon: Cat, color: 'text-amber-500' },
  qus: { Icon: Bird, color: 'text-pink-500' },
  dovsan: { Icon: Rabbit, color: 'text-blue-500' },
  baliq: { Icon: Fish, color: 'text-green-500' },
  gemiriciler: { Icon: Hamster, color: 'text-teal-500' },
};

export function CategoryIcon({ slug, className = 'size-12' }: { slug: string; className?: string }) {
  const entry = MAP[slug];
  if (!entry) return <PawIcon className={`${className} text-violet-500`} />;
  const { Icon, color } = entry;
  return <Icon className={`${className} ${color}`} />;
}
