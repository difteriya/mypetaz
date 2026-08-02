import type { Metadata } from 'next';
import { Nunito, Nunito_Sans } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { getBlockMap } from '@/lib/cms/data';
import { getBranding, DEFAULT_FAVICON, DEFAULT_APPLE_ICON } from '@/lib/cms/branding';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { AccountNav } from '@/components/site/account-nav';
import { AdHeader, AdBackground } from '@/components/site/site-ads';
import './globals.css';

const display = Nunito({
  subsets: ['latin', 'latin-ext'],
  weight: ['700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});
const body = Nunito_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

/** The favicon is admin-changeable (/admin/branding), so icons are resolved at
 * request time from the cached CMS blocks rather than the app/icon.* file
 * convention. Falls back to the built-in mark in public/. */
export async function generateMetadata(): Promise<Metadata> {
  const { favicon } = await getBranding();
  return {
    metadataBase: new URL(process.env.APP_URL ?? 'https://mypet.az'),
    title: {
      default: 'mypet.az — Azərbaycanda heyvanlar üçün portal',
      template: '%s | mypet.az',
    },
    description:
      'Ev heyvanları üçün elanlar, sahiblənmə, biznes hesabları və bloq — Azərbaycanda.',
    icons: {
      icon: favicon ?? DEFAULT_FAVICON,
      apple: favicon ?? DEFAULT_APPLE_ICON,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [global, footer, branding] = await Promise.all([
    getBlockMap('GLOBAL'),
    getBlockMap('FOOTER'),
    getBranding(),
  ]);

  return (
    <html lang="az" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <NextTopLoader color="#f4622f" height={3} showSpinner={false} shadow="0 0 8px #f4622f" />
        <AdBackground global={global.raw} />
        <AdHeader global={global.raw} />
        <SiteHeader logoUrl={branding.logo} />
        <AccountNav />
        {/* Boxed content column — its opaque background covers the ad in the
            centre; only the left/right strips remain visible (PLAN.md §5.1).
            flex-1 pushes the footer to the bottom on short pages. */}
        <div className="relative mx-auto w-full max-w-[1280px] flex-1 bg-cream-100">{children}</div>
        <SiteFooter footer={footer.raw} />
      </body>
    </html>
  );
}
