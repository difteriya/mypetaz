import Link from 'next/link';
import { PawIcon } from '@/components/icons';

export function SiteFooter({ footer }: { footer: Record<string, string> }) {
  const social = [
    { key: 'footer_instagram', label: 'Instagram' },
    { key: 'footer_facebook', label: 'Facebook' },
  ].filter((s) => footer[s.key]);

  return (
    <footer className="w-full border-t border-cream-200 bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-8 text-sm text-brand-900/60 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-1.5 text-lg font-bold text-brand-700">
            <PawIcon className="size-5" /> mypet.az
          </p>
          <p className="mt-2">Azərbaycanda ev heyvanları üçün portal.</p>
        </div>
        <div className="space-y-1">
          {footer.footer_address && <p>{footer.footer_address}</p>}
          {footer.footer_phone && <p>{footer.footer_phone}</p>}
          {footer.footer_email && <p>{footer.footer_email}</p>}
        </div>
        <div className="space-y-1">
          <div className="flex gap-3">
            {social.map((s) => (
              <a key={s.key} href={footer[s.key]} target="_blank" rel="noreferrer" className="hover:text-brand-700">
                {s.label}
              </a>
            ))}
          </div>
          <nav className="mt-2 flex flex-col gap-1">
            <Link href="/about" className="hover:text-brand-700">
              Haqqımızda
            </Link>
            <Link href="/contact" className="hover:text-brand-700">
              Əlaqə
            </Link>
            <Link href="/terms" className="hover:text-brand-700">
              İstifadə şərtləri
            </Link>
            <Link href="/privacy-policy" className="hover:text-brand-700">
              Məxfilik siyasəti
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
