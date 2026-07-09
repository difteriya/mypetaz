import type { Metadata } from 'next';
import { getBlockMap } from '@/lib/cms/data';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { AdHeader, AdBackground } from '@/components/site/site-ads';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'mypet.az — Azərbaycanda heyvanlar üçün portal',
    template: '%s | mypet.az',
  },
  description:
    'Ev heyvanları üçün elanlar, sahiblənmə, biznes hesabları və bloq — Azərbaycanda.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [global, footer] = await Promise.all([getBlockMap('GLOBAL'), getBlockMap('FOOTER')]);

  return (
    <html lang="az">
      <body className="min-h-screen antialiased">
        <AdBackground global={global.raw} />
        <AdHeader global={global.raw} />
        <SiteHeader />
        {/* Boxed content column — its opaque background covers the ad in the
            centre; only the left/right strips remain visible (PLAN.md §5.1). */}
        <div className="relative mx-auto min-h-[60vh] max-w-[1280px] bg-cream-100">{children}</div>
        <SiteFooter footer={footer.raw} />
      </body>
    </html>
  );
}
