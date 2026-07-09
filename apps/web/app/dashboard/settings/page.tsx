import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';
import { ProfileForm, PasswordForm } from './settings-forms';

export const metadata: Metadata = { title: 'Profil ayarları' };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, passwordHash: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-700">Profil ayarları</h1>
      <ProfileForm name={user.name ?? ''} phone={user.phone ?? ''} email={user.email} />
      <PasswordForm hasPassword={Boolean(user.passwordHash)} />
    </div>
  );
}
