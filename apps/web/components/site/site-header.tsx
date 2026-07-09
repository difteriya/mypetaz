import Link from 'next/link';
import { Button } from '@mypet/ui';

export function SiteHeader({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="w-full border-b border-cream-200 bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-brand-700">
          🐾 mypet.az
        </Link>
        <nav className="hidden gap-5 text-sm sm:flex">
          <Link href="/listings" className="text-brand-900/70 hover:text-brand-700">
            Elanlar
          </Link>
          <Link href="/businesses" className="text-brand-900/70 hover:text-brand-700">
            Bizneslər
          </Link>
          <Link href="/blog" className="text-brand-900/70 hover:text-brand-700">
            Bloq
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/post-listing">
            <Button>Elan yerləşdir</Button>
          </Link>
          <Link
            href={loggedIn ? '/dashboard' : '/login'}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            {loggedIn ? 'Panel' : 'Daxil ol'}
          </Link>
        </div>
      </div>
    </header>
  );
}
