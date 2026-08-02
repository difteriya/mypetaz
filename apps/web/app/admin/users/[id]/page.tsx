import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getUserDetail } from '@/lib/admin/data';
import { setUserBlockedAction, deleteUserAction, setUserRoleAction } from '@/lib/admin/actions';
import {
  adminDeleteListingAction,
  adminDeleteBlogPostAction,
  adminDeleteBusinessAction,
  adminDeleteVetAction,
  adminDeletePetAction,
} from '@/lib/admin/content-actions';
import { ConfirmDeleteButton } from '@/components/admin/confirm-delete';
import { AdminStatusBadge } from '@/components/admin/status-badge';

export const metadata: Metadata = { title: 'İstifadəçi' };

const ACCOUNT_LABEL: Record<string, string> = { INDIVIDUAL: 'Fərdi', BUSINESS: 'Biznes' };
const fmt = (d: Date) => d.toISOString().slice(0, 10);

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-900/45">
        {title} ({count})
      </h2>
      <div className="overflow-hidden rounded-card bg-white ring-1 ring-cream-200">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="p-5 text-center text-sm text-brand-900/45">{children}</p>;
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, session] = await Promise.all([getUserDetail(id), auth()]);
  if (!user) notFound();
  const isSelf = session?.user?.id === user.id;

  return (
    <div className="space-y-8">
      <Link href="/admin/users" className="text-sm text-brand-600 hover:underline">
        ← İstifadəçilər
      </Link>

      {/* Identity + account controls */}
      <header className="rounded-card bg-white p-6 ring-1 ring-cream-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{user.name ?? 'Adsız istifadəçi'}</h1>
            <p className="mt-1 text-sm text-brand-900/70">{user.email}</p>
            <p className="mt-1 text-sm text-brand-900/60">
              {ACCOUNT_LABEL[user.accountType] ?? user.accountType} hesab · Rol: <b>{user.role}</b>
              {user.phone ? ` · ${user.phone}` : ''} · Qeydiyyat: {fmt(user.createdAt)}
            </p>
            {user.blocked && (
              <p className="mt-2 inline-block rounded-full bg-badge-lostfound/10 px-3 py-1 text-xs font-bold text-badge-lostfound">
                Bloklanıb
              </p>
            )}
          </div>

          {isSelf ? (
            <span className="text-xs text-brand-900/45">Öz hesabınızı dəyişə bilməzsiniz</span>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <form action={setUserRoleAction} className="flex items-center gap-1">
                <input type="hidden" name="id" value={user.id} />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="rounded-lg border border-cream-200 px-2 py-1 text-xs"
                >
                  <option value="USER">USER</option>
                  <option value="VET">VET</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300">
                  Rolu dəyiş
                </button>
              </form>
              {user.role !== 'ADMIN' && (
                <>
                  <form action={setUserBlockedAction}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="blocked" value={user.blocked ? 'false' : 'true'} />
                    <button className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300">
                      {user.blocked ? 'Blokdan çıxar' : 'Blokla'}
                    </button>
                  </form>
                  <ConfirmDeleteButton
                    action={deleteUserAction}
                    id={user.id}
                    itemName={user.email}
                    note="Hesabla birlikdə onun petləri, elanları və bloq yazıları da silinir."
                  />
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Business */}
      <Section title="Mağaza" count={user.businessProfile ? 1 : 0}>
        {!user.businessProfile ? (
          <Empty>Bu istifadəçinin mağazası yoxdur.</Empty>
        ) : (
          <div className="flex flex-wrap items-center gap-3 p-4">
            <span className="min-w-0 flex-1">
              <Link href={`/business/${user.businessProfile.slug}`} className="font-semibold hover:text-brand-600">
                {user.businessProfile.name}
              </Link>
              <span className="ml-2 text-xs text-brand-900/50">
                {user.businessProfile.viewCount} baxış · {user.businessProfile.reviewCount} rəy
              </span>
            </span>
            <AdminStatusBadge status={user.businessProfile.status} />
            <Link
              href={`/admin/businesses/${user.businessProfile.id}/edit`}
              className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300"
            >
              Redaktə
            </Link>
            <ConfirmDeleteButton
              action={adminDeleteBusinessAction}
              id={user.businessProfile.id}
              itemName={user.businessProfile.name}
            />
          </div>
        )}
      </Section>

      {/* Vet profile */}
      <Section title="Baytar profili" count={user.vetProfile ? 1 : 0}>
        {!user.vetProfile ? (
          <Empty>Baytar profili yoxdur.</Empty>
        ) : (
          <div className="flex flex-wrap items-center gap-3 p-4">
            <span className="min-w-0 flex-1">
              <Link href={`/vets/${user.vetProfile.id}`} className="font-semibold hover:text-brand-600">
                {user.vetProfile.clinicName}
              </Link>
              {user.vetProfile.specialty && (
                <span className="ml-2 text-xs text-brand-900/50">{user.vetProfile.specialty}</span>
              )}
            </span>
            <AdminStatusBadge status={user.vetProfile.verified ? 'ACTIVE' : 'PENDING'} />
            <Link
              href={`/admin/vets/${user.vetProfile.id}/edit`}
              className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300"
            >
              Redaktə
            </Link>
            <ConfirmDeleteButton
              action={adminDeleteVetAction}
              id={user.vetProfile.id}
              itemName={user.vetProfile.clinicName}
            />
          </div>
        )}
      </Section>

      {/* Listings */}
      <Section title="Elanlar" count={user.listings.length}>
        {user.listings.length === 0 ? (
          <Empty>Elan yoxdur.</Empty>
        ) : (
          <ul className="divide-y divide-cream-100">
            {user.listings.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-3 p-3">
                <span className="min-w-0 flex-1">
                  <Link href={`/listings/${l.slug}`} className="block truncate font-medium hover:text-brand-600">
                    {l.title}
                  </Link>
                  <span className="text-xs text-brand-900/50">
                    {l.price != null ? `${Number(l.price)} ₼ · ` : ''}
                    {fmt(l.createdAt)}
                    {l.asBusiness ? ' · biznes' : ''}
                    {l.featured ? ' · seçilmiş' : ''}
                  </span>
                </span>
                <AdminStatusBadge status={l.status} />
                <Link
                  href={`/admin/listings/${l.id}/edit`}
                  className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300"
                >
                  Redaktə
                </Link>
                <ConfirmDeleteButton action={adminDeleteListingAction} id={l.id} itemName={l.title} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Blog posts */}
      <Section title="Bloq yazıları" count={user.blogPosts.length}>
        {user.blogPosts.length === 0 ? (
          <Empty>Bloq yazısı yoxdur.</Empty>
        ) : (
          <ul className="divide-y divide-cream-100">
            {user.blogPosts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 p-3">
                <span className="min-w-0 flex-1">
                  <Link href={`/blog/${p.slug}`} className="block truncate font-medium hover:text-brand-600">
                    {p.title}
                  </Link>
                  <span className="text-xs text-brand-900/50">{fmt(p.createdAt)}</span>
                </span>
                <AdminStatusBadge status={p.status} />
                <Link
                  href={`/admin/blog/${p.id}/edit`}
                  className="rounded-full border border-cream-200 px-3 py-1 text-xs hover:border-brand-300"
                >
                  Redaktə
                </Link>
                <ConfirmDeleteButton action={adminDeleteBlogPostAction} id={p.id} itemName={p.title} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Pets */}
      <Section title="Petlər" count={user.pets.length}>
        {user.pets.length === 0 ? (
          <Empty>Pet yoxdur.</Empty>
        ) : (
          <ul className="divide-y divide-cream-100">
            {user.pets.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 p-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="text-xs text-brand-900/50">
                    {p.breed?.name ?? p.category.name}
                    {p.asBusiness ? ' · biznes' : ''}
                  </span>
                </span>
                <ConfirmDeleteButton action={adminDeletePetAction} id={p.id} itemName={p.name} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
