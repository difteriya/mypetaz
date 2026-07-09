'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@mypet/ui';
import { registerAction } from '@/lib/actions/auth';

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <h1 className="text-center text-2xl font-bold text-brand-700">Qeydiyyat</h1>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Ad
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400"
          />
        </div>
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
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400"
          />
        </div>

        {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Gözləyin…' : 'Qeydiyyatdan keç'}
        </Button>
      </form>

      <p className="text-center text-sm text-brand-900/70">
        Artıq hesabınız var?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Daxil olun
        </Link>
      </p>
    </div>
  );
}
