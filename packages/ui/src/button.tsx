import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

const sizes: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
};

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white shadow-soft hover:bg-brand-600',
  secondary: 'bg-white text-brand-700 ring-1 ring-cream-300 hover:bg-cream-50',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50',
};

/** Shared rounded, warm button used across mypet.az + vet.mypet.az. */
export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`.trim()} {...props} />
  );
}
