import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { DashboardNav } from './dashboard-nav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div>
      <DashboardNav />
      <main className="mx-auto max-w-[1280px] px-4 py-8">{children}</main>
    </div>
  );
}
