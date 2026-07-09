import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';

/** Gate a server component/action to ADMIN only (PLAN.md §2.9). */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
  return session;
}
