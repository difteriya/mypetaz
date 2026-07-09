'use client';

import { useActionState } from 'react';
import { Button } from '@mypet/ui';
import { updateProfileAction, changePasswordAction } from '@/lib/settings/actions';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';
const labelClass = 'text-sm font-medium';

export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);
  return (
    <form action={formAction} className="space-y-4 rounded-card bg-white p-5">
      <h2 className="font-semibold text-brand-700">Profil</h2>
      <div className="space-y-1">
        <label className={labelClass}>E-poçt</label>
        <input value={email} disabled className={`${inputClass} opacity-60`} />
      </div>
      <div className="space-y-1">
        <label htmlFor="name" className={labelClass}>
          Ad
        </label>
        <input id="name" name="name" defaultValue={name} required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label htmlFor="phone" className={labelClass}>
          Telefon
        </label>
        <input id="phone" name="phone" defaultValue={phone} className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
      {state?.ok && <p className="text-sm text-badge-sale">{state.ok}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? 'Saxlanılır…' : 'Yadda saxla'}
      </Button>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={formAction} className="space-y-4 rounded-card bg-white p-5">
      <h2 className="font-semibold text-brand-700">Şifrə</h2>
      {hasPassword && (
        <div className="space-y-1">
          <label htmlFor="currentPassword" className={labelClass}>
            Cari şifrə
          </label>
          <input id="currentPassword" name="currentPassword" type="password" className={inputClass} />
        </div>
      )}
      <div className="space-y-1">
        <label htmlFor="newPassword" className={labelClass}>
          Yeni şifrə
        </label>
        <input id="newPassword" name="newPassword" type="password" minLength={8} required className={inputClass} />
      </div>
      {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}
      {state?.ok && <p className="text-sm text-badge-sale">{state.ok}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? 'Saxlanılır…' : 'Şifrəni yenilə'}
      </Button>
    </form>
  );
}
