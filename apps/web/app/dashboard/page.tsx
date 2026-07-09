import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { logoutAction } from '@/lib/actions/auth';
import { getUnreadTotal } from '@/lib/messages/data';

export const metadata: Metadata = { title: 'İdarə paneli' };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { name, email, role, accountType } = session.user;
  const unread = await getUnreadTotal(session.user.id);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-700">İdarə paneli</h1>
      <p className="mt-2 text-brand-900/70">Xoş gəldin, {name ?? email}!</p>

      <dl className="mt-6 grid max-w-md grid-cols-2 gap-2 rounded-card bg-white p-4 text-sm">
        <dt className="text-brand-900/50">E-poçt</dt>
        <dd>{email}</dd>
        <dt className="text-brand-900/50">Rol</dt>
        <dd>{role}</dd>
        <dt className="text-brand-900/50">Hesab tipi</dt>
        <dd>{accountType}</dd>
      </dl>

      <div className="mt-6 flex gap-3">
        <Link href="/pets">
          <Button>Mənim petlərim</Button>
        </Link>
        <Link href="/dashboard/listings">
          <Button variant="secondary">Mənim elanlarım</Button>
        </Link>
        <Link href="/dashboard/business">
          <Button variant="secondary">Biznesim</Button>
        </Link>
        <Link href="/messages">
          <Button variant="secondary">Mesajlarım{unread > 0 ? ` (${unread})` : ''}</Button>
        </Link>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary">
            Çıxış
          </Button>
        </form>
      </div>
    </main>
  );
}
