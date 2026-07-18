import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getVerifiedVet } from '@/lib/guard';
import { PanelNav } from './panel-nav';

export const dynamic = 'force-dynamic';

const WEB_APP_URL =
  process.env.NEXT_PUBLIC_WEB_APP_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://mypet.az');

/** Verified-vet shell: slim clinical header + sheet-style content column. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getVerifiedVet();
  if (!ctx) redirect('/status');

  return (
    <div className="min-h-screen">
      <header className="border-b border-vline bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-vteal-700">vet.mypet.az</span>
            <span className="hidden truncate text-sm text-vink/50 sm:inline">{ctx.vet.clinicName}</span>
          </Link>
          <a href={WEB_APP_URL} className="text-xs font-semibold text-vink/45 hover:text-vteal-700">
            mypet.az →
          </a>
        </div>
        <PanelNav />
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
