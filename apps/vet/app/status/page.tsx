import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { prisma } from '@mypet/db';

const WEB_APP_URL =
  process.env.NEXT_PUBLIC_WEB_APP_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://mypet.az');

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#0f6e61" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 4v5a4 4 0 0 0 8 0V4" />
        <path d="M9 15a5 5 0 0 0 10 0v-2" />
        <circle cx="19" cy="11" r="2" />
      </svg>
      <h1 className="text-2xl font-extrabold text-vteal-700">vet.mypet.az</h1>
      {children}
    </main>
  );
}

export default async function VetStatusPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Shell>
        <p className="text-vink/70">Baytar paneli. Davam etmək üçün mypet.az hesabınızla daxil olun.</p>
        <a
          href={`${WEB_APP_URL}/login`}
          className="rounded-full bg-vteal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-vteal-700"
        >
          Daxil ol
        </a>
      </Shell>
    );
  }

  const vet = await prisma.vetProfile.findUnique({ where: { userId: session.user.id } });
  if (vet?.verified) redirect('/');

  if (!vet) {
    return (
      <Shell>
        <p className="text-vink/70">
          Bu hesab üçün baytar profili yoxdur. Baytar kimi işləmək üçün mypet.az-da profil yaradın.
        </p>
        <a
          href={`${WEB_APP_URL}/become-vet`}
          className="rounded-full bg-vteal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-vteal-700"
        >
          Baytar profili yarat
        </a>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="font-semibold">{vet.clinicName}</p>
      <span className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
        Admin təsdiqi gözlənilir
      </span>
      <p className="max-w-md text-sm text-vink/60">
        Müraciətiniz yoxlanılır. Təsdiqləndikdən sonra bu paneldə təyinatları idarə edə və müayinə
        qeydləri əlavə edə biləcəksiniz.
      </p>
    </Shell>
  );
}
