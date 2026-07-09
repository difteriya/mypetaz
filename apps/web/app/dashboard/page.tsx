import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { logoutAction } from '@/lib/actions/auth';

export const metadata: Metadata = { title: 'İdarə paneli' };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { name, email, role, accountType } = session.user;

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

      <form action={logoutAction} className="mt-6">
        <Button type="submit" variant="secondary">
          Çıxış
        </Button>
      </form>
    </main>
  );
}
