import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';

// Nav is rendered globally by AccountNav in the root layout; this layout only
// guards + boxes the /dashboard subtree.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return <main className="mx-auto max-w-[1280px] px-4 py-8">{children}</main>;
}
