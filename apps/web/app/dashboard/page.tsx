import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { Button } from '@mypet/ui';
import { logoutAction } from '@/lib/actions/auth';
import { getUnreadTotal } from '@/lib/messages/data';
import { unreadNotificationCount, listNotifications } from '@/lib/notifications/data';
import { getMyBusiness } from '@/lib/business/data';
import { imageVariant } from '@/lib/images';
import {
  StatCard,
  QuickAction,
  SectionCard,
  CompletenessBar,
  ListingStatusBadge,
  NotificationRow,
  PetStrip,
  PawStatIcon,
  TagIcon,
  HeartIcon,
  ChatIcon,
  BellIcon,
  BlogIcon,
  StoreIcon,
  StethoscopeIcon,
  PlusIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  ArrowIcon,
} from './dashboard-ui';

export const metadata: Metadata = { title: 'İdarə paneli' };

const ACCOUNT_LABEL: Record<string, string> = {
  INDIVIDUAL: 'Fərdi hesab',
  BUSINESS: 'Biznes hesab',
};

function fmtDate(d: Date): string {
  const iso = d.toISOString().slice(0, 10).split('-');
  return `${iso[2]}.${iso[1]}.${iso[0]}`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const uid = session.user.id;

  const now = new Date();
  const [
    user,
    petCount,
    listingGroups,
    favCount,
    unread,
    notif,
    blogCount,
    business,
    recentListings,
    notifications,
    myPets,
    pendingItems,
    vetAppts,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: uid },
      select: { name: true, email: true, phone: true, image: true, role: true, accountType: true, createdAt: true },
    }),
    prisma.pet.count({ where: { ownerId: uid } }),
    prisma.listing.groupBy({ by: ['status'], where: { userId: uid }, _count: { _all: true } }),
    prisma.favorite.count({ where: { userId: uid } }),
    getUnreadTotal(uid),
    unreadNotificationCount(uid),
    prisma.blogPost.count({ where: { userId: uid } }),
    getMyBusiness(uid),
    prisma.listing.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, slug: true, title: true, status: true, createdAt: true },
    }),
    listNotifications(uid),
    prisma.pet.findMany({
      where: { ownerId: uid },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, slug: true, name: true, images: { orderBy: { order: 'asc' }, take: 1, select: { url: true, alt: true } } },
    }),
    prisma.listing.findMany({
      where: { userId: uid, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, slug: true, title: true, createdAt: true },
    }),
    prisma.vetAppointment.findMany({
      where: { requesterUserId: uid, date: { gte: now }, status: { in: ['REQUEST', 'CONFIRMED'] } },
      orderBy: { date: 'asc' },
      take: 5,
      select: { id: true, date: true, status: true, pet: { select: { name: true } }, vet: { select: { clinicName: true } } },
    }),
  ]);

  const listingCount = listingGroups.reduce((s, g) => s + g._count._all, 0);
  const activeListings = listingGroups.find((g) => g.status === 'ACTIVE')?._count._all ?? 0;
  const pendingCount = listingGroups.find((g) => g.status === 'PENDING')?._count._all ?? 0;
  const recentNotifications = notifications.slice(0, 5);

  const isBusiness = user.accountType === 'BUSINESS' || Boolean(business);
  const displayName = user.name ?? user.email;
  const initial = (user.name ?? user.email)?.trim()[0]?.toUpperCase() ?? '?';

  // Profile completeness (5 checks).
  const checks = [
    Boolean(user.name),
    Boolean(user.phone),
    Boolean(user.image),
    petCount > 0,
    listingCount > 0,
  ];
  const doneCount = checks.filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-card bg-gradient-to-br from-brand-500 to-brand-400 p-6 text-white shadow-soft">
        <div className="flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={displayName} className="size-16 rounded-full border-2 border-white/70 object-cover" />
          ) : (
            <span className="grid size-16 place-items-center rounded-full bg-white/20 text-2xl font-bold">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">Xoş gəldin, {displayName}!</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium">{ACCOUNT_LABEL[user.accountType]}</span>
              {user.role === 'ADMIN' && <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium">Admin</span>}
              <span className="inline-flex items-center gap-1 text-white/80">
                <CalendarIcon /> {fmtDate(user.createdAt)}-dən üzv
              </span>
            </div>
          </div>
        </div>
        {(unread > 0 || notif > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {unread > 0 && (
              <Link href="/messages" className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium hover:bg-white/25">
                {unread} oxunmamış mesaj →
              </Link>
            )}
            {notif > 0 && (
              <Link href="/dashboard/notifications" className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium hover:bg-white/25">
                {notif} yeni bildiriş →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Pending-listings reminder */}
      {pendingCount > 0 && (
        <section className="rounded-card border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-amber-800">
              <b>{pendingCount}</b> elanınız admin təsdiqini gözləyir — təsdiqlənənə qədər kataloqda görünmür.
            </p>
            <Link href="/dashboard/listings" className="text-sm font-semibold text-amber-800 hover:underline">
              Elanlara bax →
            </Link>
          </div>
          {pendingItems.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-amber-800/80">
              {pendingItems.map((l) => (
                <li key={l.id} className="truncate">• {l.title}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={<PawStatIcon />} label="Petlərim" value={petCount} href="/pets" tone="coral" />
        <StatCard
          icon={<TagIcon />}
          label="Elanlarım"
          value={listingCount}
          sub={pendingCount > 0 ? `${pendingCount} gözləyir` : `${activeListings} aktiv`}
          href="/dashboard/listings"
          tone="teal"
        />
        <StatCard icon={<HeartIcon />} label="Seçilmişlər" value={favCount} href="/dashboard/favorites" tone="pink" />
        <StatCard icon={<ChatIcon />} label="Mesajlar" value={unread} sub={unread > 0 ? 'yeni' : undefined} href="/messages" tone="teal" />
        <StatCard icon={<BellIcon />} label="Bildirişlər" value={notif} sub={notif > 0 ? 'yeni' : undefined} href="/dashboard/notifications" tone="purple" />
        <StatCard icon={<BlogIcon />} label="Bloq yazılarım" value={blogCount} href="/dashboard/blog" tone="coral" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <QuickAction icon={<PlusIcon />} label="Yeni pet" href="/pets/new" />
        <QuickAction icon={<PlusIcon />} label="Elan yerləşdir" href="/post-listing" />
        <QuickAction icon={<PlusIcon />} label="Bloq yaz" href="/write-post" />
        <QuickAction
          icon={<StoreIcon />}
          label={isBusiness ? 'Biznesi idarə et' : 'Biznes hesabı aç'}
          href={isBusiness ? '/dashboard/business' : '/become-business'}
        />
      </div>

      {/* Pets image strip */}
      {myPets.length > 0 && (
        <SectionCard
          title="Petlərim"
          action={
            <Link href="/pets" className="text-sm font-medium text-brand-600 hover:underline">
              Hamısı
            </Link>
          }
        >
          <PetStrip pets={myPets} />
        </SectionCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile summary */}
        <SectionCard
          title="Profil"
          action={
            <Link href="/dashboard/settings" className="text-sm font-medium text-brand-600 hover:underline">
              Redaktə et
            </Link>
          }
        >
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-ink/40"><MailIcon /></span>
              <span className="text-ink/80">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-ink/40"><PhoneIcon /></span>
              {user.phone ? (
                <span className="text-ink/80">{user.phone}</span>
              ) : (
                <Link href="/dashboard/settings" className="text-brand-600 hover:underline">
                  Telefon nömrəsi əlavə et
                </Link>
              )}
            </div>
          </dl>
          <div className="mt-4 border-t border-cream-200 pt-4">
            <CompletenessBar done={doneCount} total={checks.length} />
            {doneCount < checks.length && (
              <ul className="mt-3 space-y-1 text-sm text-ink/60">
                {!user.image && <li>• Profil şəkli əlavə edin</li>}
                {!user.phone && <li>• Telefon nömrəsi əlavə edin</li>}
                {petCount === 0 && <li>• İlk petinizi əlavə edin</li>}
                {listingCount === 0 && <li>• İlk elanınızı yerləşdirin</li>}
              </ul>
            )}
          </div>
        </SectionCard>

        {/* Recent listings */}
        <SectionCard
          title="Son elanlarım"
          action={
            listingCount > 0 ? (
              <Link href="/dashboard/listings" className="text-sm font-medium text-brand-600 hover:underline">
                Hamısı
              </Link>
            ) : undefined
          }
        >
          {recentListings.length === 0 ? (
            <div className="py-6 text-center text-sm text-ink/50">
              <p>Hələ elanınız yoxdur.</p>
              <Link href="/post-listing" className="mt-2 inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">
                İlk elanı yerləşdir <ArrowIcon />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-cream-200">
              {recentListings.map((l) => (
                <li key={l.id}>
                  <Link href={`/listings/${l.slug}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-brand-600">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{l.title}</span>
                      <span className="text-xs text-ink/50">{fmtDate(l.createdAt)}</span>
                    </span>
                    <ListingStatusBadge status={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Notifications feed + Vet appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Son bildirişlər"
          action={
            <Link href="/dashboard/notifications" className="text-sm font-medium text-brand-600 hover:underline">
              Hamısı
            </Link>
          }
        >
          {recentNotifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/50">Hələ bildiriş yoxdur.</p>
          ) : (
            <div className="divide-y divide-cream-200">
              {recentNotifications.map((n) => (
                <NotificationRow key={n.id} message={n.message} createdAt={n.createdAt} link={n.link} read={n.read} />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Vet təyinatları">
          {vetAppts.length === 0 ? (
            <div className="py-6 text-center text-sm text-ink/50">
              <span className="mx-auto mb-2 grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-600">
                <StethoscopeIcon />
              </span>
              <p>Yaxın vet təyinatı yoxdur.</p>
            </div>
          ) : (
            <ul className="divide-y divide-cream-200">
              {vetAppts.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{a.pet.name}</span>
                    <span className="text-xs text-ink/50">{a.vet.clinicName}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm text-ink/80">
                      {a.date.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <span className={`text-xs ${a.status === 'CONFIRMED' ? 'text-badge-sale' : 'text-amber-600'}`}>
                      {a.status === 'CONFIRMED' ? 'Təsdiqləndi' : 'Gözləmədə'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Business */}
      {business && (
        <SectionCard
          title="Biznesim"
          action={
            <Link href="/dashboard/business" className="text-sm font-medium text-brand-600 hover:underline">
              İdarə et
            </Link>
          }
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><StoreIcon /></span>
              <div>
                <p className="font-semibold text-ink">{business.name}</p>
                <p className="text-xs text-ink/50">
                  {business.status === 'ACTIVE' ? 'Yayımda' : business.status === 'PENDING' ? 'Admin təsdiqi gözlənilir' : 'Rədd edilib'}
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <span><b className="text-ink">{business.viewCount}</b> <span className="text-ink/50">baxış</span></span>
              <span><b className="text-ink">{business.avgRating?.toFixed(1) ?? '—'}</b> <span className="text-ink/50">reytinq ({business.reviewCount})</span></span>
            </div>
            {business.status === 'ACTIVE' && (
              <Link href={`/business/${business.slug}`} className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                Storefront-a bax <ArrowIcon />
              </Link>
            )}
          </div>
        </SectionCard>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-3 pt-2">
        {user.role === 'ADMIN' && (
          <Link href="/admin">
            <Button>Admin panel</Button>
          </Link>
        )}
        <form action={logoutAction}>
          <Button type="submit" variant="secondary">
            Çıxış
          </Button>
        </form>
      </div>
    </div>
  );
}
