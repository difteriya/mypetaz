import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mypet/auth';
import { getMyVetProfile } from '@/lib/vet/data';
import { VET_APP_URL } from '@/lib/vet/urls';
import { VetApplyForm } from './vet-apply-form';

export const metadata: Metadata = { title: 'Baytar hesabı' };

export default async function BecomeVetPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const vet = await getMyVetProfile(session.user.id);

  if (vet) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-bold text-brand-700">Baytar hesabı</h1>
        <div className="rounded-card border border-cream-200 bg-white p-6">
          <p className="font-semibold text-ink">{vet.clinicName}</p>
          {vet.specialty && <p className="text-sm text-ink/60">{vet.specialty}</p>}
          <div className="mt-4">
            {vet.verified ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-badge-sale/15 px-3 py-1 text-sm font-semibold text-badge-sale">
                Təsdiqləndi
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                Admin təsdiqi gözlənilir
              </span>
            )}
          </div>
          {vet.verified && (
            <a
              href={VET_APP_URL}
              className="mt-4 inline-block rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600"
            >
              Vet panelə keç →
            </a>
          )}
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
            ← İdarə panelinə qayıt
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-brand-700">Baytar kimi qeydiyyatdan keç</h1>
      <p className="mb-6 text-sm text-brand-900/60">
        Klinikanızı və ya həkim profilinizi yaradın. Admin təsdiqindən sonra vet.mypet.az panelində
        təyinatları idarə edə və pet sağlamlıq qeydləri əlavə edə biləcəksiniz. Phase 1.5-də pulsuzdur.
      </p>
      <VetApplyForm />
    </main>
  );
}
