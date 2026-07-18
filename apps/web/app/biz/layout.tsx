import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getMyBusiness } from '@/lib/business/data';
import { BizNav } from './biz-nav';

export const dynamic = 'force-dynamic';

/** Business dashboard shell — only for accounts with a BusinessProfile. */
export default async function BizLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const business = await getMyBusiness(session.user.id);
  if (!business) redirect('/become-business');

  return (
    <div>
      <div className="border-b border-cream-200 bg-teal-50/60">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-2.5">
          <span className="min-w-0 truncate text-sm">
            <span className="font-bold text-teal-700">{business.name}</span>
            <span className="ml-2 text-xs text-ink/50">Biznes paneli</span>
          </span>
          <Link
            href="/dashboard"
            className="shrink-0 rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50"
          >
            Şəxsi hesaba keç
          </Link>
        </div>
      </div>
      <BizNav />
      <main className="mx-auto max-w-[1280px] px-4 py-8">{children}</main>
    </div>
  );
}
