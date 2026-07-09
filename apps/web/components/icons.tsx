import type { SVGProps } from 'react';

// Small line/solid icons replacing emoji glyphs across the site.

export function PawIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <ellipse cx="5.5" cy="12" rx="2" ry="2.6" />
      <ellipse cx="9.5" cy="7.5" rx="2" ry="2.6" />
      <ellipse cx="14.5" cy="7.5" rx="2" ry="2.6" />
      <ellipse cx="18.5" cy="12" rx="2" ry="2.6" />
      <path d="M12 12.5c-2.6 0-4.8 1.9-5.4 4.3-.4 1.7.9 3.2 2.6 3.2 1 0 1.9-.4 2.8-.4s1.8.4 2.8.4c1.7 0 3-1.5 2.6-3.2-.6-2.4-2.8-4.3-5.4-4.3Z" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.6 9.9l6.5-.9L12 2.5Z" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Rating stars row (functional, not emoji). */
export function StarRating({ value, className = '' }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} ulduz`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`size-4 ${n <= rounded ? 'text-amber-400' : 'text-cream-300'}`} />
      ))}
    </span>
  );
}
