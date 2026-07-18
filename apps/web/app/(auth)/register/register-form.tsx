'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Button } from '@mypet/ui';
import { registerAction } from '@/lib/actions/auth';

const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 outline-none focus:border-brand-400';

const TYPES = [
  {
    value: 'INDIVIDUAL',
    title: 'Fərdi hesab',
    desc: 'Pet profili, elan, bloq — hamısı pulsuz',
  },
  {
    value: 'BUSINESS',
    title: 'Biznes hesabı',
    desc: 'Mağaza vitrini + biznes elanları və xidmətlər',
  },
] as const;

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);
  const [accountType, setAccountType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <h1 className="text-center text-2xl font-bold text-brand-700">Qeydiyyat</h1>

      <form action={formAction} className="space-y-4">
        {/* Account type choice */}
        <input type="hidden" name="accountType" value={accountType} />
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setAccountType(t.value)}
              className={`rounded-card border p-3 text-left transition-colors ${
                accountType === t.value
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-cream-200 bg-white hover:border-brand-200'
              }`}
            >
              <span className={`block text-sm font-bold ${accountType === t.value ? 'text-brand-700' : 'text-ink'}`}>
                {t.title}
              </span>
              <span className="mt-0.5 block text-xs text-ink/55">{t.desc}</span>
            </button>
          ))}
        </div>

        {accountType === 'BUSINESS' && (
          <div className="space-y-1">
            <label htmlFor="businessName" className="text-sm font-medium">
              Biznes / mağaza adı <span className="text-badge-lostfound">*</span>
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              minLength={2}
              maxLength={100}
              placeholder="Məs. ZooMart"
              className={inputClass}
            />
            <p className="text-xs text-ink/50">
              Qalan məlumatları (ünvan, saatlar, loqo) sonra biznes panelindən tamamlayacaqsınız.
            </p>
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            {accountType === 'BUSINESS' ? 'Əlaqədar şəxsin adı' : 'Ad'}
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            E-poçt
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
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
            className={inputClass}
          />
        </div>

        {state?.error && <p className="text-sm text-badge-lostfound">{state.error}</p>}

        {accountType === 'BUSINESS' && (
          <p className="rounded-lg bg-cream-100 p-3 text-xs text-brand-900/60">
            Mağaza vitrini admin təsdiqindən sonra kataloqda görünür. Phase 1-də pulsuzdur.
          </p>
        )}

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
