import { requireAdmin } from '@/lib/admin/guard';
import { pendingCounts } from '@/lib/admin/data';
import { AdminNav } from './admin-nav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const counts = await pendingCounts();

  return (
    <div>
      <AdminNav counts={counts} />
      <main className="mx-auto max-w-[1280px] px-4 py-8">{children}</main>
    </div>
  );
}
