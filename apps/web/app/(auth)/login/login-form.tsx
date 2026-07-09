'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@mypet/ui';
import { loginAction, googleSignIn, facebookSignIn } from '@/lib/actions/auth';

export function LoginForm({
  googleEnabled,
  facebookEnabled,
}: {
  googleEnabled: boolean;
  facebookEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <h1 className="text-center text-2xl font-bold text-brand-700">Daxil ol</h1>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            E-poçt
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Şifrə
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400"
          />
        </div>

        {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Gözləyin…' : 'Daxil ol'}
        </Button>
      </form>

      {(googleEnabled || facebookEnabled) && (
        <div className="space-y-2">
          <div className="text-center text-xs text-brand-900/50">və ya</div>
          {googleEnabled && (
            <form action={googleSignIn}>
              <Button type="submit" variant="secondary" className="w-full">
                Google ilə davam et
              </Button>
            </form>
          )}
          {facebookEnabled && (
            <form action={facebookSignIn}>
              <Button type="submit" variant="secondary" className="w-full">
                Facebook ilə davam et
              </Button>
            </form>
          )}
        </div>
      )}

      <p className="text-center text-sm text-brand-900/70">
        Hesabınız yoxdur?{' '}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Qeydiyyatdan keçin
        </Link>
      </p>
    </div>
  );
}
