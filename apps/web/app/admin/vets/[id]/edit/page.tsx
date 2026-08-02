import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@mypet/db';
import { adminUpdateVetAction } from '@/lib/admin/content-actions';
import { AdminEditForm, adminInput, adminLabel } from '@/components/admin/edit-form';

export const metadata: Metadata = { title: 'Baytarı redaktə et' };

export default async function AdminVetEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vet = await prisma.vetProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!vet) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/vets" className="text-sm text-brand-600 hover:underline">
        ← Baytarlar
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-extrabold text-ink">Baytarı redaktə et</h1>
      <p className="mb-6 text-sm text-brand-900/60">
        Sahib:{' '}
        <Link href={`/admin/users/${vet.user.id}`} className="text-brand-600 hover:underline">
          {vet.user.name ?? vet.user.email}
        </Link>
        {vet.verified && (
          <>
            {' · '}
            <Link href={`/vets/${vet.id}`} className="text-brand-600 hover:underline">
              Açıq profil
            </Link>
          </>
        )}
      </p>

      <div className="rounded-card bg-white p-6 ring-1 ring-cream-200">
        <AdminEditForm action={adminUpdateVetAction} id={vet.id}>
          <div className="space-y-1">
            <label htmlFor="clinicName" className={adminLabel}>Klinika / həkim adı</label>
            <input id="clinicName" name="clinicName" required minLength={2} defaultValue={vet.clinicName} className={adminInput} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="specialty" className={adminLabel}>İxtisas</label>
              <input id="specialty" name="specialty" defaultValue={vet.specialty ?? ''} className={adminInput} />
            </div>
            <div className="space-y-1">
              <label htmlFor="licenseNo" className={adminLabel}>Lisenziya №</label>
              <input id="licenseNo" name="licenseNo" defaultValue={vet.licenseNo ?? ''} className={adminInput} />
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className={adminLabel}>Telefon</label>
              <input id="phone" name="phone" defaultValue={vet.phone ?? ''} className={adminInput} />
            </div>
            <div className="space-y-1">
              <label htmlFor="address" className={adminLabel}>Ünvan</label>
              <input id="address" name="address" defaultValue={vet.address ?? ''} className={adminInput} />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="about" className={adminLabel}>Haqqında</label>
            <textarea id="about" name="about" rows={5} defaultValue={vet.about ?? ''} className={adminInput} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="verified" defaultChecked={vet.verified} />
            Təsdiqlənib (vet panelinə və kataloqa çıxış açıqdır)
          </label>
        </AdminEditForm>
      </div>
    </div>
  );
}
